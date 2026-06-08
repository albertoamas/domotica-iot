'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { fetchLedState } from '@/lib/supabase';

interface LedControlProps {
  habitacion: 1 | 2;
}

export default function LedControl({ habitacion }: LedControlProps) {
  const [estado, setEstado] = useState<'ON' | 'OFF'>('OFF');
  const [initializing, setInitializing] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga el estado real del LED desde Supabase al montar
  useEffect(() => {
    fetchLedState(habitacion)
      .then(setEstado)
      .catch(() => {/* fallback a OFF */})
      .finally(() => setInitializing(false));
  }, [habitacion]);

  async function toggleLed() {
    const nuevoEstado = estado === 'ON' ? 'OFF' : 'ON';
    setToggling(true);
    setError(null);

    try {
      const res = await fetch('/api/led', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitacion, estado: nuevoEstado }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Error desconocido');
      }

      setEstado(nuevoEstado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar comando');
    } finally {
      setToggling(false);
    }
  }

  const isOn = estado === 'ON';
  const busy = initializing || toggling;

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <div className="flex items-center gap-2">
        <Lightbulb
          size={20}
          className={isOn ? 'text-yellow-400' : 'text-gray-400'}
          fill={isOn ? 'currentColor' : 'none'}
        />
        <span className="text-sm font-medium text-gray-700">
          Luz Habitación {habitacion}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
        <button
          onClick={toggleLed}
          disabled={busy}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isOn ? 'bg-yellow-400 focus:ring-yellow-400' : 'bg-gray-300 focus:ring-gray-400'
          } disabled:opacity-60`}
          aria-label={`Luz Habitación ${habitacion}: ${estado}`}
        >
          {busy ? (
            <Loader2 size={12} className="absolute left-1/2 -translate-x-1/2 animate-spin text-white" />
          ) : (
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isOn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          )}
        </button>
        <span className={`text-xs font-semibold w-6 ${isOn ? 'text-yellow-600' : 'text-gray-400'}`}>
          {initializing ? '···' : estado}
        </span>
      </div>
    </div>
  );
}
