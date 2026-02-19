from fastapi import APIRouter, Depends
from firebase_config import db
# from auth import verify_token

router = APIRouter()

@router.get("/lots")
async def get_all_lots():
    lots_ref = db.collection("lots").stream()
    lots = []
    for lot in lots_ref:
        data = lot.to_dict()
        # Logic for occupancy color
        occ = data.get("predictedOccupancy", 0)
        color = "green"
        if occ > 75: color = "red"
        elif occ > 50: color = "orange"
        elif occ > 25: color = "yellow"
        
        data["occupancyColor"] = color
        lots.append(data)
    return lots

@router.get("/lots/{lot_id}/spots")
async def get_lot_spots(lot_id: str):
    # Only lot15 and lot15A have individual spot tracking
    spots_ref = db.collection("lots").document(lot_id).collection("spots").stream()
    return [spot.to_dict() for spot in spots_ref]