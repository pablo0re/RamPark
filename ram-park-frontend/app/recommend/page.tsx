'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Calendar, MapPin } from 'lucide-react';

export default function RecommendationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Smart Recommendations
        </h1>
        <p className="text-xl text-gray-600">
          Find the best parking spot based on your schedule and real-time data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-xl hover:shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <Clock className="w-6 h-6" />
              <span>Next Class</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-gray-900">9:30 AM</p>
              <p className="text-lg text-gray-600 mt-2">CS 301 - Data Structures</p>
              <p className="text-sm text-gray-500 mt-4">Green Hall Room 205</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-600">
              <MapPin className="w-6 h-6" />
              <span>Best Lot</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <span className="font-semibold">Lot 15</span>
              <span className="text-green-600 font-bold">78% available</span>
            </div>
            <Button className="w-full">Navigate</Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-600">
              <Calendar className="w-6 h-6" />
              <span>Today&apos;s Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>8:00 AM - CS 301</span>
                <span className="text-green-600">Lot 15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>10:00 AM - MATH 201</span>
                <span className="text-orange-600">Lot 15A</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>1:00 PM - PHYS 102</span>
                <span className="text-blue-600">Lot 8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}