from firebase_config import db

def seed_data():
    lots = {
            "lot15": {
                "id": "lot15",
                "name": "Student Lot #15",
                "lat": 40.752932,
                "lng": -73.430239,
                "totalCapacity": 51,
                "predictedOccupancy": 0,
                "hasEvChargers": True,
                "evChargersTotal": 4,
                "evChargersAvailable": 3
        },
            "lot15A": {
                "id": "lot15A",
                "name": "Staff Lot #15A",
                "lat": 40.752871,
                "lng": -73.429936,
                "totalCapacity": 46,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "lot18": {
                "id": "lot18",
                "name": "Lot 18 - Student",
                "lat": 40.75402957878962,
                "lng": -73.42994837697066,
                "totalCapacity": 44,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "lot20": {
                "id": "lot20",
                "name": "Lot 20 - Visitor",
                "lat": 40.7500457665744,
                "lng": -73.42807430076634,
                "totalCapacity": 34,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot1": {
                "id": "slot1",
                "name": "Student Lot #1",
                "lat": 40.75405311589552,
                "lng": -73.42401998407266,
                "totalCapacity": 51,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot2": {
                "id": "slot2",
                "name": "Student Lot #2",
                "lat": 40.7556568042101,
                "lng": -73.42560587609825,
                "totalCapacity": 45,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot3": {
                "id": "slot3",
                "name": "Student Lot #3",
                "lat": 40.75578196585886,
                "lng": -73.42949102412535,
                "totalCapacity": 44,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot4b": {
                "id": "slot4b",
                "name": "Student Lot #4b",
                "lat": 40.75560874344203,
                "lng": -73.42812960172563,
                "totalCapacity": 50,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot5": {
                "id": "slot5",
                "name": "Student Lot #5",
                "lat": 40.75218851550968,
                "lng": -73.43197987447606,
                "totalCapacity": 51,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot5a": {
                "id": "slot5a",
                "name": "Student Lot #5a",
                "lat": 40.75331249674219,
                "lng": -73.43286798987901,
                "totalCapacity": 46,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot6": {
                "id": "slot6",
                "name": "Student Lot #6",
                "lat": 40.75250677736491,
                "lng": -73.43372951498682,
                "totalCapacity": 53,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "slot7": {
                "id": "slot7",
                "name": "Student Lot #7",
                "lat": 40.74993296089772,
                "lng": -73.43249360555502,
                "totalCapacity": 39,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "spl9": {
                "id": "spl9",
                "name": "Student Parking Lot #9",
                "lat": 40.749231949963544,
                "lng": -73.42952081208747,
                "totalCapacity": 60,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "pls1": {
                "id": "pls1",
                "name": "Parking Lot Staff",
                "lat": 40.75348276429674,
                "lng": -73.4231250066882,
                "totalCapacity": 49,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "pls2": {
                "id": "pls2",
                "name": "Parking Lot Staff #2",
                "lat": 40.75537041302952,
                "lng": -73.42685642555577,
                "totalCapacity": 50,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "pls4a": {
                "id": "pls4a",
                "name": "Parking Lot Staff #4a",
                "lat": 40.75507698811456,
                "lng": -73.42886881154037,
                "totalCapacity": 40,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "pls7a": {
                "id": "pls7a",
                "name": "Parking Lot Staff #7a",
                "lat": 40.74943741945063,
                "lng": -73.4325627402859,
                "totalCapacity": 67,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "rsl10": {
                "id": "rsl10",
                "name": "Resident Student Lot #10",
                "lat": 40.751034262580184,
                "lng": -73.4250610934276,
                "totalCapacity": 47,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "rsl11": {
                "id": "rsl11",
                "name": "Resident Student Lot #11",
                "lat": 40.75160230833641,
                "lng": -73.42372094325987,
                "totalCapacity": 35,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "stpl12": {
                "id": "stpl12",
                "name": "Staff Parking Lot #12",
                "lat": 40.75115915248885,
                "lng": -73.42581625741099,
                "totalCapacity": 43,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
        "stpl8": {
                "id": "stpl8",
                "name": "Staff Parking Lot #8",
                "lat": 40.749538139556805,
                "lng": -73.4298558496294,
                "totalCapacity": 45,
                "predictedOccupancy": 0,
                "hasEvChargers": False,
                "evChargersTotal": 0,
                "evChargersAvailable": 0
        },
    }

    for lot_id, data in lots.items():
        db.collection("lots").document(lot_id).set(data)
        print(f"Seeded {lot_id}")

if __name__ == "__main__":
    seed_data()