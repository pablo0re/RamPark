'use client';
 import { useEffect, useMemo, useState } from "react";
 import { ParkingCard } from "@/components/ParkingCard";
 import { getLots, ParkingLot } from "@/lib/api";
 import { Button } from "@/components/ui/Button";
 import { Filter, RefreshCw, Zap } from "lucide-react";
 import { Card, CardContent } from "@/components/ui/Card";




export default function StatusPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [evOnly, setEvOnly] = useState(false);


  const fetchLots = async () => {
   try {
     setLoading(true);
     const data = await getLots();
     setLots(Array.isArray(data) ? data : []);
   } catch (error) {
     console.error("Failed to fetch lots:", error);
     setLots([]);
   } finally {
     setLoading(false);
   }
 };

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 30000);
    return () => clearInterval(interval);
  }, []);
const visibleLots = useMemo(() => {
   return evOnly ? lots.filter((lot) => lot.hasEvChargers) : lots;
 }, [lots, evOnly]);

 const totals = useMemo(() => {
  const totalSpots = visibleLots.reduce(
     (sum, lot) => sum + (Number(lot.totalCapacity) || 0),
     0
   );

   const occupiedSpots = visibleLots.reduce((sum, lot) => {
     const capacity = Number(lot.totalCapacity) || 0;
     const occupancy = Number(lot.predictedOccupancy) || 0;
     return sum + Math.round(capacity * (occupancy / 100));
   }, 0);

   const evLots = lots.filter((lot) => lot.hasEvChargers).length;
   const evChargersAvailable = visibleLots.reduce(
     (sum, lot) => sum + (Number(lot.evChargersAvailable) || 0),
     0
   );
   const evChargersTotal = visibleLots.reduce(
     (sum, lot) => sum + (Number(lot.evChargersTotal) || 0),
     0
   );

   return {
     totalSpots,
     occupiedSpots,
     evLots,
     evChargersAvailable,
     evChargersTotal,
   };
 }, [visibleLots, lots]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center text-slate-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-300">Loading parking status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0b83a] to-[#c9a227] bg-clip-text text-transparent mb-4">
              Parking Status
            </h1>
            <p className="text-lg text-slate-300">
              {totals.totalSpots} total spots • {totals.occupiedSpots} occupied
            </p>
            <p className="mt-2 text-sm text-emerald-300/80">
              {totals.evLots} lots with EV charging • {totals.evChargersAvailable}/
              {totals.evChargersTotal} EV chargers available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchLots}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>

            <Button
              onClick={() => setEvOnly((prev) => !prev)}
              className={`flex items-center gap-2 ${
                evOnly
                  ? "bg-[#e0b83a] hover:bg-[#f0c94d] text-[#132217]"
                  : "bg-[#1b3c27] hover:bg-[#234d31] text-emerald-200 border border-[#2a5438]"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{evOnly ? "EV Only On" : "EV Only"}</span>
            </Button>

            <Button
              variant="secondary"
              className="border-emerald-400 text-emerald-300"
              title="Filter"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {visibleLots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {visibleLots.map((lot, index) => (
              <ParkingCard
                key={lot.id || `${lot.name}-${index}`}
                lot={lot}
              />
            ))}
          </div>
        ) : (
          <Card className="border border-[#2a5438] bg-[#142a1e] shadow-2xl">
            <CardContent className="py-16 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <h2 className="text-2xl font-bold mb-2">No EV lots found</h2>
              <p className="text-slate-300">
                Turn off the EV filter or add EV charging data to your lot records.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}