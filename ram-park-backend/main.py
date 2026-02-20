from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import parking, admin, recommendations, detection, prediction

app = FastAPI(title="Ram Park API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update to Vercel URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parking.router, prefix="/parking", tags=["Parking"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(recommendations.router, prefix="/recommend", tags=["Recommendation"])
app.include_router(detection.router, prefix="/detect", tags=["AI Simulation"])
app.include_router(prediction.router, prefix="/predict", tags=["Prediction"])

@app.get("/")
def home():
    return {"status": "Ram Park System Online"}