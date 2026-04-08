from fastapi import APIRouter, HTTPException
from firebase_config import db
from models import ReservationCreate, ReservationCancel
from datetime import datetime, timedelta

router = APIRouter()


def find_best_lot(preferred_lot_id=None):
    lots = list(db.collection("lots").stream())
    if not lots:
        return None

    if preferred_lot_id:
        preferred_ref = db.collection("lots").document(preferred_lot_id).get()
        if preferred_ref.exists:
            lot = preferred_ref.to_dict()
            return {
                "id": preferred_ref.id,
                "name": lot.get("name", preferred_ref.id),
                "predictedOccupancy": lot.get("predictedOccupancy", 0)
            }

    best_lot = None
    best_occ = 101

    for lot_doc in lots:
        lot = lot_doc.to_dict()
        occ = lot.get("predictedOccupancy", 100)
        if occ < best_occ:
            best_occ = occ
            best_lot = {
                "id": lot_doc.id,
                "name": lot.get("name", lot_doc.id),
                "predictedOccupancy": occ
            }

    return best_lot


@router.post("/create")
async def create_reservation(payload: ReservationCreate):
    assigned_lot = find_best_lot(payload.lotId)
    if not assigned_lot:
        raise HTTPException(status_code=404, detail="No lot found")

    expires_at = (
        datetime.fromisoformat(payload.arrivalTime) +
        timedelta(minutes=payload.durationMinutes)
    ).isoformat()

    reservation_data = {
        "userId": payload.userId,
        "studentName": payload.studentName,
        "lotId": assigned_lot["id"],
        "lotName": assigned_lot["name"],
        "arrivalTime": payload.arrivalTime,
        "durationMinutes": payload.durationMinutes,
        "className": payload.className,
        "status": "active",
        "reservedAt": datetime.utcnow().isoformat(),
        "expiresAt": expires_at
    }

    doc_ref = db.collection("reservations").add(reservation_data)

    return {
        "message": "Reservation created successfully",
        "reservationId": doc_ref[1].id,
        "lot": assigned_lot,
        "expiresAt": expires_at
    }


@router.post("/cancel")
async def cancel_reservation(payload: ReservationCancel):
    doc_ref = db.collection("reservations").document(payload.reservationId)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Reservation not found")

    doc_ref.update({
        "status": "cancelled",
        "cancelledAt": datetime.utcnow().isoformat()
    })

    return {"message": "Reservation cancelled successfully"}


@router.get("/all")
async def get_all_reservations():
    docs = db.collection("reservations").stream()
    results = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        results.append(item)
    return results