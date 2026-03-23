import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';


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
    <html lang="en" className="bg-[#0d2818] text-slate-50" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0d2818] text-slate-50`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}