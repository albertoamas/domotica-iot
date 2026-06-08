'use client';

import { useState } from 'react';
import { Wind, Loader2 } from 'lucide-react';

export default function FanControl() {
  const [estado, setEstado]   = useState<'ON' | 'OFF'>('OFF');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function toggleFan() {
    const nuevoEstado = estado === 'ON' ? 'OFF' : 'ON';
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? 'Error desconocido');
      }
      setEstado(nuevoEstado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar comando');
    } finally {
      setLoading(false);
    }
  }

  const isOn = estado === 'ON';

  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <div className="flex items-center gap-2">
        <Wind
          size={20}
          className={isOn ? 'text-cyan-500' : 'text-gray-400'}
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Ventilador</span>
          <span className="ml-2 text-xs text-gray-400">(relay GPIO 13)</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          onClick={toggleFan}
          disabled={loading}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isOn ? 'bg-cyan-400 focus:ring-cyan-400' : 'bg-gray-300 focus:ring-gray-400'
          } disabled:opacity-60`}
          aria-label={`Ventilador: ${estado}`}
        >
          {loading ? (
            <Loader2 size={12} className="absolute left-1/2 -translate-x-1/2 animate-spin text-white" />
          ) : (
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isOn ? 'translate-x-6' : 'translate-x-1'
            }`} />
          )}
        </button>
        <span className={`text-xs font-semibold w-6 ${isOn ? 'text-cyan-600' : 'text-gray-400'}`}>
          {estado}
        </span>
      </div>
    </div>
  );
}
