from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    name: str
    email: str
    role: str  # student, guest, admin


class ParkingSpot(BaseModel):
    id: str
    row: str
    type: str  # student, staff, handicap
    status: str  # available, occupied


class ParkingLot(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    totalCapacity: int
    predictedOccupancy: int
    occupancyColor: str
    photoOccupancy: Optional[int] = None
    hasEvChargers: Optional[bool] = False
    evChargersTotal: Optional[int] = 0
    evChargersAvailable: Optional[int] = 0


class RecommendationRequest(BaseModel):
    className: str
    building: str
    startTime: str
    endTime: str


class ValetRequestCreate(BaseModel):
    userId: str
    studentName: str
    phoneNumber: str
    pickupLocation: str
    requestedTime: str
    userEmail: Optional[str] = None
    preferredLotId: Optional[str] = None
    preferredLotName: Optional[str] = None
    notes: Optional[str] = None


class ValetApproval(BaseModel):
    valetName: str
    valetPhone: str
    
class ValetParkedUpdate(BaseModel):
    assignedLotName: str

class ValetReturnRequest(BaseModel):
    returnLocation: str
    returnTime: str
    returnMessage: Optional[str] = None


class ReservationCreate(BaseModel):
    userId: str
    studentName: str
    lotId: Optional[str] = None
    arrivalTime: str
    durationMinutes: int = 15
    className: Optional[str] = None


class ReservationCancel(BaseModel):
    reservationId: str
