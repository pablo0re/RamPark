from fastapi import APIRouter
import math

router = APIRouter()

def get_distance(lat1, lon1, lat2, lon2):
    # Simplified Haversine or use Google Distance Matrix API
    return math.sqrt((lat1-lat2)**2 + (lon1-lon2)**2)

@router.post("/suggest")
async def recommend_lot(req: RecommendationRequest):
    # 1. Fetch buildings coordinates (Mocked)
    building_coords = {"Lupton Hall": (40.751, -73.428)} 
    target = building_coords.get(req.building, (40.752, -73.430))

    # 2. Logic: Find lot where (predictedOccupancy < 80%) AND distance is minimum
    # 3. Apply the Weight Formula for prediction
    # weight_occ = (density * 0.4) + (photo_detect * 0.4) + (hist_avg * 0.2)
    
    return {
        "recommendedLot": "lot15",
        "reason": "Closest available student lot with 40% predicted occupancy.",
        "walkingTime": "4 mins"
    }