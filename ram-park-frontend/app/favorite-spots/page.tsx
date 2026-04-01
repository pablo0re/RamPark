"use client";
export default function FavoriteLocationsPage() {
  return (
    <div className="min-h-screen bg-[#0d2818] text-white p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#2a5438] bg-[#142a1e] p-8">
        <h1 className="text-3xl font-bold mb-2">Favorite Locations</h1>
        <p className="text-emerald-200/80 mb-8">Quick access spots</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-[#2a5438] rounded-xl">
            <span>Lot 15 - Student</span>
            <button className="text-red-300 hover:text-red-200 text-sm">Remove</button>
          </div>
          <div className="flex items-center justify-between p-4 border border-[#2a5438] rounded-xl">
            <span>Lot 15A - Staff</span>
            <button className="text-red-300 hover:text-red-200 text-sm">Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
}