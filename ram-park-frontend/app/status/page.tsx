'use client';
import { useEffect, useState } from 'react';
import { ParkingCard } from '@/components/ParkingCard';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Filter } from 'lucide-react';

export default function StatusPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const data = await getLots();
      setLots(data);
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading parking status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
            Live Parking Status
          </h1>
          <p className="text-xl text-slate-400">
            {lots.reduce((sum, lot) => sum + lot.totalCapacity, 0)} total spots •{' '}
            {lots.reduce((sum, lot) => sum + Math.round(lot.totalCapacity * (lot.predictedOccupancy / 100)), 0)} occupied
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchLots} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button variant="secondary">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {lots.map((lot) => (
          <ParkingCard key={lot.id} lot={lot} />
        ))}
      </div>

      {lots.length === 0 && (
        <div className="text-center py-24">
          <p className="text-xl text-slate-400">No parking lots available</p>
        </div>
      )}
    </div>
  );
}