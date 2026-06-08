'use client';

import { useEffect, useState } from 'react';
import { fetchPlantTodayStats } from '@/lib/plantSupabase';
import type { PlantTodayStats } from '@/lib/plantSupabase';
import { sueloPercent } from '@/lib/plantTypes';

const SENSORS = [
  { key: 'temperatura'   as const, label: 'Temperatura',   unit: '°C', color: '#fb923c' },
  { key: 'humedad_aire'  as const, label: 'Humedad aire',  unit: '%',  color: '#60a5fa' },
  { key: 'humedad_suelo' as const, label: 'Suelo',         unit: '%',  color: '#4ade80', toPercent: true },
];

export default function PlantStatsCard() {
  const [stats, setStats] = useState<PlantTodayStats | null>(null);

  useEffect(() => {
    fetchPlantTodayStats().then(setStats).catch(console.error);
    const id = setInterval(() => {
      fetchPlantTodayStats().then(setStats).catch(console.error);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: '#ffffff', border: '2px solid #bbf7d0' }}>

      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b9960' }}>
        Resumen de hoy
      </span>

      <div className="grid grid-cols-3 gap-3">
        {SENSORS.map(({ key, label, unit, color, toPercent }) => {
          const raw = stats?.[key];
          const s = raw ? {
            min: toPercent ? (sueloPercent(raw.min) ?? raw.min) : raw.min,
            max: toPercent ? (sueloPercent(raw.max) ?? raw.max) : raw.max,
            avg: toPercent ? (sueloPercent(raw.avg) ?? raw.avg) : raw.avg,
          } : null;

          return (
            <div key={key} className="flex flex-col gap-2 p-3 rounded-xl"
              style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <span className="text-xs font-semibold" style={{ color }}>{label}</span>
              {s ? (
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Mín', val: s.min },
                    { label: 'Máx', val: s.max },
                    { label: 'Prom', val: s.avg },
                  ].map(({ label: l, val }) => (
                    <div key={l} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#6b9960' }}>{l}</span>
                      <span className="text-sm font-bold" style={{ color: '#14532d' }}>
                        {val}{unit}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs" style={{ color: '#6b9960' }}>Sin datos hoy</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
