'use client';

import { Thermometer, Droplets, Sun, Moon, Leaf } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { sueloPercent } from '@/lib/plantTypes';

interface PlantCardProps {
  state: PlantState;
}

function MetricRow({ icon, label, value, unit, valueColor = '#fff' }: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  unit?: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #1f2f1f' }}>
      <div className="flex items-center gap-2" style={{ color: '#9ca3af' }}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-lg font-bold" style={{ color: valueColor }}>
        {value !== null ? `${value}${unit ?? ''}` : '—'}
      </span>
    </div>
  );
}

export default function PlantCard({ state }: PlantCardProps) {
  const hayLuz   = state.luz_estado === 1;
  const sueloPct = sueloPercent(state.humedad_suelo);
  const sueloColor = sueloPct === null ? '#fff'
    : sueloPct < 25 ? '#f87171'
    : sueloPct < 50 ? '#fbbf24'
    : '#4ade80';

  const horasSol    = state.horas_sol    !== null ? state.horas_sol.toFixed(2)    : null;
  const horasSombra = state.horas_sombra !== null ? state.horas_sombra.toFixed(2) : null;
  const lastUpdate  = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('es-ES') : null;

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4"
      style={{ background: '#0d0d0d', border: '1px solid #1a2e1a' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Leaf size={20} className="text-green-400" />
          <span className="text-lg font-bold text-white">Estado de la Planta</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={hayLuz
            ? { background: 'rgba(250,204,21,0.1)', color: '#fbbf24', border: '1px solid #713f12' }
            : { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid #312e81' }}>
          {hayLuz ? <Sun size={11} /> : <Moon size={11} />}
          {hayLuz ? 'Con luz' : 'Sombra'}
        </div>
      </div>

      {/* Métricas */}
      <div className="flex flex-col gap-2">
        <MetricRow
          icon={<Thermometer size={16} className="text-orange-400" />}
          label="Temperatura"
          value={state.temperatura !== null ? String(state.temperatura) : null}
          unit=" °C"
          valueColor="#fb923c"
        />
        <MetricRow
          icon={<Droplets size={16} className="text-blue-400" />}
          label="Humedad del aire"
          value={state.humedad_aire !== null ? String(state.humedad_aire) : null}
          unit=" %"
          valueColor="#60a5fa"
        />
        <MetricRow
          icon={<Droplets size={16} style={{ color: '#34d399' }} />}
          label="Humedad del suelo"
          value={sueloPct !== null ? String(sueloPct) : null}
          unit=" %"
          valueColor={sueloColor}
        />
      </div>

      {/* Barra humedad suelo */}
      {sueloPct !== null && (
        <div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${sueloPct}%`, background: sueloColor }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1" style={{ color: '#4b5563' }}>
            <span>Seco</span>
            <span>Húmedo</span>
          </div>
        </div>
      )}

      {/* Horas sol / sombra */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center py-4 rounded-xl"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid #713f12' }}>
          <Sun size={18} className="text-yellow-400 mb-1.5" />
          <span className="text-2xl font-bold text-yellow-400">{horasSol ?? '—'}</span>
          <span className="text-xs mt-1" style={{ color: '#6b7280' }}>horas de sol</span>
        </div>
        <div className="flex flex-col items-center py-4 rounded-xl"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid #312e81' }}>
          <Moon size={18} className="text-indigo-400 mb-1.5" />
          <span className="text-2xl font-bold text-indigo-400">{horasSombra ?? '—'}</span>
          <span className="text-xs mt-1" style={{ color: '#6b7280' }}>horas de sombra</span>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-xs text-right" style={{ color: '#374151' }}>
          Actualizado: {lastUpdate}
        </p>
      )}
    </div>
  );
}
