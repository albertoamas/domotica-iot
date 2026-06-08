'use client';

import { useEffect, useState } from 'react';
import { fetchTodayStats } from '@/lib/supabase';
import type { TodayStats } from '@/lib/types';

interface Props { habitacion: 1 | 2 }

const SENSORS = [
  { key: 'temperatura' as const, label: 'Temperatura', unit: '°C', color: 'text-orange-500' },
  { key: 'humedad'     as const, label: 'Humedad',     unit: '%',  color: 'text-blue-500'   },
  { key: 'gas'         as const, label: 'Gas',         unit: '',   color: 'text-green-600'  },
];

export default function StatsCard({ habitacion }: Props) {
  const [stats, setStats] = useState<TodayStats | null>(null);

  useEffect(() => {
    fetchTodayStats(habitacion).then(setStats).catch(console.error);
    const id = setInterval(() => {
      fetchTodayStats(habitacion).then(setStats).catch(console.error);
    }, 30000);
    return () => clearInterval(id);
  }, [habitacion]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Últimas 24 h - Hab. {habitacion}
      </h3>

      <div className="space-y-3">
        {SENSORS.map(({ key, label, unit, color }) => {
          const s = stats?.[key];
          return (
            <div key={key} className="grid grid-cols-4 gap-2 text-center">
              <span className={`text-xs font-semibold ${color} text-left self-center`}>{label}</span>
              {s ? (
                <>
                  <div className="bg-gray-50 rounded-lg py-1.5">
                    <p className="text-xs text-gray-400">Mín</p>
                    <p className="text-sm font-bold text-gray-700">{s.min}{unit}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-1.5">
                    <p className="text-xs text-gray-400">Máx</p>
                    <p className="text-sm font-bold text-gray-700">{s.max}{unit}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg py-1.5">
                    <p className="text-xs text-blue-400">Prom</p>
                    <p className="text-sm font-bold text-blue-700">{s.avg}{unit}</p>
                  </div>
                </>
              ) : (
                <td colSpan={3} className="text-xs text-gray-300 col-span-3 self-center">Sin datos hoy</td>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
