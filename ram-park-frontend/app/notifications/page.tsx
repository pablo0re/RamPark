"use client";
import { useState } from "react";

export default function NotificationsPage() {
  const [spotAlerts, setSpotAlerts] = useState(true);
  const [reservationAlerts, setReservationAlerts] = useState(false);

  return (
    <div className="min-h-screen bg-[#0d2818] text-white p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#2a5438] bg-[#142a1e] p-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-emerald-200/80 mb-8">Manage parking alerts</p>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-[#2a5438] rounded-xl cursor-pointer group">
            <span>Parking spot alerts</span>
            <div 
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                spotAlerts ? 'bg-emerald-500' : 'bg-[#2a5438]'
              }`}
              onClick={() => setSpotAlerts(!spotAlerts)}
            >
              <div 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  spotAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 border border-[#2a5438] rounded-xl cursor-pointer group">
            <span>Reservation updates</span>
            <div 
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                reservationAlerts ? 'bg-emerald-500' : 'bg-[#2a5438]'
              }`}
              onClick={() => setReservationAlerts(!reservationAlerts)}
            >
              <div 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  reservationAlerts ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}