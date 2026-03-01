'use client';
import { ParkingLot } from '@/lib/api';
import { MapPin, Users, Car } from 'lucide-react';

interface ParkingCardProps {
  lot: ParkingLot;
}

export function ParkingCard({ lot }: ParkingCardProps) {
  const available = Math.round(lot.totalCapacity * (1 - lot.predictedOccupancy / 100));
  const taken = lot.totalCapacity - available;
  
  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="group hover:scale-[1.02] transition-transform duration-200">
      <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-t-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-4 left-4">
          <div className={`w-12 h-12 rounded-xl ${getColorClass(lot.occupancyColor)} flex items-center justify-center shadow-lg`}>
            <span className="font-bold text-white text-sm">{lot.predictedOccupancy}%</span>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{lot.name}</h3>
          <MapPin className="text-slate-400 w-5 h-5" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <span>{available} Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-red-400" />
            <span>{taken} Taken</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-700 ${getColorClass(lot.occupancyColor)}`}
            style={{ width: `${lot.predictedOccupancy}%` }}
          />
        </div>
      </div>
    </div>
  );
}