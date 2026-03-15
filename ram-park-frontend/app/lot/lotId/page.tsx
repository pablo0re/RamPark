// 'use client';
// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { PhotoUpload } from '@/components/PhotoUpload';
// import { Card } from '@/components/ui/Card';
// import { Button } from '@/components/ui/Button';
// import { getLotSpots } from '@/lib/api';

// interface ParkingSpot {
//   id: string;
//   status: 'available' | 'occupied';
//   row: string;
// }

// export default function LotDetailPage() {
//   const params = useParams();
//   const lotId = params.lotId as string;
//   const [spots, setSpots] = useState<ParkingSpot[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchSpots();
//   }, [lotId]);

//   const fetchSpots = async () => {
//     try {
//       const data = await getLotSpots(lotId);
//       setSpots(data);
//     } catch (error) {
//       console.error('Failed to fetch spots:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const availableSpots = spots.filter(s => s.status === 'available').length;
//   const totalSpots = spots.length;

//   return (
//     <div className="max-w-6xl mx-auto px-6 py-12">
//       <div className="text-center mb-12">
//         <h1 className="text-4xl font-black mb-4">Lot {lotId}</h1>
//         <p className="text-xl text-slate-400">
//           {availableSpots}/{totalSpots} spots available
//         </p>
//       </div>

//       <div className="grid lg:grid-cols-2 gap-12">
//         {/* Photo Upload */}
//         <PhotoUpload lotId={lotId} onUploadComplete={fetchSpots} />
        
//         {/* Spots Grid */}
//         <div className="space-y-6">
//           <Card>
//             <h3 className="text-xl font-bold mb-6">Individual Spots</h3>
//             {loading ? (
//               <div className="text-center py-12">Loading spots...</div>
//             ) : (
//               <div className="grid grid-cols-8 gap-2">
//                 {spots.map((spot) => (
//                   <div
//                     key={spot.id}
//                     className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold border-2 transition-all ${
//                       spot.status === 'available'
//                         ? 'bg-green-500/20 border-green-500 text-green-400'
//                         : 'bg-red-500/20 border-red-500 text-red-400'
//                     } hover:scale-110`}
//                   >
//                     {spot.id.slice(-2)}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </Card>
          
//           <Button onClick={fetchSpots} className="w-full">
//             🔄 Refresh Spots
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }