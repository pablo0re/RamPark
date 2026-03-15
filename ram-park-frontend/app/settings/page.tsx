'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Shield, Bell, Globe, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Settings
        </h1>
        <p className="text-xl text-gray-600">Manage your Ram Park preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                defaultValue="student@farmingdale.edu"
              />
            </div>
            <Button className="w-full">Save Profile</Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Two-Factor Authentication</span>
              </label>
              <Button variant="outline" className="w-full">Change Password</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-6 h-6" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Parking availability alerts</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Class schedule reminders</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}