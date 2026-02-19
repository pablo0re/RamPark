from firebase_config import db

def seed_data():
    lots = {
        "lot15": {
            "id": "lot15",
            "name": "Student Lot #15",
            "lat": 40.752932,
            "lng": -73.430239,
            "totalCapacity": 51,
            "predictedOccupancy": 0
        },
        "lot15A": {
            "id": "lot15A",
            "name": "Staff Lot #15A",
            "lat": 40.752871,
            "lng": -73.429936,
            "totalCapacity": 46,
            "predictedOccupancy": 0
        }
    }

    for lot_id, data in lots.items():
        db.collection("lots").document(lot_id).set(data)
        print(f"Seeded {lot_id}")

if __name__ == "__main__":
    seed_data()