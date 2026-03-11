from fastapi import APIRouter, Depends, HTTPException
from firebase_config import auth, db
from auth import verify_token

router = APIRouter()

@router.delete("/account")
async def delete_account(user=Depends(verify_token)):
    uid = user["uid"]
    try:
        db.collection("users").document(uid).delete()
        auth.delete_user(uid)
        return {"message": "Account successfully deleted."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")