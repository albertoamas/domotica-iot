import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';
import PlantNavLinks from './PlantNavLinks';
import { PT } from '@/lib/plantTheme';

export const metadata = {
  title: 'Plant Monitor',
  description: 'Monitoreo inteligente de plantas en tiempo real',
};

// Re-export para componentes que aún importan T desde el layout
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
    <div className="min-h-full flex flex-col" style={{ background: PT.pageGrad, color: PT.textHi }}>

      {/* ── Navbar: tierra cálida con fina línea de pasto ── */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: `linear-gradient(180deg, ${PT.soil} 0%, #543A24 100%)`,
          borderTop: `3px solid ${PT.grass}`,
          borderBottom: `2px solid ${PT.soilDark}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">

          {/* ── Izquierda: volver + logo ── */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
              style={{ color: PT.textNavDim }}
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Proyectos</span>
            </Link>

            <div className="w-px h-5" style={{ background: 'rgba(242,232,213,0.18)' }} />

            <div className="flex items-center gap-3">
              {/* Logo: hoja en círculo cálido */}
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: `linear-gradient(135deg, ${PT.grass} 0%, ${PT.greenDeep} 100%)`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.25)',
                  flexShrink: 0,
                }}
              >
                <Leaf size={19} style={{ color: '#fff' }} strokeWidth={2.4} />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight" style={{ color: PT.textNav }}>
                  Plant Monitor
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"
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
          </div>

          {/* ── Derecha: navegación ── */}
          <PlantNavLinks />
        </div>
      </header>

      {/* ── Contenido ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>

      {/* ── Footer ── */}
      <footer
        className="text-center text-xs py-4"
        style={{
          color: PT.textNavDim,
          background: PT.soil,
          borderTop: `2px solid ${PT.soilDark}`,
        }}
      >
        Plant Monitor · ESP32 + HiveMQ + Supabase
      </footer>

    </div>
  );
}
