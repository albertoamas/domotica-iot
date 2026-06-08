'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2 } from 'lucide-react';

const LINKS = [
  { href: '/plantas',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plantas/graficas', label: 'Gráficas',  icon: BarChart2 },
];

// Colores Minecraft — tierra con pasto
const NAV_GRASS  = '#55A729';
const NAV_ACTIVE_BG = 'rgba(85,167,41,0.22)';
const TEXT_NAV   = 'rgba(240,230,192,0.9)';
const TEXT_DIM   = 'rgba(240,230,192,0.45)';

export default function PlantNavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 px-3 min-h-[36px] text-sm font-semibold rounded transition-all"
            style={active
              ? {
                  background: NAV_ACTIVE_BG,
                  color: NAV_GRASS,
                  border: `1px solid rgba(85,167,41,0.4)`,
                }
              : {
                  color: TEXT_NAV,
                  border: '1px solid transparent',
                }
            }
          >
            <Icon size={15} className="shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
