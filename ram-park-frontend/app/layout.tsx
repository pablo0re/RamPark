import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ram Park - Smart Parking System',
  description: 'FSC Smart Parking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-slate-900`}>
        <AuthProvider>
              {/* Page Content */}
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
        </AuthProvider>
      </body>
    </html>
  );
}