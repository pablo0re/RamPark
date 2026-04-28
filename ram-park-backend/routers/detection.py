from fastapi import APIRouter, UploadFile, File, HTTPException
from firebase_config import db, bucket
from datetime import datetime
import random

router = APIRouter()

PHOTO_ENABLED_LOTS = {"lot15", "lot15A"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

@router.post("/upload/{lot_id}")
async def process_photo(lot_id: str, file: UploadFile = File(...)):
    if lot_id not in PHOTO_ENABLED_LOTS:
        raise HTTPException(status_code=400, detail="Photo upload enabled only for lot15 and lot15A")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

    try:
        content = await file.read()
        blob = bucket.blob(f"uploads/{lot_id}/{datetime.utcnow().isoformat()}_{file.filename}")
        blob.upload_from_string(content, content_type=file.content_type)

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

        updated_spots = list(db.collection("lots").document(lot_id).collection("spots").stream())
        total = len(updated_spots)
        occupied = sum(1 for sp in updated_spots if sp.to_dict().get("status") == "occupied")
        photo_percent = int(round((occupied / total) * 100))

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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Photo processing failed: {str(e)}")