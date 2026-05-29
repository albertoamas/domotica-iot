'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart2 } from 'lucide-react';

const LINKS = [
  { href: '/plantas',         label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plantas/graficas', label: 'Gráficas',  icon: BarChart2       },
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
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
            style={active
              ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
              : { color: '#6b7280' }
            }
          >
            <Icon size={14} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
