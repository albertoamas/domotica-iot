'use client';

import { Thermometer, Droplets, Wind, Sun, Moon } from 'lucide-react';
import type { RoomState } from '@/lib/types';
import { GAS_ALERT_THRESHOLD } from '@/lib/types';

interface RoomCardProps {
  habitacion: 1 | 2;
  state: RoomState;
  children?: React.ReactNode;
}

function MetricRow({
  icon,
  label,
  value,
  unit,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  unit: string;
  danger?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${danger ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2 text-gray-600">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={`text-lg font-bold ${danger ? 'text-red-600' : 'text-gray-800'}`}>
        {value !== null ? `${value}${unit}` : '—'}
      </span>
    </div>
  );
}

export default function RoomCard({ habitacion, state, children }: RoomCardProps) {
  const gasAlert = state.gas !== null && state.gas > GAS_ALERT_THRESHOLD;
  const isOscuro = state.luz === 1;

  const lastUpdate = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleString('es-ES', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : null;

  const isOnline = state.lastUpdate
    ? Date.now() - new Date(state.lastUpdate).getTime() < 15000
    : false;

  return (
    <div className={`bg-white rounded-2xl shadow-md border-2 p-5 flex flex-col gap-3 transition-all ${gasAlert ? 'border-red-400' : 'border-gray-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Habitación {habitacion}</h2>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isOnline ? 'En línea' : 'Offline'}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${isOscuro ? 'bg-indigo-100 text-indigo-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isOscuro ? <Moon size={12} /> : <Sun size={12} />}
          {isOscuro ? 'Oscuro' : 'Con luz'}
        </div>
      </div>

      {/* Métricas */}
      <div className="flex flex-col gap-2">
        <MetricRow
          icon={<Thermometer size={18} className="text-orange-500" />}
          label="Temperatura"
          value={state.temperatura}
          unit=" °C"
        />
        <MetricRow
          icon={<Droplets size={18} className="text-blue-500" />}
          label="Humedad"
          value={state.humedad}
          unit=" %"
        />
        <MetricRow
          icon={<Wind size={18} className={gasAlert ? 'text-red-500' : 'text-green-500'} />}
          label="Gas / Humo"
          value={state.gas}
          unit=""
          danger={gasAlert}
        />
      </div>

      {/* Slot para controles adicionales (ej. LedControl) */}
      {children && (
        <div className="border-t border-gray-100 pt-3">
          {children}
        </div>
      )}

      {/* Última actualización */}
      {lastUpdate && (
        <div className="flex items-center justify-end gap-1.5 text-gray-500">
          <span className="text-xs">Actualizado:</span>
          <span className="text-sm font-semibold text-gray-700">{lastUpdate}</span>
        </div>
      )}
    </div>
  );
}
