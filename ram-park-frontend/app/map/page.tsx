'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { MapPin, Navigation, RefreshCw, Car, Locate, CheckCircle } from 'lucide-react';

// ── Lot boundary polygons (FSC) ───────────────────────────────────────────────
const LOT_BOUNDARIES: Record<string, { lat: number; lng: number }[]> = {
  lot15: [
    { lat: 40.753332, lng: -73.430639 },
    { lat: 40.753332, lng: -73.430039 },
    { lat: 40.752532, lng: -73.430039 },
    { lat: 40.752532, lng: -73.430639 },
  ],
  lot15A: [
    { lat: 40.753271, lng: -73.430236 },
    { lat: 40.753271, lng: -73.429636 },
    { lat: 40.752471, lng: -73.429636 },
    { lat: 40.752471, lng: -73.430236 },
  ],
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
  return key === 'lot15' ? 'Student Lot 15' : 'Staff Lot 15A';
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 40.7529,
  lng: -73.4295
};

export default function MapPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Location tracking
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
    } catch (error) {
      console.error('Failed to fetch lots:', error);
    }
  }, []);

  useEffect(() => {
    fetchLots();
    const interval = setInterval(fetchLots, 30000);
    return () => clearInterval(interval);
  }, [fetchLots]);

  const getMarkerColor = (color: string) => {
    const colors: Record<string, string> = {
      green: '#10B981',
      yellow: '#F59E0B',
      orange: '#F97316',
      red: '#EF4444'
    };
    return colors[color] || '#6B7280';
  };

  const onMarkerClick = (lot: ParkingLot) => {
    setSelectedLot(lot);
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
      (err) => {
        console.error('Geolocation error:', err);
        setTrackingActive(false);
      },
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

  const handleImParked = () => {
    if (!detectedLot) return;
    setIsParked(true);
    setParkedLot(detectedLot);
    // TODO: log parking session to backend
  };

  const handleLeave = () => {
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
            <p className="text-xl text-slate-300">
              Real-time occupancy across all FSC lots
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={refreshMap} variant="outline" className="border-emerald-400 text-emerald-300">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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
              <Navigation className="w-5 h-5 mr-2" />
              Navigate
            </Button>
          </div>
        </div>

        {/* Parked confirmation banner */}
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

        {/* Detected in lot — I'm Parked prompt */}
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
                    styles: [
                      {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }]
                      }
                    ]
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
                </GoogleMap>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-sm">
                <MapPin className="w-5 h-5" />
                Occupancy Legend
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
                    <span className="text-gray-600">Occupancy</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLot.predictedOccupancy}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Available</span>
                    <div className="text-xl font-bold text-green-600">
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
            {lots.slice(0, 4).map((lot,index) => (
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