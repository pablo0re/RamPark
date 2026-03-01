import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ram Park - Smart Parking System',
  description: 'Farmingdale State College Smart Parking Solution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900/50 to-slate-950">
          {children}
        </main>
      </body>
    </html>
  );
}