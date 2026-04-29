from fastapi import APIRouter
from firebase_config import db

router = APIRouter()

@router.get("/lots")
async def get_all_lots():
    lots_ref = db.collection("lots").stream()
    lots = []
    for lot in lots_ref:
        data = lot.to_dict()
        data["id"] = lot.id
        occ = data.get("predictedOccupancy", 0)

        color = "green"
        if occ > 75:
            color = "red"
        elif occ > 50:
            color = "orange"
        elif occ > 25:
            color = "yellow"

        data["occupancyColor"] = color
        lots.append(data)

    return lots

@router.get("/lots/{lot_id}/spots")
async def get_lot_spots(lot_id: str):
    spots_ref = db.collection("lots").document(lot_id).collection("spots").stream()
    return [spot.to_dict() for spot in spots_ref]

@router.post("/lots/{lot_id}/occupy")
async def occupy_lot(lot_id: str):
    lot_ref = db.collection("lots").document(lot_id)
    lot = lot_ref.get()
    if not lot.exists:
        return {"error": "Lot not found"}
    data = lot.to_dict()
    total = data.get("totalCapacity", 1)
    current_occ = data.get("predictedOccupancy", 0)
    new_occ = min(100, round(current_occ + (1 / total * 100)))
    lot_ref.update({"predictedOccupancy": new_occ})
    return {"lot_id": lot_id, "predictedOccupancy": new_occ}

@router.post("/lots/{lot_id}/vacate")
async def vacate_lot(lot_id: str):
    lot_ref = db.collection("lots").document(lot_id)
    lot = lot_ref.get()
    if not lot.exists:
        return {"error": "Lot not found"}
    data = lot.to_dict()
    total = data.get("totalCapacity", 1)
    current_occ = data.get("predictedOccupancy", 0)
    new_occ = max(0, round(current_occ - (1 / total * 100)))
    lot_ref.update({"predictedOccupancy": new_occ})
    return {"lot_id": lot_id, "predictedOccupancy": new_occ}