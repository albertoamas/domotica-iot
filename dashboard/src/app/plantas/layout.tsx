import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';
import PlantNavLinks from './PlantNavLinks';

export const metadata = {
  title: 'Plant Monitor',
  description: 'Monitoreo inteligente de plantas en tiempo real',
};

// ── Paleta Minecraft: bloque de tierra con pasto ──────────────────────────
export const T = {
  pageBg:    '#1E3010',   // suelo del bosque oscuro
  cardBg:    '#ffffff',
  cardRaise: '#f0fdf4',
  border:    '#4A7230',
  borderDim: '#2D4A1A',
  navBg:     '#6B4422',   // tierra Minecraft
  navGrass:  '#55A729',   // pasto Minecraft
  navDark:   '#3D2810',   // tierra oscura (borde inferior)
  accent:    '#76C430',   // verde brillante Minecraft
  accentDim: '#3D7A1A',
  textNav:   '#F0E6C0',   // trigo/arena — legible sobre marrón
  textNavDim:'rgba(240,230,192,0.55)',
  textHi:    '#14532d',
  textMed:   '#166534',
  textDim:   '#6b9960',
};

export default function PlantasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col" style={{ background: T.pageBg, color: T.textHi }}>

      {/* ── Navbar: lateral del bloque de tierra con pasto ── */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: T.navBg,
          borderTop:    `6px solid ${T.navGrass}`,
          borderBottom: `3px solid ${T.navDark}`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
        }}
      >
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">

          {/* ── Izquierda: volver + logo ── */}
          <div className="flex items-center gap-4">

            {/* Volver */}
            <Link
              href="/"
              className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
              style={{ color: T.textNavDim }}
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Proyectos</span>
            </Link>

            {/* Divisor */}
            <div className="w-px h-5" style={{ background: 'rgba(240,230,192,0.2)' }} />

            {/* Logo: mini bloque Minecraft */}
            <div className="flex items-center gap-2.5">
              <div style={{
                width: 32, height: 32,
                borderRadius: 4,
                overflow: 'hidden',
                border: `2px solid ${T.navDark}`,
                flexShrink: 0,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
              }}>
                {/* Franja de pasto */}
                <div style={{ height: 11, background: T.navGrass }} />
                {/* Cuerpo de tierra con hoja */}
                <div style={{
                  height: 21,
                  background: T.navBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Leaf size={11} style={{ color: 'rgba(240,230,192,0.7)' }} />
                </div>
              </div>

              {/* Título + badge */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight" style={{ color: T.textNav }}>
                  Plant Monitor
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: 'rgba(85,167,41,0.25)',
                    color: T.navGrass,
                    border: `1px solid ${T.navGrass}`,
                    letterSpacing: '0.05em',
                  }}
                >
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
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-7">{children}</main>

      {/* ── Footer: mismo tono tierra ── */}
      <footer
        className="text-center text-xs py-3"
        style={{
          color: T.textNavDim,
          background: T.navBg,
          borderTop: `3px solid ${T.navDark}`,
        }}
      >
        Plant Monitor · ESP32 + HiveMQ + Supabase
      </footer>

    </div>
  );
}
