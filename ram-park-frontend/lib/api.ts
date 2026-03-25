const API_BASE = "http://127.0.0.1:8000";

export interface ParkingSpot {
  id: string;
  status: 'available' | 'occupied';
  row: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  totalCapacity: number;
  predictedOccupancy: number;
  occupancyColor: 'green' | 'yellow' | 'orange' | 'red';
  photoOccupancy?: number;
}

export async function getLots(): Promise<ParkingLot[]> {
  const res = await fetch(`${API_BASE}/parking/lots`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch lots');
  return res.json();
}

export async function uploadPhoto(lotId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/detect/upload/${lotId}`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function getLotSpots(lotId: string): Promise<ParkingSpot[]> {
  const res = await fetch(`${API_BASE}/parking/lots/${lotId}/spots`);
  if (!res.ok) throw new Error('Failed to fetch spots');
  return res.json();
}