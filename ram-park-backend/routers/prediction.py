from fastapi import APIRouter
from firebase_config import db
from datetime import datetime, timedelta
from collections import defaultdict
import math

router = APIRouter()

# --- helpers ---
def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1-a))

def occupancy_color(percent: int) -> str:
    if percent >= 76: return "red"
    if percent >= 51: return "orange"
    if percent >= 26: return "yellow"
    return "green"

def parse_iso(dt_str: str) -> datetime:
    # Python 3.11+ supports fromisoformat with offsets
    return datetime.fromisoformat(dt_str)

def pick_closest_lot(building_lat, building_lng, lots, allowed_lot_type: str):
    best = None
    best_d = float("inf")
    for lot in lots:
        if lot.get("type") != allowed_lot_type:
            continue
        d = haversine_m(building_lat, building_lng, lot["lat"], lot["lng"])
        if d < best_d:
            best_d = d
            best = lot
    return best

@router.post("/recompute")
async def recompute_all_lots():
    """
    Recomputes predicted occupancy for ALL lots based on schedules.
    Photo adjustment will apply only for lot15 and lot15A (if photoOccupancy exists).
    """

    now = datetime.now().astimezone()  # local timezone

    # --- Load lots ---
    lots_docs = list(db.collection("lots").stream())
    lots = []
    for d in lots_docs:
        lot = d.to_dict()
        lot["id"] = d.id
        # Make sure these fields exist in Firestore for each lot
        # type should be "student", "staff", "visitor" (your choice)
        lots.append(lot)

    # --- Load buildings ---
    building_docs = db.collection("buildings").stream()
    buildings = {b.id: b.to_dict() for b in building_docs}

    # --- Load schedules (for today) ---
    # For now we will load all schedules and filter by date range in code
    schedule_docs = db.collection("schedules").stream()

    by_user = defaultdict(list)
    for s in schedule_docs:
        data = s.to_dict()
        try:
            st = parse_iso(data["startTime"])
            en = parse_iso(data["endTime"])
        except Exception:
            continue

        # Only consider schedules within the next 24 hours for now
        if en < now - timedelta(hours=6) or st > now + timedelta(hours=24):
            continue

        by_user[data["userId"]].append({
            "building": data["building"],
            "start": st,
            "end": en
        })

    # --- Compute cars in each lot based on "park once, stay between classes" ---
    cars_in_lot = defaultdict(float)

    for user_id, classes in by_user.items():
        classes.sort(key=lambda x: x["start"])
        first = classes[0]
        last = classes[-1]

        arrival = first["start"] - timedelta(minutes=30)
        departure = last["end"]  # or + timedelta(minutes=10)

        if not (arrival <= now <= departure):
            continue

        building_name = first["building"]
        b = buildings.get(building_name)
        if not b:
            continue

        chosen = pick_closest_lot(b["lat"], b["lng"], lots, allowed_lot_type="student")
        if not chosen:
            continue

        # Count 1 car for this student
        cars_in_lot[chosen["id"]] += 1.0

    # --- Update each lot’s predicted occupancy ---
    for lot in lots:
        lot_id = lot["id"]
        capacity = int(lot.get("totalCapacity", 0)) or 1

        schedule_cars = cars_in_lot.get(lot_id, 0.0)
        schedule_percent = int(round(min(100, (schedule_cars / capacity) * 100)))

        # Apply photo adjustment only for lot15 and lot15A (if available)
        # detection.py should write photoOccupancy (0-100)
        if lot_id in ["lot15", "lot15A"] and lot.get("photoOccupancy") is not None:
            photo_percent = int(lot["photoOccupancy"])
            final_percent = int(round(0.6 * schedule_percent + 0.4 * photo_percent))
        else:
            final_percent = schedule_percent

        db.collection("lots").document(lot_id).update({
            "predictedOccupancy": final_percent,
            "occupancyColor": occupancy_color(final_percent),
            "lastPredictedAt": now.isoformat(),
            "scheduleOccupancy": schedule_percent
        })

    return {"status": "ok", "updatedLots": len(lots)}