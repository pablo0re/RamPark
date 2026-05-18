from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from firebase_config import db
from auth import verify_token
from datetime import datetime
from google.cloud.firestore_v1.base_query import FieldFilter
import requests, math, json, os, base64
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

router = APIRouter()

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl   = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def get_building_coords(building_name: str):
    doc = db.collection("buildings").document(building_name).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    return {"lat": data["lat"], "lng": data["lng"]}

def get_weather():
    try:
        res = requests.get(
            "https://api.open-meteo.com/v1/forecast"
            "?latitude=40.7529&longitude=-73.4302"
            "&current_weather=true"
            "&hourly=precipitation_probability",
            timeout=5
        )
        data = res.json()
        w = data["current_weather"]
        precip = data["hourly"]["precipitation_probability"][0]
        return {
            "temp_c": w["temperature"],
            "wind_kph": w["windspeed"],
            "is_raining": precip > 50,
            "precip_chance": precip
        }
    except Exception:
        return None

def count_crowd(building: str, start_time: str, today: str) -> int:
    try:
        docs = db.collection_group("classes") \
                 .where(filter=FieldFilter("building", "==", building)) \
                 .where(filter=FieldFilter("days", "array_contains", today)) \
                 .stream()
        count = 0
        for doc in docs:
            d = doc.to_dict()
            if d.get("startTime", "99:99") <= start_time:
                count += 1
        return count
    except Exception:
        return 0


@router.post("/suggest")
async def suggest_lots(user=Depends(verify_token)):
    user_id = user["uid"]
    now     = datetime.now()
    today   = now.strftime("%a")
    current_time = now.strftime("%H:%M")

    classes_ref = db.collection("schedules").document(user_id) \
                    .collection("classes") \
                    .where(filter=FieldFilter("days", "array_contains", today)) \
                    .stream()
    classes_today = [doc.to_dict() for doc in classes_ref]

    if not classes_today:
        return {"message": "No classes today", "recommendations": []}

    classes_today.sort(key=lambda x: x["startTime"])
    first_class   = classes_today[0]
    building_name = first_class["building"]

    building = get_building_coords(building_name)
    if not building:
        raise HTTPException(status_code=404, detail=f"Building '{building_name}' not in Firestore")

    lot_docs = db.collection("lots").stream()
    lots = []
    for doc in lot_docs:
        d      = doc.to_dict()
        d["id"] = doc.id

        if "lat" not in d or "lng" not in d:
            continue

        dist      = haversine_m(building["lat"], building["lng"], d["lat"], d["lng"])
        predicted = d.get("predictedOccupancy", 0)
        live      = d.get("liveOccupancyPercent", 0)
        blended   = int(round(0.4 * predicted + 0.6 * live)) if live > 0 else predicted

        lots.append({
            "id":                d["id"],
            "name":              d.get("name", d["id"]),
            "type":              d.get("type", "student"),
            "distance_m":        round(dist),
            "occupancy_percent": blended,
            "capacity":          d.get("totalCapacity", 0),
        })

    weather = get_weather()
    crowd   = count_crowd(building_name, first_class["startTime"], today)

    try:
        h, m = map(int, first_class["startTime"].split(":"))
        class_start_mins = h * 60 + m
        now_mins         = now.hour * 60 + now.minute
        mins_until_class = class_start_mins - now_mins
    except Exception:
        mins_until_class = 60

    prompt = f"""
You are a smart parking assistant for Farmingdale State College (FSC) on Long Island, NY.

A student has their first class at {building_name} starting at {first_class['startTime']} ({today}).
Current time: {current_time}. Minutes until class: {mins_until_class}.

Available parking lots (distance measured from {building_name}):
{json.dumps(lots, indent=2)}

Context:
- Other students heading to {building_name} right now: {crowd}
- Weather: {json.dumps(weather) if weather else 'unavailable'}
- Day of week: {today}

Ranking rules to follow:
1. If class is < 15 minutes away, heavily weight distance — student needs the closest spot
2. If raining, students crowd the nearest lot — boost occupancy estimate for closest lots
3. Crowd pressure means the closest lot to this building fills faster than occupancy shows
4. A lot at 80%+ occupancy is risky — warn the student
5. Balance distance vs occupancy — a slightly farther empty lot beats a close full one

Return ONLY a valid JSON array of exactly 3 lots. Each object must have:
- "id": lot document id
- "rank": 1, 2, or 3
- "reason": one sentence why this lot is recommended
- "warning": one sentence concern, or null if none

No markdown. No explanation. Raw JSON array only.
"""

    try:
        if not openai_client:
            raise RuntimeError("OPENAI_API_KEY is not configured")

        resp = openai_client.responses.create(
            model="gpt-5.2",
            input=prompt,
            max_output_tokens=600,
        )
        print("OPENAI RESPONSE:", resp.output_text)
        ranked = json.loads(resp.output_text)
    except Exception as e:
        print("OPENAI FAILED, USING FALLBACK:", e)
        ranked = [
            {
                "id": l["id"],
                "rank": i + 1,
                "reason": f"{l['distance_m']}m away, {l['occupancy_percent']}% full",
                "warning": None
            }
            for i, l in enumerate(sorted(lots, key=lambda x: x["distance_m"])[:3])
        ]

    lot_map = {l["id"]: l for l in lots}
    results = []
    for r in ranked:
        lot_data = lot_map.get(r["id"], {})
        results.append({**lot_data, **r})

    return {
        "firstClass":      first_class,
        "allClassesToday": classes_today,
        "weather":         weather,
        "crowdPressure":   crowd,
        "minsUntilClass":  mins_until_class,
        "recommendations": results
    }


@router.post("/extract-schedule")
async def extract_schedule_from_pdf(file: UploadFile = File(...)):
    """
    Accepts a PDF or image, sends to Claude, returns extracted schedule as JSON.
    """
    content = await file.read()
    b64 = base64.b64encode(content).decode("utf-8")

    is_pdf = file.content_type == "application/pdf" or (file.filename or "").endswith(".pdf")
    media_type = "application/pdf" if is_pdf else (file.content_type or "image/jpeg")
    doc_type = "document" if is_pdf else "image"

    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1500,
            "messages": [{
                "role": "user",
                "content": [
                    {
                        "type": doc_type,
                        "source": {"type": "base64", "media_type": media_type, "data": b64}
                    },
                    {
                        "type": "text",
                        "text": """Extract the class schedule. Return ONLY a valid JSON array. Each object must have:
- "id": unique string like "pdf-1", "pdf-2"
- "course": course code and name e.g. "BCS 300 · Management Information Systems"
- "building": building name only e.g. "Whitman Hall"
- "room": room number as string
- "startTime": 24-hour format "HH:MM"
- "endTime": 24-hour format "HH:MM"
- "days": array using ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
Skip online courses. No markdown. Raw JSON array only."""
                    }
                ]
            }]
        },
        timeout=30
    )

    resp_json = resp.json()
    
    # Check for API errors
    print("ANTHROPIC RESPONSE:", resp_json)  # debug
    
    if "error" in resp_json:
        raise HTTPException(status_code=500, detail=f"Anthropic API error: {resp_json['error']}")
    
    if "content" not in resp_json:
        raise HTTPException(status_code=500, detail=f"Unexpected response: {str(resp_json)}")
    
    raw = resp_json["content"][0]["text"]
    classes = json.loads(raw.replace("```json", "").replace("```", "").strip())
    return {"classes": classes}
