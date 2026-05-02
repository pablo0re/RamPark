'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { MapPin, Navigation, RefreshCw, Car, Locate, CheckCircle, X, Star } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
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

function navigateToLot(lot: ParkingLot) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
        const dest = `${lot.lat},${lot.lng}`;
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`, '_blank');
      },
      () => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.lat},${lot.lng}&travelmode=driving`, '_blank');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  } else {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lot.lat},${lot.lng}&travelmode=driving`, '_blank');
  }
}

const containerStyle = { width: '100%', height: '600px' };
const center = { lat: 40.7529, lng: -73.4295 };

export default function MapPage() {
  const [user] = useAuthState(auth);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [favoriteLotIds, setFavoriteLotIds] = useState<string[]>([]);

  // Location tracking
  const [trackingActive, setTrackingActive] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedLot, setDetectedLot] = useState<string | null>(null);
  const [isParked, setIsParked] = useState(false);
  const [parkedLot, setParkedLot] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const mapRefInternal = useRef<google.maps.Map | null>(null);
  const firstFixRef = useRef(true);

  // Navigation state
  const [showNavigate, setShowNavigate] = useState(false);
  const [selectedNavLot, setSelectedNavLot] = useState<ParkingLot | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [navError, setNavError] = useState('');

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

  // Load favorites from Firestore
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data()?.favorites) {
          setFavoriteLotIds(userDoc.data().favorites);
        }
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    };
    loadFavorites();
  }, [user]);

  const getMarkerColor = (color: string) => {
    const colors: Record<string, string> = {
      green: '#10B981', yellow: '#F59E0B', orange: '#F97316', red: '#EF4444'
    };
    return colors[color] || '#6B7280';
  };

  const onMarkerClick = (lot: ParkingLot) => setSelectedLot(lot);

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

  const handleImParked = () => {
    if (!detectedLot) return;
    setIsParked(true);
    setParkedLot(detectedLot);
  };

  const handleLeave = () => {
    setIsParked(false);
    setParkedLot(null);
  };

  const refreshMap = () => {
    setMapKey(prev => prev + 1);
    fetchLots();
  };

  const handleNavigate = () => {
    if (!selectedNavLot) { setNavError('Please select a parking lot first.'); return; }
    setNavError('');
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGettingLocation(false);
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = `${selectedNavLot.lat},${selectedNavLot.lng}`;
          window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`, '_blank');
        },
        () => {
          setGettingLocation(false);
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedNavLot.lat},${selectedNavLot.lng}&travelmode=driving`, '_blank');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGettingLocation(false);
      window.open(`https://www.google.com/maps/search/?api=1&query=${selectedNavLot.lat},${selectedNavLot.lng}`, '_blank');
    }
  };

  // Exact match only
  const uniqueLots = lots.filter((lot, index, self) =>
    index === self.findIndex(l => l.id === lot.id)
  );
  const favoriteLots = uniqueLots.filter(lot => favoriteLotIds.includes(lot.id));

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0b83a] to-[#c9a227] bg-clip-text text-transparent mb-2">
              Campus Parking Map
            </h1>
            <p className="text-xl text-slate-300">Real-time occupancy across all FSC lots</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={refreshMap} variant="outline" className="border-emerald-400 text-emerald-300">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button
              onClick={trackingActive ? stopTracking : startTracking}
              className={trackingActive ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#142a1e] border border-[#2a5438] text-emerald-300 hover:border-emerald-400'}
            >
              <Locate className="w-4 h-4 mr-2" />
              {trackingActive ? 'Tracking On' : 'Track My Location'}
            </Button>
            <Button
              size="lg"
              onClick={() => { setShowNavigate(!showNavigate); setNavError(''); setSelectedNavLot(null); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-900"
            >
              <Navigation className="w-5 h-5 mr-2" /> Navigate
            </Button>
          </div>
        </div>

        {/* Favorite Spots Section */}
        {favoriteLots.length > 0 && (
          <div className="bg-[#142a1e] border border-yellow-500/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-yellow-300">Your Favorite Spots</h2>
              <span className="text-xs text-yellow-400/60 ml-1">({favoriteLots.length})</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {favoriteLots.map((lot) => {
                const occupancyColor =
                  lot.predictedOccupancy <= 25 ? 'text-emerald-400' :
                  lot.predictedOccupancy <= 50 ? 'text-yellow-400' :
                  lot.predictedOccupancy <= 75 ? 'text-orange-400' : 'text-red-400';
                const dotColor =
                  lot.predictedOccupancy <= 25 ? 'bg-emerald-400' :
                  lot.predictedOccupancy <= 50 ? 'bg-yellow-400' :
                  lot.predictedOccupancy <= 75 ? 'bg-orange-400' : 'bg-red-400';
                return (
                  <div key={lot.id} className="flex items-center justify-between bg-[#0d2818] border border-yellow-500/30 rounded-xl p-4 hover:border-yellow-400 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                      <div>
                        <p className="font-semibold text-sm text-white">{lot.name}</p>
                        <p className={`text-xs font-bold ${occupancyColor}`}>{lot.predictedOccupancy}% full</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigateToLot(lot)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs transition-all"
                    >
                      <Navigation className="w-3 h-3" /> Go
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No favorites hint */}
        {user && favoriteLotIds.length === 0 && (
          <div className="bg-[#142a1e] border border-[#2a5438] border-dashed rounded-2xl p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-slate-500" />
            <p className="text-sm text-slate-400">
              No favorite spots yet. Go to <span className="text-emerald-400 font-semibold">Settings → Favorite Spots</span> to add some!
            </p>
          </div>
        )}

        {/* Navigate Panel */}
        {showNavigate && (
          <div className="bg-[#142a1e] border border-emerald-400/60 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Navigate to Parking Lot</h2>
              </div>
              <button onClick={() => { setShowNavigate(false); setNavError(''); setSelectedNavLot(null); }} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">Select a lot and we'll open Google Maps with turn-by-turn directions from your location.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {uniqueLots.map((lot) => {
                const isSelected = selectedNavLot?.id === lot.id;
                const isFav = favoriteLotIds.includes(lot.id);
                const occupancyColor =
                  lot.predictedOccupancy <= 25 ? 'text-emerald-400' :
                  lot.predictedOccupancy <= 50 ? 'text-yellow-400' :
                  lot.predictedOccupancy <= 75 ? 'text-orange-400' : 'text-red-400';
                return (
                  <button
                    key={lot.id}
                    onClick={() => { setSelectedNavLot(lot); setNavError(''); }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected ? 'bg-emerald-900/40 border-emerald-400 shadow-lg' : 'bg-[#0d2818] border-[#2a5438] hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>{lot.name}</p>
                          {isFav && <Star className="w-3 h-3 text-yellow-400" />}
                        </div>
                        <p className={`text-xs font-bold ${occupancyColor}`}>{lot.predictedOccupancy}% full</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {navError && <p className="text-red-400 text-sm mb-3">{navError}</p>}

            <div className="flex gap-3">
              <button
                onClick={handleNavigate}
                disabled={gettingLocation || !selectedNavLot}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold transition-all shadow-lg"
              >
                <Navigation className="w-4 h-4" />
                {gettingLocation ? 'Getting your location...' : 'Open in Google Maps'}
              </button>
              <button
                onClick={() => { setShowNavigate(false); setNavError(''); setSelectedNavLot(null); }}
                className="px-6 py-3 rounded-xl border border-[#2a5438] text-slate-300 hover:border-emerald-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Parked banner */}
        {isParked && parkedLot && (
          <div className="flex items-center justify-between bg-emerald-900/60 border border-emerald-400/60 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-100">You&apos;re parked!</p>
                <p className="text-sm text-emerald-300">{lotLabel(parkedLot)}</p>
              </div>
            </div>
            <button onClick={handleLeave} className="px-4 py-2 rounded-xl bg-red-700/60 hover:bg-red-700 border border-red-500/50 text-red-200 text-sm font-semibold transition">
              I&apos;ve Left
            </button>
          </div>
        )}

        {/* Detected in lot */}
        {trackingActive && detectedLot && !isParked && (
          <div className="flex items-center justify-between bg-[#1a3d28] border border-[#e0b83a]/50 rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <Car className="w-6 h-6 text-[#e0b83a]" />
              <div>
                <p className="font-bold text-[#e0b83a]">You&apos;re in {lotLabel(detectedLot)}</p>
                <p className="text-sm text-slate-400">Are you parking here?</p>
              </div>
            </div>
            <button onClick={handleImParked} className="px-5 py-2 rounded-xl bg-[#e0b83a] hover:bg-[#f0c94d] text-[#132217] font-bold text-sm transition shadow-lg">
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
                    options={{ styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }] }}
                  >
                    {uniqueLots.map((lot, index) => (
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
                  <MapPin className="w-5 h-5" /> Occupancy Legend
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
                    <span className="text-sm">{item.label}</span>
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
                      <div className="text-2xl font-bold text-blue-400">{selectedLot.predictedOccupancy}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Available</span>
                      <div className="text-xl font-bold text-green-400">
                        {Math.round(selectedLot.totalCapacity * (1 - selectedLot.predictedOccupancy / 100))}/{selectedLot.totalCapacity}
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold"
                    onClick={() => navigateToLot(selectedLot)}
                  >
                    <Navigation className="w-4 h-4 mr-2" /> Navigate Here
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              {uniqueLots.slice(0, 4).map((lot, index) => (
                <div key={index} className="p-4 rounded-xl hover:bg-[#1a3d28] transition-colors">
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