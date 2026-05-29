'use client';

import { Sun, Moon, Leaf } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { sueloPercent } from '@/lib/plantTypes';

const S = '#160d03';   // surface
const B = '#2a1605';   // border

interface PlantCardProps { state: PlantState }

function Stat({ label, value, color }: { label: string; value: string | null; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${B}` }}>
      <span className="text-xs" style={{ color: '#6b7280' }}>{label}</span>
      <span className="text-xl font-bold" style={{ color }}>{value ?? '—'}</span>
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

  const lastUpdate = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('es-ES') : null;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: S, border: `1px solid ${B}` }}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf size={18} className="text-green-400" />
          <span className="font-semibold text-white">Estado actual</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={hayLuz
            ? { background: 'rgba(250,204,21,0.08)', color: '#fbbf24', border: '1px solid #713f12' }
            : { background: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid #312e81' }}>
          {hayLuz ? <Sun size={11} /> : <Moon size={11} />}
          <span className="ml-1">{hayLuz ? 'Con luz' : 'Sombra'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Temperatura" value={state.temperatura !== null ? `${state.temperatura} °C` : null} color="#fb923c" />
        <Stat label="Humedad aire" value={state.humedad_aire !== null ? `${state.humedad_aire} %` : null} color="#60a5fa" />
        <Stat label="Horas de sol" value={state.horas_sol !== null ? `${state.horas_sol.toFixed(2)} h` : null} color="#fde68a" />
        <Stat label="Horas sombra" value={state.horas_sombra !== null ? `${state.horas_sombra.toFixed(2)} h` : null} color="#818cf8" />
      </div>

      {/* Barra humedad suelo */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: '#6b7280' }}>
          <span>Humedad del suelo</span>
          <span style={{ color: sueloColor }}>{sueloPct !== null ? `${sueloPct}%` : '—'}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1f1000' }}>
          {sueloPct !== null && (
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${sueloPct}%`, background: sueloColor }} />
          )}
        </div>
        <div className="flex justify-between text-xs mt-1" style={{ color: '#374151' }}>
          <span>Seco</span><span>Húmedo</span>
        </div>
      </div>

      {lastUpdate && <p className="text-xs text-right" style={{ color: '#374151' }}>Act: {lastUpdate}</p>}
    </div>
  );
}
