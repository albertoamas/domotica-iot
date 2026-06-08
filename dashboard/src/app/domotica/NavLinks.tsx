'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, History } from 'lucide-react';

const LINKS = [
  { href: '/domotica',           label: 'Dashboard', icon: Home      },
  { href: '/domotica/graficas',  label: 'Gráficas',  icon: BarChart2 },
  { href: '/domotica/historial', label: 'Historial', icon: History   },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-2 sm:px-3 min-h-[44px] text-sm font-medium rounded-lg transition-colors ${
              active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
