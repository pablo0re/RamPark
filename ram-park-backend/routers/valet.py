from fastapi import APIRouter, HTTPException
from firebase_config import db
from models import ValetRequestCreate, ValetApproval, ValetReturnRequest, ValetParkedUpdate
from datetime import datetime

router = APIRouter()


def get_least_busy_lot():
    lots = list(db.collection("lots").stream())
    if not lots:
        return None

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


@router.post("/request")
async def request_valet(payload: ValetRequestCreate):
    valet_data = {
        "userId": payload.userId,
        "userEmail": payload.userEmail,
        "studentName": payload.studentName,
        "phoneNumber": payload.phoneNumber,
        "pickupLocation": payload.pickupLocation,
        "requestedTime": payload.requestedTime,
        "notes": payload.notes,
        "status": "pending",
        "serviceFee": 5,
        "paymentStatus": "cash_or_transfer_on_dropoff",
        "paymentNote": "Online payment coming soon. For now, pay cash, Zelle, or Venmo at drop-off.",
        "assignedValet": None,
        "assignedValetPhone": None,
        "assignedLotId": None,
        "assignedLotName": None,
        "returnLocation": None,
        "returnTime": None,
        "returnMessage": None,
        "returnRequestedAt": None,
        "createdAt": datetime.utcnow().isoformat()
    }

    doc_ref = db.collection("valet_requests").add(valet_data)

    return {
        "message": "Valet request submitted successfully",
        "requestId": doc_ref[1].id,
        "status": "pending",
        "serviceFee": 5,
        "paymentNote": "Online payment coming soon. For now, pay cash, Zelle, or Venmo at drop-off."
    }


@router.get("/all")
async def get_all_valet_requests():
    docs = db.collection("valet_requests").stream()
    results = []

    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        results.append(item)

    return results


@router.post("/cancel/{request_id}")
async def cancel_valet_request(request_id: str):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    current = doc.to_dict()
    if current.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")

    doc_ref.update({
        "status": "cancelled",
        "cancelledAt": datetime.utcnow().isoformat()
    })

    return {"message": "Valet request cancelled"}


@router.post("/approve/{request_id}")
async def approve_valet_request(request_id: str, payload: ValetApproval):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    doc_ref.update({
        "status": "approved",
        "assignedValet": payload.valetName,
        "assignedValetPhone": payload.valetPhone,
        "approvedAt": datetime.utcnow().isoformat()
    })

    return {
        "message": "Valet request approved",
        "assignedValet": payload.valetName,
        "assignedValetPhone": payload.valetPhone
    }
    

@router.post("/reject/{request_id}")
async def reject_valet_request(request_id: str):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    doc_ref.update({
        "status": "rejected",
        "rejectedAt": datetime.utcnow().isoformat()
    })

    return {"message": "Valet request rejected"}


@router.post("/vehicle-received/{request_id}")
async def mark_vehicle_received(request_id: str):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    doc_ref.update({
        "status": "vehicle_received",
        "vehicleReceivedAt": datetime.utcnow().isoformat()
    })

    return {"message": "Vehicle marked as received"}


@router.post("/parked/{request_id}")
async def mark_vehicle_parked(request_id: str, payload: ValetParkedUpdate):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    doc_ref.update({
        "status": "parked",
        "assignedLotName": payload.assignedLotName,
        "parkedAt": datetime.utcnow().isoformat()
    })

    return {"message": "Vehicle marked as parked"}

@router.post("/request-return/{request_id}")
async def request_vehicle_return(request_id: str, payload: ValetReturnRequest):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    current = doc.to_dict()
    if current.get("status") not in ["approved", "vehicle_received", "parked"]:
        raise HTTPException(status_code=400, detail="Return request is not allowed for this status")

    doc_ref.update({
        "status": "return_requested",
        "returnLocation": payload.returnLocation,
        "returnTime": payload.returnTime,
        "returnMessage": payload.returnMessage,
        "returnRequestedAt": datetime.utcnow().isoformat()
    })

    return {"message": "Vehicle return requested successfully"}


@router.post("/return-in-progress/{request_id}")
async def mark_return_in_progress(request_id: str):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    doc_ref.update({
        "status": "return_in_progress",
        "returnInProgressAt": datetime.utcnow().isoformat()
    })

    return {"message": "Vehicle return marked in progress"}


@router.post("/complete/{request_id}")
async def complete_valet_request(request_id: str):
    doc_ref = db.collection("valet_requests").document(request_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Valet request not found")

    doc_ref.update({
        "status": "completed",
        "completedAt": datetime.utcnow().isoformat()
    })

    return {"message": "Valet request completed"}