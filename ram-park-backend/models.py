from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    name: str
    email: str
    role: str # student, guest, admin

class ParkingSpot(BaseModel):
    id: str
    row: str
    type: str # student, staff, handicap
    status: str # available, occupied

class ParkingLot(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    totalCapacity: int
    predictedOccupancy: int # 0-100
    occupancyColor: str # green, yellow, orange, red

class RecommendationRequest(BaseModel):
    className: str
    building: str
    startTime: str
    endTime: str