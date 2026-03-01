import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowRight, Users, Camera, Clock, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mb-6">
            Smart Parking
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              System
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Park smarter with real-time occupancy, AI photo simulation, and schedule-based recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/status">
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/ai">
              <Button variant="secondary" size="lg">
                Try AI Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center group hover:scale-105 transition-all duration-300">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Real-Time Status</h3>
            <p className="text-slate-400">Live occupancy updates across all campus lots.</p>
          </Card>
          
          <Card className="text-center group hover:scale-105 transition-all duration-300">
            <Camera className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">AI Photo Simulation</h3>
            <p className="text-slate-400">Visual spot detection using computer vision.</p>
          </Card>
          
          <Card className="text-center group hover:scale-105 transition-all duration-300">
            <Clock className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Schedule Recommendations</h3>
            <p className="text-slate-400">Smart parking suggestions based on your classes.</p>
          </Card>
          
          <Card className="text-center group hover:scale-105 transition-all duration-300">
            <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">FSC Secure</h3>
            <p className="text-slate-400">@farmingdale.edu authentication required.</p>
          </Card>
        </div>
      </section>

      {/* Live Preview Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Live Parking Status
            </h2>
            <p className="text-xl text-slate-400 max-w-lg">
              See exactly which lots have space right now.
            </p>
            <Link href="/status" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-lg font-semibold group">
              <span>View All Lots</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="group">
              <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-bold text-white text-lg">32%</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Lot 15</h4>
                  <p className="text-sm text-slate-400">32/51 Available</p>
                </div>
              </div>
            </div>
            <div className="group">
              <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="font-bold text-white text-lg">68%</span>
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Lot 15A</h4>
                  <p className="text-sm text-slate-400">18/46 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}