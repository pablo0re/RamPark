// import Link from 'next/link';
// import { Button } from '@/components/ui/Button';
// import { Card } from '@/components/ui/Card';
// import { ArrowRight, Users, Camera, Clock, Shield } from 'lucide-react';

// export default function HomePage() {
//   return (
//     <>
//       <section className="relative overflow-hidden pt-32 pb-24">
//         <div className="absolute inset-0 bg-grid-pattern opacity-20" />
//         <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
//           <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mb-6">
//             Smart Parking
//             <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//               System
//             </span>
//           </h1>
//           <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
//             Park smarter with real-time occupancy, AI photo simulation, and schedule-based recommendations.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//             <Link href="/status">
//               <Button size="lg" className="group">
//                 Get Started
//                 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//               </Button>
//             </Link>
//             <Link href="/ai">
//               <Button variant="secondary" size="lg">
//                 Try AI Demo
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="max-w-7xl mx-auto px-6 py-24">
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//           <Card className="text-center group hover:scale-105 transition-all duration-300">
//             <Users className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
//             <h3 className="text-xl font-bold mb-2">Real-Time Status</h3>
//             <p className="text-slate-400">Live occupancy updates across all campus lots.</p>
//           </Card>
          
//           <Card className="text-center group hover:scale-105 transition-all duration-300">
//             <Camera className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
//             <h3 className="text-xl font-bold mb-2">AI Photo Simulation</h3>
//             <p className="text-slate-400">Visual spot detection using computer vision.</p>
//           </Card>
          
//           <Card className="text-center group hover:scale-105 transition-all duration-300">
//             <Clock className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
//             <h3 className="text-xl font-bold mb-2">Schedule Recommendations</h3>
//             <p className="text-slate-400">Smart parking suggestions based on your classes.</p>
//           </Card>
          
//           <Card className="text-center group hover:scale-105 transition-all duration-300">
//             <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
//             <h3 className="text-xl font-bold mb-2">FSC Secure</h3>
//             <p className="text-slate-400">@farmingdale.edu authentication required.</p>
//           </Card>
//         </div>
//       </section>

//       {/* Live Preview Cards */}
//       <section className="max-w-7xl mx-auto px-6 pb-24">
//         <div className="grid lg:grid-cols-2 gap-8 items-center">
//           <div className="space-y-6">
//             <h2 className="text-4xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
//               Live Parking Status
//             </h2>
//             <p className="text-xl text-slate-400 max-w-lg">
//               See exactly which lots have space right now.
//             </p>
//             <Link href="/status" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-lg font-semibold group">
//               <span>View All Lots</span>
//               <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </Link>
//           </div>
          
//           <div className="grid md:grid-cols-2 gap-6">
//             <div className="group">
//               <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:scale-105 transition-all duration-300">
//                 <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-4">
//                   <span className="font-bold text-white text-lg">32%</span>
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-white mb-1">Lot 15</h4>
//                   <p className="text-sm text-slate-400">32/51 Available</p>
//                 </div>
//               </div>
//             </div>
//             <div className="group">
//               <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:scale-105 transition-all duration-300">
//                 <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
//                   <span className="font-bold text-white text-lg">68%</span>
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-white mb-1">Lot 15A</h4>
//                   <p className="text-sm text-slate-400">18/46 Available</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

'use client';
import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { LogIn, LogOut, RefreshCw } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '70vh'
};

const center = {
  lat: 40.7529,
  lng: -73.4295
};

export default function HomePage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [mapLoading, setMapLoading] = useState(true);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'] as any,
  });

  const fetchLots = useCallback(async () => {
    try {
      const data = await getLots();
      setLots(data);
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchLots();
      const interval = setInterval(fetchLots, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [authLoading, fetchLots]);

  const onMarkerClick = (lot: ParkingLot) => {
    if (lot.id === 'lot15' || lot.id === 'lot15A') {
      setSelectedLot(lot);
    }
  };

  const getMarkerColor = (occupancyColor: string) => {
    const colors: Record<string, string> = {
      green: '#00FF00',
      yellow: '#FFFF00',
      orange: '#FFA500',
      red: '#FF0000'
    };
    return colors[occupancyColor] || '#808080';
  };

  if (loadError) return <div className="p-8 text-center">Error loading maps</div>;
  if (!isLoaded || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">Loading parking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Auth Header */}
      <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🅿️ Ram Park
          </h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-slate-300 hidden md:inline">
                  Hi, {user.email}
                </span>
                <Button variant="danger" size="sm" onClick={logout}>
                  <LogOut size={16} className="mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push('/auth')}>
                <LogIn size={16} className="mr-1" />
                Sign In
              </Button>
            )}
            <Button onClick={fetchLots} size="sm" variant="secondary">
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {!user && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-8">
          <div className="text-center max-w-md space-y-6">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Welcome to Ram Park
            </h2>
            <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed">
              Real-time campus parking with AI photo simulation. Sign in with your @farmingdale.edu account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => router.push('/auth')} className="w-full sm:w-auto">
                <LogIn size={20} className="mr-2" />
                Sign In
              </Button>
              <Button size="lg" variant="secondary" onClick={() => router.push('/status')}>
                Live Status →
              </Button>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 mb-6">
                <h2 className="text-2xl font-bold mb-2">🗺️ Campus Parking Map</h2>
                <p className="text-slate-400 text-sm">
                  Click green/orange markers (Lot 15, 15A) for spot details
                </p>
              </div>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={16}
                mapContainerClassName="rounded-2xl shadow-2xl"
              >
                {lots.map((lot) => (
                  <Marker
                    key={lot.id}
                    position={{ lat: lot.lat, lng: lot.lng }}
                    onClick={() => onMarkerClick(lot)}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 14,
                      fillColor: getMarkerColor(lot.occupancyColor),
                      fillOpacity: 0.8,
                      strokeWeight: 3,
                      strokeColor: 'white'
                    }}
                    title={`${lot.name} - ${lot.predictedOccupancy}% occupied`}
                  />
                ))}
              </GoogleMap>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">Live Status</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lots.map((lot) => (
                    <div key={lot.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-all">
                      <span className="font-medium truncate">{lot.name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lot.occupancyColor === 'green' ? 'bg-green-500' :
                        lot.occupancyColor === 'yellow' ? 'bg-yellow-500 text-black' :
                        lot.occupancyColor === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {lot.predictedOccupancy}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedLot && (
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4">{selectedLot.name}</h3>
                  <p className="text-slate-400 mb-4 text-sm">
                    {Math.round(selectedLot.totalCapacity * (1 - selectedLot.predictedOccupancy / 100))} / {selectedLot.totalCapacity} available
                  </p>
                  <Link href={`/lot/${selectedLot.id}`}>
                    <Button size="lg" className="w-full">
                      📸 View Spots & Upload Photo
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}