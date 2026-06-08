'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { fetchPlantHistory } from '@/lib/plantSupabase';
import type { HistoryRange } from '@/lib/plantSupabase';
import type { PlantReading, PlantSensorType } from '@/lib/plantTypes';
import { PLANT_CHART_LIMIT, sueloPercent } from '@/lib/plantTypes';

interface PlantChartProps {
  sensorType: PlantSensorType;
  label: string;
  color: string;
  unit: string;
  height?: number;
  transform?: (v: number) => number;
  range?: HistoryRange;
}

import { PT } from '@/lib/plantTheme';

const S = PT.card;
const B = PT.border;

const tooltipStyle = {
  backgroundColor: PT.card,
  border: `1px solid ${PT.border}`,
  borderRadius: '10px',
  fontSize: '12px',
  color: PT.textHi,
};

function formatTime(iso: string, longRange = false) {
  if (longRange) {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function PlantChart({
  sensorType, label, color, unit, height = 200, transform, range = 'realtime',
}: PlantChartProps) {
  const [data, setData] = useState<PlantReading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setData(await fetchPlantHistory(sensorType, range));
    } catch (err) {
      console.error(`[PlantChart] ${sensorType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [sensorType, range]);

  useEffect(() => {
    setLoading(true);
    loadHistory();

    // Polling cada 5s en modo realtime; cada 30s en modos históricos
    const pollMs = range === 'realtime' ? 5000 : 30_000;
    const interval = setInterval(loadHistory, pollMs);

    // Realtime solo en modo live
    if (range !== 'realtime') {
      return () => clearInterval(interval);
    }

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
  }, [sensorType, range, loadHistory]);

  const lastVal = data.length > 0 ? data[data.length - 1].valor : null;
  const displayLast = lastVal !== null ? (transform ? transform(lastVal) : lastVal) : null;

  const longRange = range !== 'realtime';
  const chartData = data.map((r) => ({
    time: formatTime(r.created_at, longRange),
    valor: transform ? transform(r.valor) : Number(r.valor),
  }));

  const gradientId = `grad-${sensorType}`;

  return (
    <div className="rounded-2xl p-5" style={{ background: S, border: `1px solid ${B}`, boxShadow: PT.shadowSm }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold" style={{ color: PT.textHi }}>{label}</h3>
        {!loading && displayLast !== null && (
          <span className="text-sm font-bold px-2.5 py-1 rounded-full"
            style={{ background: `${color}1a`, color }}>
            {displayLast}{unit}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ height }} className="flex items-center justify-center text-sm">
          <span style={{ color: PT.textDim }}>Cargando...</span>
        </div>
      ) : data.length === 0 ? (
        <div style={{ height }} className="flex items-center justify-center">
          <span className="text-sm" style={{ color: PT.textDim }}>Sin datos aún</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={PT.borderDim} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: PT.textDim }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: PT.textDim }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}${unit}`, label]} />
            {sensorType === 'humedad_suelo' && (
              <ReferenceLine y={25} stroke="#c8901c" strokeDasharray="4 2"
                label={{ value: 'Seco', position: 'insideTopRight', fontSize: 10, fill: '#c8901c' }} />
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
