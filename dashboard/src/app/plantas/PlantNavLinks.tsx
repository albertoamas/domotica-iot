'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History } from 'lucide-react';
import { PT } from '@/lib/plantTheme';

const LINKS = [
  { href: '/plantas',           label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plantas/historial', label: 'Historial', icon: History },
];

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
            className="flex items-center gap-1.5 px-3 min-h-[38px] text-sm font-semibold rounded-lg transition-all"
            style={active
              ? {
                  background: 'rgba(116,173,58,0.2)',
                  color: PT.grass,
                  border: '1px solid rgba(116,173,58,0.45)',
                }
              : {
                  color: PT.textNav,
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
