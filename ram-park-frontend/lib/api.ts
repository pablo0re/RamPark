const API_BASE = "http://127.0.0.1:8000";

export interface ParkingSpot {
  id: string;
  status: "available" | "occupied";
  row: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  predictedOccupancy: number;
  occupancyColor: "green" | "yellow" | "orange" | "red";
  photoOccupancy?: number;
  hasEvChargers?: boolean;
  evChargersTotal?: number;
  evChargersAvailable?: number;
}

export interface ValetRequestPayload {
  userId: string;
  studentName: string;
  phoneNumber: string;
  pickupLocation: string;
  requestedTime: string;
  userEmail?: string;
  notes?: string;
}

export interface ValetApprovalPayload {
  valetName: string;
  valetPhone: string;
}

export interface ValetParkedPayload {
  assignedLotName: string;
}

export interface ValetReturnPayload {
  returnLocation: string;
  returnTime: string;
  returnMessage?: string;
}

export async function getLots(): Promise<ParkingLot[]> {
  const res = await fetch(`${API_BASE}/parking/lots`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch lots");
  return res.json();
}

export async function uploadPhoto(lotId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/detect/upload/${lotId}`, {
    method: "POST",
    body: formData,
  });

  return res.json();
}

export async function getLotSpots(lotId: string): Promise<ParkingSpot[]> {
  const res = await fetch(`${API_BASE}/parking/lots/${lotId}/spots`);
  if (!res.ok) throw new Error("Failed to fetch spots");
  return res.json();
}

export async function requestValet(payload: ValetRequestPayload) {
  const res = await fetch(`${API_BASE}/valet/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to create valet request");
  return res.json();
}

export async function getValetRequests() {
  const res = await fetch(`${API_BASE}/valet/all`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch valet requests");
  return res.json();
}

export async function cancelValetRequest(requestId: string) {
  const res = await fetch(`${API_BASE}/valet/cancel/${requestId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to cancel valet request");
  return res.json();
}

export async function approveValetRequest(
  requestId: string,
  payload: ValetApprovalPayload
) {
  const res = await fetch(`${API_BASE}/valet/approve/${requestId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to approve valet request");
  return res.json();
}

export async function rejectValetRequest(requestId: string) {
  const res = await fetch(`${API_BASE}/valet/reject/${requestId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to reject valet request");
  return res.json();
}

export async function markVehicleReceived(requestId: string) {
  const res = await fetch(`${API_BASE}/valet/vehicle-received/${requestId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to mark vehicle as received");
  return res.json();
}

export async function markVehicleParked(
  requestId: string,
  payload: ValetParkedPayload
) {
  const res = await fetch(`${API_BASE}/valet/parked/${requestId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to mark vehicle as parked");
  return res.json();
}

export async function requestVehicleReturn(
  requestId: string,
  payload: ValetReturnPayload
) {
  const res = await fetch(`${API_BASE}/valet/request-return/${requestId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to request vehicle return");
  return res.json();
}

export async function markReturnInProgress(requestId: string) {
  const res = await fetch(`${API_BASE}/valet/return-in-progress/${requestId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to mark return in progress");
  return res.json();
}

export async function completeValetRequest(requestId: string) {
  const res = await fetch(`${API_BASE}/valet/complete/${requestId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Failed to complete valet request");
  return res.json();
}
export async function getValetLeaderboard() {
  const res = await fetch(`${API_BASE}/valet/leaderboard`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function getRecommendations(token: string) {
  const res = await fetch(`${API_BASE}/recommend/suggest`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to get recommendations");
  return res.json();
}

export async function saveScheduleToFirestore(
  userId: string,
  classes: any[],
  db: any
) {
  const { doc, setDoc, collection } = await import("firebase/firestore");
  for (const cls of classes) {
    const ref = doc(collection(db, "schedules", userId, "classes"), cls.id);
    await setDoc(ref, cls);
  }
}