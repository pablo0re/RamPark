'use client';
import { useState } from 'react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, Image } from 'lucide-react';

export default function AIPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
          AI Photo Simulation
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Upload photos of Lot 15 or Lot 15A to simulate AI spot detection and get instant occupancy updates.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <PhotoUpload />
        
        <div className="space-y-6">
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Supported Lots</h3>
                <p className="text-slate-400">Photo uploads enabled for:</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <span className="font-medium">Lot 15 (Student)</span>
                <span className="text-green-400 font-semibold">51 spots</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <span className="font-medium">Lot 15A (Staff)</span>
                <span className="text-orange-400 font-semibold">46 spots</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <ol className="space-y-2 text-slate-400 text-sm">
              <li>📸 Upload photo </li>
              <li>🧠 AI simulates spot detection (random toggle)</li>
              <li>📊 Updates photoOccupancy% in real-time</li>
              <li>⚡ Triggers prediction recalculation</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}