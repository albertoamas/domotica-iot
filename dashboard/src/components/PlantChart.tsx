'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { fetchPlantHistory } from '@/lib/plantSupabase';
import type { PlantReading, PlantSensorType } from '@/lib/plantTypes';
import { PLANT_CHART_LIMIT, sueloPercent } from '@/lib/plantTypes';

interface PlantChartProps {
  sensorType: PlantSensorType;
  label: string;
  color: string;
  unit: string;
  // Transformar el valor antes de graficarlo (ej: suelo raw → %)
  transform?: (v: number) => number;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function PlantChart({ sensorType, label, color, unit, transform }: PlantChartProps) {
  const [data, setData] = useState<PlantReading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const rows = await fetchPlantHistory(sensorType, PLANT_CHART_LIMIT);
      setData(rows);
    } catch (err) {
      console.error(`[PlantChart] Error ${sensorType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [sensorType]);

  useEffect(() => {
    loadHistory();

    const channel = supabase
      .channel(`plant-chart-${sensorType}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'plant_readings' },
        (payload) => {
          const row = payload.new as PlantReading;
          if (row.sensor_type !== sensorType) return;
          setData((prev) => [...prev, row].slice(-PLANT_CHART_LIMIT));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sensorType, loadHistory]);

  const lastVal = data.length > 0 ? data[data.length - 1].valor : null;
  const displayLast = lastVal !== null
    ? (transform ? transform(lastVal) : lastVal)
    : null;

  const chartData = data.map((r) => ({
    time: formatTime(r.created_at),
    valor: transform ? transform(r.valor) : Number(r.valor),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
        {!loading && displayLast !== null && (
          <span className="text-xs text-gray-400">
            Último: <strong className="text-gray-700">{displayLast}{unit}</strong>
          </span>
        )}
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
          Cargando datos...
        </div>
      ) : data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
          Sin datos aún
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
              formatter={(val) => [`${val}${unit}`, label]}
            />
            {sensorType === 'humedad_suelo' && (
              <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 2"
                label={{ value: 'Seco', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }} />
            )}
            <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
