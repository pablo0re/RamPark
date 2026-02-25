"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

interface Spot {
    id: string;
    row: string;
    type: string;
    status: string;
}

interface Lot {
    id: string;
    name: string;
    totalCapacity: number;
    predictedOccupancy: number;
}

export default function LotDetailPage() {
    const params = useParams();
    const lotId = params.lotId as string;
    const [spots, setSpots] = useState<Spot[]>([]);
    const [lot, setLot] = useState<Lot | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchLotData();
    }, [lotId]);

    const fetchLotData = async () => {
        try {
            const spotsRes = await
            fetch('$(process.env.NEXT_PUBLIC_API_BASE}/parking/lots/${lotId}/spots');
            const spotsData = await spotsRes.json();
            setSpots(spotsData);

            const lotRes = await
            fetch('$(process.env.NEXT_PUBLIC_API_BASE}/parking/lots');
            const lots = await lotRes.json();
            const currentLot = lots.find((l: any) => l.id == lotId);
            setLot(currentLot);
        } catch (error) {
            console.error('Failed to fetch lot data:', error)
        }
    };

    const handlePhotoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await
        fetch('$(process.env.NEXT_PUBLIC_API_BASE}/detect/upload/${lotId}', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        setUploadResult(data);
        fetchLotData();
        } catch (error) {
            console.error('Upload failed:', error);
        }
        setUploading(false);
    };

    if (!lot) return <div>Loading...</div>;
    const availableSpots = spots.filter(s => s.status === 'available').length;
    const occupiedSpots = spots.length - availableSpots;

    return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 text-sm"
        >
          ← Back to Map
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h1 className="text-2xl font-bold mb-2">{lot.name}</h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-600 px-4 py-3 rounded-lg">
                <div className="text-sm text-emerald-100">{availableSpots}</div>
                <div className="text-xs text-emerald-200">Available</div>
              </div>
              <div className="bg-rose-600 px-4 py-3 rounded-lg">
                <div className="text-sm text-rose-100">{occupiedSpots}</div>
                <div className="text-xs text-rose-200">Occupied</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p>Total: {lot.totalCapacity} spots</p>
              <p>Predicted: {lot.predictedOccupancy}%</p>
              {uploadResult && (
                <p className="text-emerald-400">
                  Photo updated: {uploadResult.photoOccupancy}% occupancy
                </p>
              )}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-xl font-bold mb-4">AI Photo Detection</h2>
            <form onSubmit={handlePhotoUpload} className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
                required
              />
              <button
                type="submit"
                disabled={!file || uploading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 py-2 rounded-lg font-medium"
              >
                {uploading ? 'Processing...' : 'Upload & Detect'}
              </button>
            </form>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold mb-6">Individual Parking Spots</h2>
          <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className={`p-2 rounded-lg text-xs text-center border transition-all ${
                  spot.status === 'available'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-500 text-rose-100'
                }`}
              >
                <div>{spot.id}</div>
                <div className="text-[10px] opacity-75">{spot.row}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}