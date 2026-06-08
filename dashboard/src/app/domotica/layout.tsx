import Link from 'next/link';
import { Wifi, ArrowLeft } from 'lucide-react';
import NavLinks from './NavLinks';

export const metadata = {
  title: 'Domótica IoT',
};

export default function DomoticaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft size={13} />
              Proyectos
            </Link>
            <div className="w-px h-5 bg-gray-200" />
            <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
              <Wifi size={20} className="text-blue-500" />
              Domótica IoT
            </div>
          </div>
          <NavLinks />
        </div>
      </nav>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Domótica IoT · ESP32 + HiveMQ + Supabase
      </footer>
    </div>
  );
}
