import Link from 'next/link';
import { Leaf } from 'lucide-react';
import PlantNavLinks from './PlantNavLinks';
import { PT } from '@/lib/plantTheme';

export const metadata = {
  title: 'Plant Monitor',
  description: 'Monitoreo inteligente de plantas en tiempo real',
};

export const T = {
  pageBg:    PT.pageBg,
  cardBg:    PT.card,
  cardRaise: PT.cardRaise,
  border:    PT.border,
  borderDim: PT.borderDim,
  navBg:     PT.soil,
  accent:    PT.green,
  accentDim: PT.greenSoft,
  textHi:    PT.textHi,
  textMed:   PT.textMed,
  textDim:   PT.textDim,
};

export default function PlantasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: PT.pageGrad, color: PT.textHi }}>

      {/* ── Sidebar izquierda ── */}
      <aside
        className="sticky top-0 h-screen flex flex-col shrink-0 w-16 sm:w-52"
        style={{
          background: `linear-gradient(180deg, ${PT.soil} 0%, #543A24 100%)`,
          borderRight: `2px solid ${PT.soilDark}`,
          borderTop: `3px solid ${PT.grass}`,
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 sm:px-4 py-5"
          style={{ borderBottom: `1px solid rgba(242,232,213,0.12)` }}>
          <div
            className="flex items-center justify-center shrink-0"
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: `linear-gradient(135deg, ${PT.grass} 0%, ${PT.greenDeep} 100%)`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.2)',
            }}
          >
            <Leaf size={18} style={{ color: '#fff' }} strokeWidth={2.4} />
          </div>

          <div className="hidden sm:flex flex-col gap-0.5 min-w-0">
            <span className="font-bold text-sm leading-tight tracking-tight" style={{ color: PT.textNav }}>
              Plant Monitor
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-bold w-fit flex items-center gap-1"
              style={{
                background: 'rgba(116,173,58,0.22)',
                color: PT.grass,
                border: `1px solid rgba(116,173,58,0.5)`,
                letterSpacing: '0.05em',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: PT.grass }} />
              LIVE
            </span>
          </div>
        </div>

        {/* Links de navegación */}
        <nav className="flex-1 p-2 sm:p-3 pt-3">
          <PlantNavLinks />
        </nav>

        {/* Footer sidebar */}
        <div className="hidden sm:block px-4 py-4"
          style={{ borderTop: `1px solid rgba(242,232,213,0.1)` }}>
          <p className="text-xs leading-relaxed" style={{ color: PT.textNavDim }}>
            ESP32 + HiveMQ<br />+ Supabase
          </p>
        </div>
      </aside>

      {/* ── Contenido principal ── */}
      <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
