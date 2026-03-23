export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d2818] flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin shadow-lg" />
        <div className="text-emerald-200 text-lg font-medium tracking-wide">Loading RamPark...</div>
      </div>
    </div>
  );
}