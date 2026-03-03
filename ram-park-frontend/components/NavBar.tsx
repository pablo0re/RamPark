'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const NavbarComponent = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Map', icon: '🗺️' },
    { href: '/status', label: 'Status', icon: '📊' },
    { href: '/ai', label: 'AI Simulation', icon: '🤖' },
    { href: '/recommend', label: 'Recommendations', icon: '🚗' },
  ];

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
            <span className="font-bold text-white text-xl">RP</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Ram Park
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>


        {/* Right Side - User/Auth */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {user ? (
            <>
              <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 px-3 py-1 rounded-xl">
                <User size={16} className="text-slate-400" />
                <span className="text-sm text-slate-300 max-w-32 truncate">
                  {user.email}
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="hidden md:inline-flex">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg">
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;