'use client';

import { AlertTriangle } from 'lucide-react';
import { GAS_ALERT_THRESHOLD } from '@/lib/types';

interface GasAlertProps {
  habitacion: 1 | 2;
  gasValue: number | null;
}

export default function GasAlert({ habitacion, gasValue }: GasAlertProps) {
  if (gasValue === null || gasValue <= GAS_ALERT_THRESHOLD) return null;

  return (
    <div className="flex items-center gap-3 bg-red-600 text-white rounded-xl px-4 py-3 animate-pulse">
      <AlertTriangle size={22} className="shrink-0" />
      <div>
        <p className="font-bold text-sm">
          ⚠ Alerta de Gas — Habitación {habitacion}
        </p>
        <p className="text-xs opacity-90">
          Nivel: {gasValue} (umbral: {GAS_ALERT_THRESHOLD}). Ventila el ambiente.
        </p>
      </div>
    </div>
  );
}
