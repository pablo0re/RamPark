// "use client";
// import { useEffect, useRef, useState} from 'react';
// import { Loader} from '@googlemaps/js-api-loader';
// import { useAuth} from '@/contexts/AuthContext';
// import { useRouter} from 'next/navigation';
// import Link from 'next/link';

// interface Lot {
//   id: string;
//   name: string;
//   lat: number;
//   lng: number;
//   predictedOccupancy: number;
//   totalCapacity: number;
//   occupancyColor: string;
//   photoEnabled: boolean;
//   type: string;
// }

// export default function HomePage() {
//   const { user, isFSCUser, loading } = useAuth;
//   const router = useRouter;
//   const mapRef = useRef<HTMLDivElement>(null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [lots, setLots] = useState<Lot[]> ([]);

//   useEffect(() => {
//     if (!isFSCUser && !loading) router.push('/login');
//   }, [isFSCUser,loading,router]);

//   useEffect(() => {
//     if (!mapRef.current || !user) return;

//     const loader = new Loader ({
//       apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//       version: 'weekly'
//     });

//     loader.load().then(() => {
//       const map = new google.maps.Map(mapRef.current!, {
//         zoom: 16,
//         center: {lat: 40.752, lng: -73.429},
//         styles: [
//           { featureType: 'poi', elementType: 'labels', stylers: [{visibilty:
//             'off'}]}
//         ]
//       });
//       setMap(map);
//     });
// }, [user]);

// useEffect(() => {
//   fetchLots();
//   const interval = setInterval(fetchLots, 30000);
//   return () => clearInterval(interval);
// }, []);

// const fetchLots = async () => {
//   try {
//     const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE}/parking/lots');
//     const data = await res.json();
//     setLots(data);

//     if (map) {
//       google.maps.event.clearListeners(map, 'click');

//       data.forEach((lot:Lot) => {
//         const color = getMarkerColor(lot.occupancyColor);
//         const marker = new google.maps.Markers ({
//           position: {lat: lot.lat, lng: lot.lng},
//           map,
//           title: '${lot.name} (${lot.predictedOccupancy}%)',
//           icon: {
//             path: google.maps.SymbolPath.CIRCLE,
//             scale: 12,
//             fillColor: color,
//             fillOpacity: 0.8,
//             strokeWeight: 3,
//             strokeColor: '#ffffff'
//           }
//         });

//         if (lot.photoEnabled) {
//           marker.addListner('click', () => {
//             router.push('/lots/${lot.id}');
//           });
//         }
//       });
//     }
//   } catch (error) {
//     console.error('Failed to fetch lots:', error);
//   }
// };

// const getMarkerColor = (color: string): string => {
//   const colors: Record<string, string> = {
//     green: '#22c55e',
//     yellow: '#eab308',
//     orange: '#f97316',
//     red: '#ef4444'
//   };
//   return colors[color] || '#22c55e';
// };

// if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

// return (
//   <div className="min-h-screen bg-slate-950">
//     <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-
//     800 sticky top-0 z-50 px-6 py-4">
//       <div className="max-w-6xl mx-auto flex items-center justify-between">
//         <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">🐏</div>
//             <h1 className="text-2xl font-bold">Ram Park</h1>
//           </div>
//           {user && (
//             <div className="flex items-center gap-4">
//               <span className="text-sm text-slate-400">{user.email}</span>
//               <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm">Logout</Link>
//             </div>
//           )}
//         </div>
//       </header>
//       <div className="max-w-6xl mx-auto px-6 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
//             <h3 className="text-slate-400 text-sm mb-2">Total Lots</h3>
//             <p className="text-2xl font-bold">{lots.length}</p>
//           </div>
//           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
//             <h3 className="text-slate-400 text-sm mb-2">Total Capacity</h3>
//             <p className="text-2xl font-bold">
//               {lots.reduce((sum, lot) => sum + lot.totalCapacity, 0)}
//             </p>
//           </div>
//           <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
//             <h3 className="text-slate-400 text-sm mb-2">Avg Occupancy</h3>
//             <p className="text-2xl font-bold">
//               {lots.length ? Math.round(
//                 lots.reduce((sum, lot) => sum + lot.predictedOccupancy, 0) / lots.length
//               ) : 0}%
//             </p>
//           </div>
//         </div>
//         <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6">
//           <p className="text-sm text-slate-400 mb-3">Legend (clickable lots only)</p>
//           <div className="flex gap-6">
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//               <span className="text-sm">0-25% Green</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
//               <span className="text-sm">26-50% Yellow</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
//               <span className="text-sm">51-75% Orange</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-4 h-4 bg-red-500 rounded-full"></div>
//               <span className="text-sm">76-100% Red</span>
//             </div>
//           </div>
//         </div>
//         <div className="h-[70vh] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
//           <div ref={mapRef} className="w-full h-full" />
//         </div>
//       </div>
//     </div>
//   );
// }










// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
