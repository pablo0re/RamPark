'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { getLots } from '@/lib/api';
import { ParkingLot } from '@/lib/api';
import { TrendingUp, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function PredictionsPage() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getLots();
      setLots(data);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const bestLot = lots.reduce((best, lot) => 
    lot.predictedOccupancy < best.predictedOccupancy ? lot : best, lots[0]
  );

  const worstLot = lots.reduce((worst, lot) => 
    lot.predictedOccupancy > worst.predictedOccupancy ? lot : worst, lots[0]
  );

  const stats = {
    totalSpots: lots.reduce((sum, lot) => sum + lot.totalCapacity, 0),
    predictedAvailable: lots.reduce((sum, lot) => 
      sum + Math.round(lot.totalCapacity * (1 - lot.predictedOccupancy / 100)), 0
    ),
    avgOccupancy: Math.round(
      lots.reduce((sum, lot) => sum + lot.predictedOccupancy, 0) / lots.length
    )
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Predictions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Next hour occupancy predictions powered by machine learning
        </p>
      </div>

      {/*  Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-xl border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-600">
              {stats.predictedAvailable}
            </CardTitle>
            <p className="text-sm text-green-700">Spots Available (Next Hour)</p>
          </CardHeader>
        </Card>

        <Card className="shadow-xl border-orange-200 bg-orange-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-orange-600">
              {stats.avgOccupancy}%
            </CardTitle>
            <p className="text-sm text-orange-700">Avg Occupancy Prediction</p>
          </CardHeader>
        </Card>

        <Card className="shadow-xl border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-blue-600">
              Lot {bestLot.name.replace('Lot ', '')}
            </CardTitle>
            <p className="text-sm text-blue-700">Best Lot to Park</p>
          </CardHeader>
        </Card>
      </div>

      {/* Lot Predictions */}
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6" />
            <span>Next Hour Predictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 font-semibold text-gray-900">Lot</th>
                  <th className="text-left py-4 font-semibold text-gray-900">Current</th>
                  <th className="text-left py-4 font-semibold text-gray-900">Predicted</th>
                  <th className="text-left py-4 font-semibold text-gray-900">Change</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 font-medium">{lot.name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        lot.occupancyColor === 'green' ? 'bg-green-100 text-green-800' :
                        lot.occupancyColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        lot.occupancyColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {lot.predictedOccupancy}%
                      </span>
                    </td>
                    <td className="py-4 font-semibold">{lot.predictedOccupancy + 5}%</td>
                    <td className="py-4">
                      <span className="text-sm font-semibold text-red-600">+5%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xl border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="w-6 h-6" />
            <span>Parking Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-900">Lot 15A filling up fast</p>
                <p className="text-sm text-yellow-800">Predicted to reach 90% in 30 minutes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}