'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { fetchPlantTodayStats } from '@/lib/plantSupabase';
import type { PlantTodayStats } from '@/lib/plantSupabase';
import { sueloPercent } from '@/lib/plantTypes';
import { PT, SENSOR } from '@/lib/plantTheme';

const SENSORS = [
  { key: 'temperatura'   as const, label: 'Temperatura',  unit: '°C', color: SENSOR.temp },
  { key: 'humedad_aire'  as const, label: 'Humedad aire', unit: '%',  color: SENSOR.hum  },
  { key: 'humedad_suelo' as const, label: 'Suelo',        unit: '%',  color: SENSOR.soil, toPercent: true },
];

const ROWS = [
  { label: 'Mín',  key: 'min' as const, icon: TrendingDown },
  { label: 'Prom', key: 'avg' as const, icon: Minus },
  { label: 'Máx',  key: 'max' as const, icon: TrendingUp },
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
    <div className="rounded-3xl p-6 flex flex-col gap-5"
      style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadow }}>

      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: PT.textDim }}>
        Resumen de hoy
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SENSORS.map(({ key, label, unit, color, toPercent }) => {
          const raw = stats?.[key];
          const s = raw ? {
            min: toPercent ? (sueloPercent(raw.min) ?? raw.min) : raw.min,
            max: toPercent ? (sueloPercent(raw.max) ?? raw.max) : raw.max,
            avg: toPercent ? (sueloPercent(raw.avg) ?? raw.avg) : raw.avg,
          } : null;

          return (
            <div key={key} className="flex flex-col gap-3 p-4 rounded-2xl"
              style={{ background: PT.cardRaise, border: `1px solid ${PT.borderDim}` }}>
              {/* Cabecera con punto de color */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                <span className="text-sm font-bold" style={{ color: PT.textHi }}>{label}</span>
              </div>

              {s ? (
                <div className="flex flex-col gap-2">
                  {ROWS.map(({ label: l, key: rk, icon: Icon }) => (
                    <div key={l} className="flex items-center justify-between">
                      <span className="text-xs flex items-center gap-1.5" style={{ color: PT.textMed }}>
                        <Icon size={12} style={{ color }} />{l}
                      </span>
                      <span className="text-base font-extrabold" style={{ color: PT.textHi }}>
                        {s[rk]}<span className="text-xs font-semibold ml-0.5" style={{ color: PT.textDim }}>{unit}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs py-4 text-center" style={{ color: PT.textDim }}>Sin datos hoy</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
