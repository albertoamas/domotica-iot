'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
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
  height?: number;
  transform?: (v: number) => number;
}

const S = '#0f1c0b';
const B = '#1e3d17';

const tooltipStyle = {
  backgroundColor: '#0f1c0b',
  border: '1px solid #1e3d17',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e8f5e1',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function PlantChart({
  sensorType, label, color, unit, height = 200, transform,
}: PlantChartProps) {
  const [data, setData] = useState<PlantReading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setData(await fetchPlantHistory(sensorType, PLANT_CHART_LIMIT));
    } catch (err) {
      console.error(`[PlantChart] ${sensorType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [sensorType]);

  useEffect(() => {
    loadHistory();

    // Polling cada 5s — respaldo si Realtime no está habilitado
    const interval = setInterval(loadHistory, 5000);

    const channel = supabase
      .channel(`plant-chart-${sensorType}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plant_readings' }, (payload) => {
        const row = payload.new as PlantReading;
        if (row.sensor_type !== sensorType) return;
        setData((prev) => [...prev, row].slice(-PLANT_CHART_LIMIT));
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [sensorType, loadHistory]);

  const lastVal = data.length > 0 ? data[data.length - 1].valor : null;
  const displayLast = lastVal !== null ? (transform ? transform(lastVal) : lastVal) : null;

  const chartData = data.map((r) => ({
    time: formatTime(r.created_at),
    valor: transform ? transform(r.valor) : Number(r.valor),
  }));

  const gradientId = `grad-${sensorType}`;

  return (
    <div className="rounded-xl p-4" style={{ background: S, border: `1px solid ${B}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#e8f5e1' }}>{label}</h3>
        {!loading && displayLast !== null && (
          <span className="text-sm font-bold px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', color }}>
            {displayLast}{unit}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ height }} className="flex items-center justify-center text-sm">
          <span style={{ color: '#3a5c34' }}>Cargando...</span>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height }} className="flex items-center justify-center">
          <span className="text-sm" style={{ color: '#3a5c34' }}>Sin datos aún</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#142a10" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#4a7c40' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#4a7c40' }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}${unit}`, label]} />
            {sensorType === 'humedad_suelo' && (
              <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 2"
                label={{ value: 'Seco', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }} />
            )}
            <Area
              type="monotone" dataKey="valor"
              stroke={color} strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false} activeDot={{ r: 5, fill: color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
