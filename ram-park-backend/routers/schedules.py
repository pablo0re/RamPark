from fastapi import APIRouter, Depends, HTTPException
from firebase_config import db
from auth import verify_token
from datetime import datetime
from pydantic import BaseModel
from typing import List

router = APIRouter()

class UploadedClass(BaseModel):
    id: str
    course: str
    building: str
    room: str = ""
    startTime: str   # "09:25" (24hr)
    endTime: str     # "10:40"
    days: List[str]  # ["Mon", "Wed"]

class ScheduleUpload(BaseModel):
    uploadedAt: str
    sourceType: str
    term: str = ""
    classes: List[UploadedClass]

@router.post("/upload")
async def upload_schedule(payload: ScheduleUpload, user=Depends(verify_token)):
    user_id = user["uid"]
    
    # Store the full schedule JSON as one doc
    db.collection("schedules").document(user_id).set({
        "uploadedAt": payload.uploadedAt,
        "sourceType": payload.sourceType,
        "term": payload.term,
        "userId": user_id,
        "updatedAt": datetime.now().isoformat()
    })

    # Store each class in a subcollection
    classes_ref = db.collection("schedules").document(user_id).collection("classes")
    
    # Clear old classes first
    for doc in classes_ref.stream():
        doc.reference.delete()
    
    for cls in payload.classes:
        classes_ref.document(cls.id).set(cls.dict())

    return {"status": "ok", "classesUploaded": len(payload.classes)}