"use client";
export default function ParkingHistoryPage() {
  return (
    <div className="min-h-screen bg-[#0d2818] text-white p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#2a5438] bg-[#142a1e] p-8">
        <h1 className="text-3xl font-bold mb-2">Parking History</h1>
        <p className="text-emerald-200/80 mb-8">Recent sessions</p>
        <div className="space-y-3">
          <div className="p-4 border border-[#2a5438] rounded-xl">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Lot 15 - Student</p>
                <p className="text-sm text-emerald-300">Mar 31, 2026 • 10:30 AM</p>
              </div>
              <span className="text-emerald-300">2h 15m</span>
            </div>
          </div>
          <div className="p-4 border border-[#2a5438] rounded-xl">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Lot 15A - Staff</p>
                <p className="text-sm text-emerald-300">Mar 30, 2026 • 1:45 PM</p>
              </div>
              <span className="text-emerald-300">1h 30m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}