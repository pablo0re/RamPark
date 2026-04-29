'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { MapPin, Navigation, RefreshCw, Car, Locate, CheckCircle } from 'lucide-react';

const LOT_BOUNDARIES: Record<string, { lat: number; lng: number }[]> = {
  lot15:   [{ lat: 40.753332, lng: -73.430639 },{ lat: 40.753332, lng: -73.430039 },{ lat: 40.752532, lng: -73.430039 },{ lat: 40.752532, lng: -73.430639 }],
  lot15A:  [{ lat: 40.753271, lng: -73.430236 },{ lat: 40.753271, lng: -73.429636 },{ lat: 40.752471, lng: -73.429636 },{ lat: 40.752471, lng: -73.430236 }],
  lot18:   [{ lat: 40.754429, lng: -73.430348 },{ lat: 40.754429, lng: -73.429548 },{ lat: 40.753629, lng: -73.429548 },{ lat: 40.753629, lng: -73.430348 }],
  lot20:   [{ lat: 40.750445, lng: -73.428474 },{ lat: 40.750445, lng: -73.427674 },{ lat: 40.749645, lng: -73.427674 },{ lat: 40.749645, lng: -73.428474 }],
  slot1:   [{ lat: 40.754453, lng: -73.424420 },{ lat: 40.754453, lng: -73.423620 },{ lat: 40.753653, lng: -73.423620 },{ lat: 40.753653, lng: -73.424420 }],
  slot2:   [{ lat: 40.756057, lng: -73.426006 },{ lat: 40.756057, lng: -73.425206 },{ lat: 40.755257, lng: -73.425206 },{ lat: 40.755257, lng: -73.426006 }],
  slot3:   [{ lat: 40.756182, lng: -73.429891 },{ lat: 40.756182, lng: -73.429091 },{ lat: 40.755382, lng: -73.429091 },{ lat: 40.755382, lng: -73.429891 }],
  slot4b:  [{ lat: 40.756009, lng: -73.428530 },{ lat: 40.756009, lng: -73.427730 },{ lat: 40.755209, lng: -73.427730 },{ lat: 40.755209, lng: -73.428530 }],
  slot5:   [{ lat: 40.752589, lng: -73.432380 },{ lat: 40.752589, lng: -73.431580 },{ lat: 40.751789, lng: -73.431580 },{ lat: 40.751789, lng: -73.432380 }],
  slot5a:  [{ lat: 40.753712, lng: -73.433268 },{ lat: 40.753712, lng: -73.432468 },{ lat: 40.752912, lng: -73.432468 },{ lat: 40.752912, lng: -73.433268 }],
  slot6:   [{ lat: 40.752907, lng: -73.434130 },{ lat: 40.752907, lng: -73.433330 },{ lat: 40.752107, lng: -73.433330 },{ lat: 40.752107, lng: -73.434130 }],
  slot7:   [{ lat: 40.750333, lng: -73.432894 },{ lat: 40.750333, lng: -73.432094 },{ lat: 40.749533, lng: -73.432094 },{ lat: 40.749533, lng: -73.432894 }],
  spl9:    [{ lat: 40.749632, lng: -73.429921 },{ lat: 40.749632, lng: -73.429121 },{ lat: 40.748832, lng: -73.429121 },{ lat: 40.748832, lng: -73.429921 }],
  pls1:    [{ lat: 40.753883, lng: -73.423525 },{ lat: 40.753883, lng: -73.422725 },{ lat: 40.753083, lng: -73.422725 },{ lat: 40.753083, lng: -73.423525 }],
  pls2:    [{ lat: 40.755770, lng: -73.427257 },{ lat: 40.755770, lng: -73.426457 },{ lat: 40.754970, lng: -73.426457 },{ lat: 40.754970, lng: -73.427257 }],
  pls4a:   [{ lat: 40.755477, lng: -73.429269 },{ lat: 40.755477, lng: -73.428469 },{ lat: 40.754677, lng: -73.428469 },{ lat: 40.754677, lng: -73.429269 }],
  pls7a:   [{ lat: 40.749837, lng: -73.432963 },{ lat: 40.749837, lng: -73.432163 },{ lat: 40.749037, lng: -73.432163 },{ lat: 40.749037, lng: -73.432963 }],
  rsl10:   [{ lat: 40.751434, lng: -73.425461 },{ lat: 40.751434, lng: -73.424661 },{ lat: 40.750634, lng: -73.424661 },{ lat: 40.750634, lng: -73.425461 }],
  rsl11:   [{ lat: 40.752002, lng: -73.424121 },{ lat: 40.752002, lng: -73.423321 },{ lat: 40.751202, lng: -73.423321 },{ lat: 40.751202, lng: -73.424121 }],
  stpl12:  [{ lat: 40.751559, lng: -73.426216 },{ lat: 40.751559, lng: -73.425416 },{ lat: 40.750759, lng: -73.425416 },{ lat: 40.750759, lng: -73.426216 }],
  stpl8:   [{ lat: 40.749938, lng: -73.430256 },{ lat: 40.749938, lng: -73.429456 },{ lat: 40.749138, lng: -73.429456 },{ lat: 40.749138, lng: -73.430256 }],
};

function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  const { lat: px, lng: py } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function detectLot(pos: { lat: number; lng: number }): string | null {
  for (const [key, boundary] of Object.entries(LOT_BOUNDARIES)) {
    if (isPointInPolygon(pos, boundary)) return key;
  }
  return null;
}

function lotLabel(key: string) {
  const names: Record<string, string> = {
    lot15: 'Student Lot #15', lot15A: 'Staff Lot #15A', lot18: 'Lot 18 - Student',
    lot20: 'Lot 20 - Visitor', slot1: 'Student Lot #1', slot2: 'Student Lot #2',
    slot3: 'Student Lot #3', slot4b: 'Student Lot #4b', slot5: 'Student Lot #5',
    slot5a: 'Student Lot #5a', slot6: 'Student Lot #6', slot7: 'Student Lot #7',
    spl9: 'Student Parking Lot #9', pls1: 'Parking Lot Staff', pls2: 'Parking Lot Staff #2',
    pls4a: 'Parking Lot Staff #4a', pls7a: 'Parking Lot Staff #7a',
    rsl10: 'Resident Student Lot #10', rsl11: 'Resident Student Lot #11',
    stpl12: 'Staff Parking Lot #12', stpl8: 'Staff Parking Lot #8',
  };
  return names[key] ?? key;
}

const containerStyle = { width: '100%', height: '600px' };
const center = { lat: 40.7529, lng: -73.4295 };

export default function MapPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [mapKey, setMapKey] = useState(0);

  const [trackingActive, setTrackingActive] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedLot, setDetectedLot] = useState<string | null>(null);
  const [isParked, setIsParked] = useState(false);
  const [parkedLot, setParkedLot] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const mapRefInternal = useRef<google.maps.Map | null>(null);
  const firstFixRef = useRef(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const fetchLots = useCallback(async () => {
    try {
      const data = await getLots();
      setLots(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch lots:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 30000);
    return () => clearInterval(interval);
  }, [fetchLots]);

  const getMarkerColor = (color: string) => {
    const colors: Record<string, string> = {
      green: '#10B981', yellow: '#F59E0B', orange: '#F97316', red: '#EF4444'
    };
    return colors[color] || '#6B7280';
  };

  const onMarkerClick = (lot: ParkingLot) => {
    const fresh = lots.find(l => l.id === lot.id) ?? lot;
    setSelectedLot(fresh);
  };

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setTrackingActive(true);
    firstFixRef.current = true;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserPos(pos);
        if (firstFixRef.current && mapRefInternal.current) {
          mapRefInternal.current.panTo(pos);
          mapRefInternal.current.setZoom(18);
          firstFixRef.current = false;
        }
        setDetectedLot(detectLot(pos));
      },
      (err) => { console.error('Geolocation error:', err); setTrackingActive(false); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTrackingActive(false);
    setUserPos(null);
    setDetectedLot(null);
    firstFixRef.current = true;
  }, []);

  useEffect(() => () => stopTracking(), [stopTracking]);

  const handleImParked = async () => {
    if (!detectedLot) return;
    setIsParked(true);
    setParkedLot(detectedLot);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/lots/${detectedLot}/occupy`, { method: 'POST' });
      const data = await getLots();
      setLots(data);
      const updated = data.find((l: ParkingLot) => l.id === detectedLot);
      if (updated) setSelectedLot(updated);
    } catch (e) {
      console.error('Failed to update occupancy:', e);
    }
  };

  const handleLeave = async () => {
    if (parkedLot) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/lots/${parkedLot}/vacate`, { method: 'POST' });
        const data = await getLots();
        setLots(data);
        const updated = data.find((l: ParkingLot) => l.id === parkedLot);
        if (updated) setSelectedLot(updated);
      } catch (e) {
        console.error('Failed to update occupancy:', e);
      }
    }
    setIsParked(false);
    setParkedLot(null);
  };

  const refreshMap = () => {
    setMapKey(prev => prev + 1);
    fetchLots();
  };

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0b83a] to-[#c9a227] bg-clip-text text-transparent mb-2">
              Campus Parking Map
            </h1>
            <p className="text-xl text-slate-300">Real-time occupancy across all FSC lots</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={refreshMap} variant="outline" className="border-emerald-400 text-emerald-300">
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Button
              onClick={trackingActive ? stopTracking : startTracking}
              className={trackingActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-[#142a1e] border border-[#2a5438] text-emerald-300 hover:border-emerald-400'}
            >
              <Locate className="w-4 h-4 mr-2" />
              {trackingActive ? 'Tracking On' : 'Track My Location'}
            </Button>
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">
              <Navigation className="w-5 h-5 mr-2" />Navigate
            </Button>
          </div>
        </div>

        {isParked && parkedLot && (
          <div className="flex items-center justify-between bg-emerald-900/60 border border-emerald-400/60 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-100">You&apos;re parked!</p>
                <p className="text-sm text-emerald-300">{lotLabel(parkedLot)}</p>
              </div>
            </div>
            <button
              onClick={handleLeave}
              className="px-4 py-2 rounded-xl bg-red-700/60 hover:bg-red-700 border border-red-500/50 text-red-200 text-sm font-semibold transition"
            >
              I&apos;ve Left
            </button>
          </div>
        )}

        {trackingActive && detectedLot && !isParked && (
          <div className="flex items-center justify-between bg-[#1a3d28] border border-[#e0b83a]/50 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <Car className="w-6 h-6 text-[#e0b83a]" />
              <div>
                <p className="font-bold text-[#e0b83a]">You&apos;re in {lotLabel(detectedLot)}</p>
                <p className="text-sm text-slate-400">Are you parking here?</p>
              </div>
            </div>
            <button
              onClick={handleImParked}
              className="px-5 py-2 rounded-xl bg-[#e0b83a] hover:bg-[#f0c94d] text-[#132217] font-bold text-sm transition shadow-lg"
            >
              I&apos;m Parked
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="shadow-2xl border-[#2a5438] bg-[#142a1e]">
              <CardContent className="p-0">
                {!isLoaded ? (
                  <div className="h-[600px] flex items-center justify-center bg-[#1a3d28]">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <GoogleMap
                    key={mapKey}
                    mapContainerStyle={containerStyle as any}
                    center={center}
                    zoom={16}
                    mapTypeId="roadmap"
                    onLoad={map => { mapRefInternal.current = map; }}
                    options={{
                      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
                    }}
                  >
                    {lots.map((lot, index) => (
                      <Marker
                        key={index}
                        position={{ lat: lot.lat!, lng: lot.lng! }}
                        onClick={() => onMarkerClick(lot)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 18,
                          fillColor: getMarkerColor(lot.occupancyColor),
                          fillOpacity: 0.85,
                          strokeWeight: 4,
                          strokeColor: '#FFFFFF',
                          strokeOpacity: 1
                        }}
                        title={`${lot.name}\n${lot.predictedOccupancy}% occupied`}
                      />
                    ))}
                    {userPos && (
                      <Marker
                        position={userPos}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#4285F4',
                          fillOpacity: 1,
                          strokeWeight: 3,
                          strokeColor: '#FFFFFF',
                          strokeOpacity: 1,
                        }}
                        title="You are here"
                      />
                    )}
                  </GoogleMap>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-5 h-5" />Occupancy Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {[
                  { color: 'green', label: '0-25% occupied', bg: 'bg-green-500' },
                  { color: 'yellow', label: '26-50% occupied', bg: 'bg-yellow-500' },
                  { color: 'orange', label: '51-75% occupied', bg: 'bg-orange-500' },
                  { color: 'red', label: '76-100% occupied', bg: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.color} className="flex items-center space-x-3 p-2">
                    <div className={`w-4 h-4 rounded-full ${item.bg}`} />
                    <span className="text-sm text-white-700">{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedLot && (
              <Card className="shadow-2xl border-emerald-400 bg-[#123322]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{selectedLot.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Occupancy</span>
                      <div className="text-2xl font-bold text-blue-400">
                        {selectedLot.predictedOccupancy}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Available</span>
                      <div className="text-xl font-bold text-green-400">
                        {Math.round(selectedLot.totalCapacity * (1 - selectedLot.predictedOccupancy / 100))}/{selectedLot.totalCapacity}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    View Spots →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {lots.slice(0, 4).map((lot, index) => (
                <div key={index} className="p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="text-2xl text-[#10b981] font-bold">{lot.predictedOccupancy}%</div>
                  <div className="text-sm text-[#10b981] truncate">{lot.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}