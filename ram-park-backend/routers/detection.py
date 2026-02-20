from fastapi import APIRouter, UploadFile, File, HTTPException
from firebase_config import db, bucket
from datetime import datetime
import random

router = APIRouter()

PHOTO_ENABLED_LOTS = {"lot15", "lot15A"}

@router.post("/upload/{lot_id}")
async def process_photo(lot_id: str, file: UploadFile = File(...)):
    # Only allow photo uploads for lot15 and lot15A
    if lot_id not in PHOTO_ENABLED_LOTS:
        raise HTTPException(status_code=400, detail="Photo upload enabled only for lot15 and lot15A")

    # 1) Save file to Firebase Storage
    content = await file.read()
    blob = bucket.blob(f"uploads/{lot_id}/{datetime.utcnow().isoformat()}_{file.filename}")
    blob.upload_from_string(content, content_type=file.content_type)

    # 2) Simulate detection by randomly toggling spot statuses
    spots_stream = db.collection("lots").document(lot_id).collection("spots").stream()
    spots = list(spots_stream)

    if len(spots) == 0:
        raise HTTPException(status_code=400, detail=f"No spots found for {lot_id}. Seed spots first.")

    for s in spots:
        new_status = random.choice(["available", "occupied"])
        db.collection("lots").document(lot_id).collection("spots").document(s.id).update({
            "status": new_status,
            "updatedAt": datetime.now().astimezone().isoformat()
        })

    # 3) Re-read spots to compute occupancy percent based on updated statuses
    updated_spots = list(db.collection("lots").document(lot_id).collection("spots").stream())
    total = len(updated_spots)
    occupied = sum(1 for sp in updated_spots if sp.to_dict().get("status") == "occupied")
    photo_percent = int(round((occupied / total) * 100))

    # 4) Save photoOccupancy to the lot document
    db.collection("lots").document(lot_id).update({
        "photoOccupancy": photo_percent,
        "lastPhotoAt": datetime.now().astimezone().isoformat(),
        "lastPhotoFilename": file.filename
    })

    return {
        "message": "Photo processed, spot statuses updated, photoOccupancy saved.",
        "lotId": lot_id,
        "totalSpots": total,
        "occupiedSpots": occupied,
        "photoOccupancy": photo_percent
    }