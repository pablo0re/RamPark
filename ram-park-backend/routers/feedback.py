from fastapi import APIRouter, Depends, HTTPException
from firebase_config import db
from auth import verify_token
from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

router = APIRouter()

class DifficultyFeedback(BaseModel):
    lotId: str = Field(..., min_length=1)
    difficulty: Literal["easy", "medium", "hard"]
    experienceText: str = Field(..., min_length=3, max_length=1000)

class LotRating(BaseModel):
    lotId: str
    rating: int  # 1 to 5

@router.post("/difficulty")
async def submit_difficulty(req: DifficultyFeedback, user=Depends(verify_token)):
    uid = user["uid"]
    feedback_data = {
        "userId": uid,
        "lotId": req.lotId,
        "difficulty": req.difficulty,
        "experienceText": req.experienceText,
        "submittedAt": datetime.now().astimezone().isoformat()
    }
    db.collection("feedback").add(feedback_data)
    return {
        "message": "Feedback submitted successfully.",
        "feedback": feedback_data,
    }

@router.post("/rate")
async def rate_lot(req: LotRating, user=Depends(verify_token)):
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    uid = user["uid"]
    db.collection("ratings").add({
        "userId": uid,
        "lotId": req.lotId,
        "rating": req.rating,
        "submittedAt": datetime.now().astimezone().isoformat()
    })
    ratings_ref = db.collection("ratings").where("lotId", "==", req.lotId).stream()
    all_ratings = [r.to_dict().get("rating", 0) for r in ratings_ref]
    avg = round(sum(all_ratings) / len(all_ratings), 2) if all_ratings else req.rating
    if all_ratings:
        db.collection("lots").document(req.lotId).update({"averageRating": avg})
    return {"message": "Rating submitted.", "lotId": req.lotId, "newAverage": avg}