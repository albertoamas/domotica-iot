import { Leaf } from 'lucide-react';

export const metadata = {
  title: 'Plant Monitor',
  description: 'Monitoreo inteligente de plantas en tiempo real',
};

// Café negro — toda la sección de plantas usa estos colores
export const CAFE = {
  bg:       '#0c0700',
  surface:  '#160d03',
  border:   '#2a1605',
  nav:      '#0a0500',
  navBorder:'#1f1000',
};

export default function PlantasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col" style={{ background: CAFE.bg, color: '#fff' }}>
      {/* Header */}
      <header style={{ background: CAFE.nav, borderBottom: `1px solid ${CAFE.navBorder}` }}
        className="sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: `1px solid ${CAFE.border}` }}>
              <Leaf size={16} className="text-green-400" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">Plant Monitor</span>
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: `1px solid #166534` }}>
                LIVE
              </span>
            </div>
          </div>
          <span className="text-xs" style={{ color: '#4b5563' }}>Smart Plant Monitoring System</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-7">{children}</main>

      <footer className="text-center text-xs py-4"
        style={{ color: '#2d1a0a', borderTop: `1px solid ${CAFE.navBorder}` }}>
        Plant Monitor · ESP32 + HiveMQ + Supabase
      </footer>
    </div>
  );
}
