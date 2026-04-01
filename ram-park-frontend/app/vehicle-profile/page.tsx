"use client";
export default function VehicleProfilePage() {
  return (
    <div className="min-h-screen bg-[#0d2818] text-white p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#2a5438] bg-[#142a1e] p-8">
        <h1 className="text-3xl font-bold mb-2">Vehicle Profile</h1>
        <p className="text-emerald-200/80 mb-8">Your car details</p>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="p-4 border border-[#2a5438] rounded-xl bg-[#0d2818]" placeholder="Make" />
          <input className="p-4 border border-[#2a5438] rounded-xl bg-[#0d2818]" placeholder="Model" />
          <input className="p-4 border border-[#2a5438] rounded-xl bg-[#0d2818]" placeholder="Color" />
        </div>
        <button className="mt-6 bg-[#e0b83a] text-[#132217] px-8 py-3 rounded-xl font-semibold">
          Save Vehicle
        </button>
      </div>
    </div>
  );
}