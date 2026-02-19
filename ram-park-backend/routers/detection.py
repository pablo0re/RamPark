from fastapi import APIRouter, UploadFile, File
from firebase_config import db, bucket
import random

router = APIRouter()

@router.post("/upload/{lot_id}")
async def process_photo(lot_id: str, file: UploadFile = File(...)):
    # 1. Save to Firebase Storage
    blob = bucket.blob(f"uploads/{lot_id}/{file.filename}")
    blob.upload_from_string(await file.read(), content_type=file.content_type)

    # 2. Simulate Detection (Mock Logic)
    # In a real app, send to an AI model. Here, we randomly toggle spots.
    spots_ref = db.collection("lots").document(lot_id).collection("spots").stream()
    for spot in spots_ref:
        new_status = random.choice(["available", "occupied"])
        db.collection("lots").document(lot_id).collection("spots").document(spot.id).update({
            "status": new_status
        })
    
    return {"message": "Occupancy updated based on photo detection."}