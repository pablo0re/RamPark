from fastapi import APIRouter, Depends
from firebase_config import db
from auth import verify_admin

router = APIRouter()

# Admin can update lot capacity
@router.put("/lots/{lot_id}/capacity")
async def update_capacity(lot_id: str, new_capacity: int, user=Depends(verify_admin)):
    db.collection("lots").document(lot_id).update({
        "totalCapacity": new_capacity
    })
    return {"message": f"Capacity updated for {lot_id}"}

# Admin can manually override predicted occupancy
@router.put("/lots/{lot_id}/occupancy")
async def update_occupancy(lot_id: str, new_occupancy: int, user=Depends(verify_admin)):
    db.collection("lots").document(lot_id).update({
        "predictedOccupancy": new_occupancy
    })
    return {"message": f"Occupancy updated for {lot_id}"}