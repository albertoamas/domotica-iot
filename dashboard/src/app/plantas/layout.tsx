import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';
import PlantNavLinks from './PlantNavLinks';

export const metadata = {
  title: 'Plant Monitor',
  description: 'Monitoreo inteligente de plantas en tiempo real',
};

// Paleta verde clara — usada en todos los componentes de plantas
export const T = {
  pageBg:    '#f0fdf4',   // green-50, fondo general
  cardBg:    '#ffffff',   // cards blancas
  cardRaise: '#f0fdf4',   // superficie elevada
  border:    '#bbf7d0',   // green-200
  borderDim: '#dcfce7',   // green-100
  navBg:     '#ffffff',   // header blanco
  accent:    '#16a34a',   // green-600, contrasta en fondo claro
  accentDim: '#bbf7d0',   // green-200
  textHi:    '#14532d',   // green-900, texto principal
  textMed:   '#166534',   // green-800, texto secundario
  textDim:   '#6b9960',   // texto sutil
};

export default function PlantasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col" style={{ background: T.pageBg, color: T.textHi }}>
      <header style={{ background: T.navBg, borderBottom: `1px solid ${T.border}` }}
        className="sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
              style={{ color: T.textDim }}>
              <ArrowLeft size={13} />
              Proyectos
            </Link>
            <div className="w-px h-5" style={{ background: T.border }} />
            <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(74,222,128,0.12)', border: `1px solid ${T.accentDim}` }}>
              <Leaf size={16} style={{ color: T.accent }} />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight" style={{ color: T.textHi }}>
                Plant Monitor
              </span>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(74,222,128,0.1)', color: T.accent, border: `1px solid ${T.accentDim}` }}>
                LIVE
              </span>
            </div>
            </div>
          </div>
          <PlantNavLinks />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-7">{children}</main>

      <footer className="text-center text-xs py-4"
        style={{ color: T.textDim, borderTop: `1px solid ${T.borderDim}` }}>
        Plant Monitor · ESP32 + HiveMQ + Supabase
      </footer>
    </div>
  );
}
