'use client';
import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';

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
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900">
              <Navigation className="w-5 h-5 mr-2" />
              Navigate
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="shadow-2xl border-[#2a5438] bg-[#142a1e]">
              <CardContent className="p-0">
                {/* map as before, maybe change loading bg */}
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
                  {lots.map((lot) => (
                    <Marker
                      key={lot.id}
                      position={{ lat: lot.lat, lng: lot.lng }}
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

        {/* Lot Legend & Selected Info */}
        <div className="space-y-6">
          {/* Legend */}
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
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Selected Lot */}
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

      {/* Quick Stats */}
      <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {lots.slice(0, 4).map((lot) => (
              <div key={lot.id} className="p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="text-2xl font-bold">{lot.predictedOccupancy}%</div>
                <div className="text-sm text-gray-600 truncate">{lot.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}