'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { supabase, fetchSensorHistory } from '@/lib/supabase';
import type { SensorReading, SensorType } from '@/lib/types';
import { GAS_ALERT_THRESHOLD, CHART_HISTORY_LIMIT } from '@/lib/types';

interface SensorChartProps {
  habitacion: 1 | 2;
  sensorType: SensorType;
  label: string;
  color: string;
  unit: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function SensorChart({ habitacion, sensorType, label, color, unit }: SensorChartProps) {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const rows = await fetchSensorHistory(habitacion, sensorType, CHART_HISTORY_LIMIT);
      setData(rows);
    } catch (err) {
      console.error(`[SensorChart] Error cargando ${sensorType} H${habitacion}:`, err);
    } finally {
      setLoading(false);
    }
  }, [habitacion, sensorType]);

  useEffect(() => {
    loadHistory();

    // Polling cada 5s — respaldo si Realtime no está habilitado
    const interval = setInterval(loadHistory, 5000);

    const channel = supabase
      .channel(`chart-${habitacion}-${sensorType}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: `habitacion=eq.${habitacion}`,
        },
        (payload) => {
          const row = payload.new as SensorReading;
          if (row.sensor_type !== sensorType) return;

          setData((prev) => {
            const updated = [...prev, row];
            // Mantener solo los últimos CHART_HISTORY_LIMIT puntos
            return updated.slice(-CHART_HISTORY_LIMIT);
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [habitacion, sensorType, loadHistory]);

  const chartData = data.map((r) => ({
    time: formatTime(r.created_at),
    valor: Number(r.valor),
  }));

  const showAlert = sensorType === 'gas';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {label} — Hab. {habitacion}
        </h3>
        {!loading && data.length > 0 && (
          <span className="text-xs text-gray-400">
            Último: <strong className="text-gray-700">{data[data.length - 1].valor}{unit}</strong>
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
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
              formatter={(val) => [`${val}${unit}`, label]}
            />
            {showAlert && (
              <ReferenceLine
                y={GAS_ALERT_THRESHOLD}
                stroke="#ef4444"
                strokeDasharray="4 2"
                label={{ value: 'Alerta', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="valor"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
