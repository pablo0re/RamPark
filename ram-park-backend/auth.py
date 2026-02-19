from fastapi import HTTPException, Depends, Header
from firebase_config import auth, db

async def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    id_token = authorization.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        email = decoded_token.get("email")

        # Requirement: @farmingdale.edu only
        if not email.endswith("@farmingdale.edu"):
            raise HTTPException(status_code=403, detail="Access restricted to @farmingdale.edu emails")
        
        return decoded_token
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_admin(user=Depends(verify_token)):
    user_doc = db.collection("users").document(user["uid"]).get()
    if not user_doc.exists or user_doc.to_dict().get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user