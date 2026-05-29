import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Home, History, Wifi, Sprout } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Domótica IoT — Dashboard',
  description: 'Dashboard de monitoreo de sensores para 2 habitaciones vía ESP32 + HiveMQ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
              <Wifi size={20} className="text-blue-500" />
              Domótica IoT
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Home size={15} />
                Dashboard
              </Link>
              <Link
                href="/historial"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <History size={15} />
                Historial
              </Link>
              <Link
                href="/plantas"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Sprout size={15} />
                Plantas
              </Link>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          Domótica IoT · ESP32 + HiveMQ + Supabase
        </footer>
      </body>
    </html>
  );
}
