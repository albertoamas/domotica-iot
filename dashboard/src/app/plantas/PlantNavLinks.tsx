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
    <div className="flex flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-semibold transition-all"
            style={active
              ? {
                  background: 'rgba(116,173,58,0.22)',
                  color: PT.grass,
                  border: '1px solid rgba(116,173,58,0.45)',
                }
              : {
                  color: PT.textNav,
                  border: '1px solid transparent',
                }
            }
            title={label}
          >
            <Icon size={16} className="shrink-0" />
            <span className="hidden sm:inline truncate">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
