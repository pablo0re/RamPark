"use client";

import { ParkingLot } from "@/lib/api";
import { MapPin, Users, Car, Zap } from "lucide-react";

interface ParkingCardProps {
  lot: ParkingLot;
}

export function ParkingCard({ lot }: ParkingCardProps) {
  const capacity = Number(lot.totalCapacity) || 0;
  const occupancy = Number(lot.predictedOccupancy) || 0;
  const available = Math.max(0, Math.round(capacity * (1 - occupancy / 100)));
  const taken = Math.max(0, capacity - available);

  const hasEv = Boolean(lot.hasEvChargers);
  const evAvailable = Number(lot.evChargersAvailable) || 0;
  const evTotal = Number(lot.evChargersTotal) || 0;

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: "bg-emerald-500",
      yellow: "bg-yellow-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
    };
    return colors[color] || "bg-gray-500";
  };

  return (
    <div className="group hover:scale-[1.02] transition-transform duration-200">
      <div className="h-48 bg-gradient-to-br from-[#1c3550] to-[#18263b] rounded-t-2xl overflow-hidden relative border border-[#2a5438]">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-4 left-4">
          <div
            className={`w-12 h-12 rounded-xl ${getColorClass(
              lot.occupancyColor
            )} flex items-center justify-center shadow-lg`}
          >
            <span className="font-bold text-white text-sm">{occupancy}%</span>
          </div>
        </div>

        {hasEv && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 rounded-full bg-[#0d2818]/90 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300 shadow-lg backdrop-blur">
              <Zap className="w-3 h-3" />
              <span>
                {evAvailable}/{evTotal}
              </span>
            </div>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-xs text-slate-200/90">
            <span>Occupancy</span>
            <span>{occupancy}%</span>
          </div>
          <div className="mt-2 w-full bg-slate-700/80 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${getColorClass(
                lot.occupancyColor
              )}`}
              style={{ width: `${Math.min(100, Math.max(0, occupancy))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 bg-[#142a1e] border-x border-b border-[#2a5438] rounded-b-2xl">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-white leading-tight">{lot.name}</h3>
          <MapPin className="text-emerald-300 w-5 h-5 mt-1 shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-slate-300 text-xs">Available</p>
              <p className="font-semibold text-white">{available}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="text-slate-300 text-xs">Taken</p>
              <p className="font-semibold text-white">{taken}</p>
            </div>
          </div>
        </div>

        {hasEv ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <Zap className="w-4 h-4" />
              EV Charging Available
            </div>
            <p className="mt-1 text-sm text-slate-200">
              {evAvailable} of {evTotal} chargers available
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-600 bg-slate-800/40 px-4 py-3">
            <p className="text-sm text-slate-400">No EV charging at this lot</p>
          </div>
        )}
      </div>
    </div>
  );
}