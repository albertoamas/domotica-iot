'use client';

import { useState } from 'react';
import PlantChart from '@/components/PlantChart';
import type { HistoryRange } from '@/lib/plantSupabase';
import { sueloPercent } from '@/lib/plantTypes';

const RANGES: { value: HistoryRange; label: string }[] = [
  { value: 'realtime', label: 'Tiempo real (50)' },
  { value: '1h',       label: 'Última hora' },
  { value: '6h',       label: 'Últimas 6h' },
  { value: '24h',      label: 'Últimas 24h' },
];

export default function PlantasGraficasPage() {
  const [range, setRange] = useState<HistoryRange>('realtime');

  return (
    <div className="space-y-8">

      {/* ── Cabecera ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#14532d' }}>Gráficas</h1>
          <p className="text-sm mt-1" style={{ color: '#6b9960' }}>
            {range === 'realtime'
              ? 'Últimos 50 registros · actualización cada 5 s'
              : `Rango: ${RANGES.find(r => r.value === range)?.label} · actualización cada 30 s`}
          </p>
        </div>

        {/* Selector de rango */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={range === r.value
                ? { background: '#16a34a', color: '#ffffff' }
                : { background: 'transparent', color: '#6b9960' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ambiente ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b9960' }}>
            Ambiente
          </h2>
          <div className="flex-1 h-px" style={{ background: '#dcfce7' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PlantChart sensorType="temperatura"   label="Temperatura"      color="#fb923c" unit=" °C" height={220} range={range} />
          <PlantChart sensorType="humedad_aire"  label="Humedad del aire" color="#60a5fa" unit=" %"  height={220} range={range} />
          <PlantChart
            sensorType="humedad_suelo"
            label="Humedad del suelo"
            color="#4ade80" unit=" %"
            height={220}
            range={range}
            transform={(v) => sueloPercent(v) ?? 0}
          />
          <PlantChart
            sensorType="horas_sol"
            label="Sol acumulado"
            color="#fde68a" unit=" min"
            height={220}
            range={range}
            transform={(v) => Math.round(v * 60)}
          />
        </div>
      </section>

      {/* ── Sombra y Frío ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b9960' }}>
            Sombra y frío
          </h2>
          <div className="flex-1 h-px" style={{ background: '#dcfce7' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PlantChart
            sensorType="horas_sombra"
            label="Sombra acumulada"
            color="#818cf8" unit=" min"
            height={200}
            range={range}
            transform={(v) => Math.round(v * 60)}
          />
          <PlantChart
            sensorType="horas_frio"
            label="Tiempo en frío (<7°C)"
            color="#a5b4fc" unit=" min"
            height={200}
            range={range}
            transform={(v) => Math.round(v * 60)}
          />
        </div>
      </section>

    </div>
  );
}
