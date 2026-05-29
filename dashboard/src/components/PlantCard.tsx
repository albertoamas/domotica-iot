'use client';

import { Thermometer, Droplets, Sun, Moon, Sprout } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { sueloPercent } from '@/lib/plantTypes';

interface PlantCardProps {
  state: PlantState;
}

function MetricRow({
  icon, label, value, unit, color = 'text-gray-800',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>
        {value !== null ? `${value}${unit ?? ''}` : '—'}
      </span>
    </div>
  );
}

export default function PlantCard({ state }: PlantCardProps) {
  const hayLuz     = state.luz_estado === 1;
  const sueloPct   = sueloPercent(state.humedad_suelo);
  const sueloColor = sueloPct === null ? 'text-gray-800'
    : sueloPct < 25 ? 'text-red-600'
    : sueloPct < 50 ? 'text-yellow-600'
    : 'text-green-600';

  const horasSol    = state.horas_sol    !== null ? state.horas_sol.toFixed(2)    : null;
  const horasSombra = state.horas_sombra !== null ? state.horas_sombra.toFixed(2) : null;

  const lastUpdate = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('es-ES')
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-green-100 p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sprout size={22} className="text-green-500" />
          <h2 className="text-xl font-bold text-gray-800">Monitoreo de Planta</h2>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
          hayLuz ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'
        }`}>
          {hayLuz ? <Sun size={12} /> : <Moon size={12} />}
          {hayLuz ? 'Con luz' : 'Sombra'}
        </div>
      </div>

      {/* Métricas */}
      <div className="flex flex-col gap-2">
        <MetricRow
          icon={<Thermometer size={18} className="text-orange-500" />}
          label="Temperatura"
          value={state.temperatura !== null ? String(state.temperatura) : null}
          unit=" °C"
        />
        <MetricRow
          icon={<Droplets size={18} className="text-blue-500" />}
          label="Humedad del aire"
          value={state.humedad_aire !== null ? String(state.humedad_aire) : null}
          unit=" %"
        />
        <MetricRow
          icon={<Droplets size={18} className="text-teal-500" />}
          label="Humedad del suelo"
          value={sueloPct !== null ? String(sueloPct) : null}
          unit=" %"
          color={sueloColor}
        />
      </div>

      {/* Horas sol / sombra */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="flex flex-col items-center bg-yellow-50 rounded-xl py-3">
          <Sun size={20} className="text-yellow-500 mb-1" />
          <span className="text-2xl font-bold text-yellow-600">{horasSol ?? '—'}</span>
          <span className="text-xs text-gray-500 mt-0.5">horas de sol</span>
        </div>
        <div className="flex flex-col items-center bg-indigo-50 rounded-xl py-3">
          <Moon size={20} className="text-indigo-400 mb-1" />
          <span className="text-2xl font-bold text-indigo-600">{horasSombra ?? '—'}</span>
          <span className="text-xs text-gray-500 mt-0.5">horas de sombra</span>
        </div>
      </div>

      {/* Barra de humedad de suelo */}
      {sueloPct !== null && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Humedad del suelo</span>
            <span>{sueloPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sueloPct < 25 ? 'bg-red-400'
                : sueloPct < 50 ? 'bg-yellow-400'
                : 'bg-green-400'
              }`}
              style={{ width: `${sueloPct}%` }}
            />
          </div>
        </div>
      )}

      {lastUpdate && (
        <p className="text-xs text-gray-400 text-right">Actualizado: {lastUpdate}</p>
      )}
    </div>
  );
}
