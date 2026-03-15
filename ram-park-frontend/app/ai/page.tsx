'use client';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Camera, Image } from 'lucide-react';

export default function AIPage() {
  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#e0b83a] to-[#c9a227] bg-clip-text text-transparent mb-4">
            AI Photo Simulation
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Upload photos of Lot 15 or Lot 15A to simulate AI spot detection and get instant occupancy updates.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="w-6 h-6 text-emerald-300" />
                <span>Upload Photo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload lotId="lot15" />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Image className="w-6 h-6 text-emerald-300" />
                  <span>Supported Lots</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1a3d28] rounded-xl">
                  <span className="font-medium">Lot 15 (Student)</span>
                  <span className="text-green-400 font-bold">51 spots</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#1a3d28] rounded-xl">
                  <span className="font-medium">Lot 15A (Staff)</span>
                  <span className="text-orange-400 font-bold">46 spots</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl bg-[#142a1e] border-[#2a5438]">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
                  <li>Upload photo → Saved to Firebase Storage</li>
                  <li>AI simulates spot detection</li>
                  <li>Updates photoOccupancy% in real-time</li>
                  <li>Triggers prediction recalculation</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}