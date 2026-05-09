'use client';
import { useEffect, useMemo, useState } from "react";
import { ParkingCard } from "@/components/ParkingCard";
import { getLots, ParkingLot } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Filter, RefreshCw, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

// Realistic mock occupancy data for a typical FSC campus day
const MOCK_TREND_DATA = [
  { time: "7am",  lot15: 5,  lot15a: 8  },
  { time: "8am",  lot15: 18, lot15a: 22 },
  { time: "9am",  lot15: 42, lot15a: 48 },
  { time: "10am", lot15: 71, lot15a: 79 },
  { time: "11am", lot15: 85, lot15a: 91 },
  { time: "12pm", lot15: 88, lot15a: 94 },
  { time: "1pm",  lot15: 82, lot15a: 87 },
  { time: "2pm",  lot15: 74, lot15a: 80 },
  { time: "3pm",  lot15: 61, lot15a: 68 },
  { time: "4pm",  lot15: 45, lot15a: 52 },
  { time: "5pm",  lot15: 28, lot15a: 33 },
  { time: "6pm",  lot15: 14, lot15a: 18 },
  { time: "7pm",  lot15: 6,  lot15a: 9  },
];

// Get current hour to show "now" marker
function getCurrentTimeLabel() {
  const hour = new Date().getHours();
  if (hour < 7) return "7am";
  if (hour >= 19) return "7pm";
  const labels = ["7am","8am","9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm"];
  const idx = Math.min(hour - 7, labels.length - 1);
  return labels[idx];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#142a1e", border: "1px solid #2a5438", borderRadius: 12, padding: "10px 14px" }}>
        <p style={{ color: "#e0b83a", fontWeight: 700, marginBottom: 6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontSize: 13 }}>
            {p.name}: <strong>{p.value}%</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StatusPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [evOnly, setEvOnly] = useState(false);
  const currentTime = getCurrentTimeLabel();

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
    const totalSpots = visibleLots.reduce((sum, lot) => sum + (Number(lot.totalCapacity) || 0), 0);
    const occupiedSpots = visibleLots.reduce((sum, lot) => {
      const capacity = Number(lot.totalCapacity) || 0;
      const occupancy = Number(lot.predictedOccupancy) || 0;
      return sum + Math.round(capacity * (occupancy / 100));
    }, 0);
    const evLots = lots.filter((lot) => lot.hasEvChargers).length;
    const evChargersAvailable = visibleLots.reduce((sum, lot) => sum + (Number(lot.evChargersAvailable) || 0), 0);
    const evChargersTotal = visibleLots.reduce((sum, lot) => sum + (Number(lot.evChargersTotal) || 0), 0);
    return { totalSpots, occupiedSpots, evLots, evChargersAvailable, evChargersTotal };
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

        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0b83a] to-[#c9a227] bg-clip-text text-transparent mb-4">
              Parking Status
            </h1>
            <p className="text-lg text-slate-300">
              {totals.totalSpots} total spots • {totals.occupiedSpots} occupied
            </p>
            <p className="mt-2 text-sm text-emerald-300/80">
              {totals.evLots} lots with EV charging • {totals.evChargersAvailable}/{totals.evChargersTotal} EV chargers available
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchLots} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900">
              <RefreshCw className="w-4 h-4" /><span>Refresh</span>
            </Button>
            <Button
              onClick={() => setEvOnly((prev) => !prev)}
              className={`flex items-center gap-2 ${evOnly ? "bg-[#e0b83a] hover:bg-[#f0c94d] text-[#132217]" : "bg-[#1b3c27] hover:bg-[#234d31] text-emerald-200 border border-[#2a5438]"}`}
            >
              <Zap className="w-4 h-4" /><span>{evOnly ? "EV Only On" : "EV Only"}</span>
            </Button>
            <Button variant="secondary" className="border-emerald-400 text-emerald-300" title="Filter">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Lot Cards */}
        {visibleLots.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {visibleLots.map((lot, index) => (
              <ParkingCard key={lot.id || `${lot.name}-${index}`} lot={lot} />
            ))}
          </div>
        ) : (
          <Card className="border border-[#2a5438] bg-[#142a1e] shadow-2xl mb-12">
            <CardContent className="py-16 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
              <h2 className="text-2xl font-bold mb-2">No EV lots found</h2>
              <p className="text-slate-300">Turn off the EV filter or add EV charging data to your lot records.</p>
            </CardContent>
          </Card>
        )}

        {/* Occupancy Trend Chart */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Daily Occupancy Trends</h2>
              </div>
              <p className="text-sm text-slate-400">Typical occupancy pattern throughout the campus day</p>
            </div>
            <div className="flex items-center gap-2 bg-[#0d2818] border border-[#2a5438] rounded-xl px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-300 font-semibold">Now: {currentTime}</span>
            </div>
          </div>

          {/* Peak hours info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0d2818] border border-[#2a5438] rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Peak Hours</p>
              <p className="text-sm font-bold text-red-400">10am – 12pm</p>
            </div>
            <div className="bg-[#0d2818] border border-[#2a5438] rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Best Time to Arrive</p>
              <p className="text-sm font-bold text-emerald-400">Before 9am or After 4pm</p>
            </div>
            <div className="bg-[#0d2818] border border-[#2a5438] rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Avg Peak Occupancy</p>
              <p className="text-sm font-bold text-yellow-400">~88%</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={MOCK_TREND_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a5438" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#7a9e88", fontSize: 12 }}
                axisLine={{ stroke: "#2a5438" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#7a9e88", fontSize: 12 }}
                axisLine={{ stroke: "#2a5438" }}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => <span style={{ color: "#eef4f0", fontSize: 13 }}>{value}</span>}
              />
              {/* "Now" reference line */}
              <ReferenceLine
                x={currentTime}
                stroke="#e0b83a"
                strokeDasharray="4 4"
                label={{ value: "Now", fill: "#e0b83a", fontSize: 11, position: "top" }}
              />
              {/* 80% warning line */}
              <ReferenceLine
                y={80}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: "High (80%)", fill: "#ef4444", fontSize: 11, position: "right" }}
              />
              <Line
                type="monotone"
                dataKey="lot15"
                name="Lot 15 (Student)"
                stroke="#4caf6e"
                strokeWidth={2.5}
                dot={{ fill: "#4caf6e", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="lot15a"
                name="Lot 15A (Staff)"
                stroke="#e0b83a"
                strokeWidth={2.5}
                dot={{ fill: "#e0b83a", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <p className="text-xs text-slate-500 text-center mt-4">
            * Based on typical campus patterns. Real-time data updates every 30 seconds.
          </p>
        </div>

      </div>
    </div>
  );
}