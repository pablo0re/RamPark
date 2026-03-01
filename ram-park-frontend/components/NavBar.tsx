'use client';
import Link from 'next/link';
import { Menu, User } from 'lucide-react';

const NavbarComponent = () => {
  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="font-bold text-white text-lg">RP</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Ram Park
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/status" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
            Status
          </Link>
          <Link href="/ai" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
            AI Simulation
          </Link>
          <Link href="/recommend" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
            Recommendations
          </Link>
          <Link href="/admin" className="text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors">
            Admin
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="p-2 text-slate-400 hover:text-white rounded-lg">
            <User size={20} />
          </button>
          <button className="md:hidden p-2 text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
export default NavbarComponent;