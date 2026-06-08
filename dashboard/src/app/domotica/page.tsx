'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, fetchLatestReadings } from '@/lib/supabase';
import type { SensorReading, RoomState } from '@/lib/types';
import { GAS_ALERT_THRESHOLD } from '@/lib/types';
import RoomCard from '@/components/RoomCard';
import GasAlert from '@/components/GasAlert';
import LedControl from '@/components/LedControl';
import GaugeChart from '@/components/GaugeChart';

const EMPTY_STATE: RoomState = {
  temperatura: null, humedad: null, gas: null, luz: null, lastUpdate: null,
};

function readingsToState(readings: SensorReading[]): RoomState {
  const state: RoomState = { ...EMPTY_STATE };
  for (const r of readings) {
    if (r.sensor_type === 'temperatura') state.temperatura = r.valor;
    if (r.sensor_type === 'humedad')     state.humedad     = r.valor;
    if (r.sensor_type === 'gas')         state.gas         = r.valor;
    if (r.sensor_type === 'luz')         state.luz         = r.valor;
    if (!state.lastUpdate || r.created_at > state.lastUpdate) state.lastUpdate = r.created_at;
  }
  return state;
}

function applyReading(prev: RoomState, row: SensorReading): RoomState {
  return { ...prev, [row.sensor_type]: row.valor, lastUpdate: row.created_at };
}

// Zonas de color por sensor
const TEMP_ZONES = [
  { threshold: 0,  color: '#818cf8' }, // frío
  { threshold: 18, color: '#4ade80' }, // ideal
  { threshold: 28, color: '#fb923c' }, // caliente
  { threshold: 35, color: '#f87171' }, // crítico
];
const HUM_ZONES = [
  { threshold: 0,  color: '#f87171' }, // muy seco
  { threshold: 30, color: '#fbbf24' }, // bajo
  { threshold: 50, color: '#4ade80' }, // ideal
  { threshold: 80, color: '#60a5fa' }, // muy húmedo
];
const GAS_ZONES = [
  { threshold: 0,    color: '#4ade80' }, // normal
  { threshold: 1000, color: '#fbbf24' }, // moderado
  { threshold: 2000, color: '#fb923c' }, // alto
  { threshold: 3000, color: '#f87171' }, // crítico
];

// Props de tema para que los gauges se vean bien en fondo claro
const LIGHT_GAUGE = {
  trackColor: '#e5e7eb',
  labelColor: '#9ca3af',
  minMaxColor: '#9ca3af',
};

interface RoomGaugesProps {
  state: RoomState;
  habitacion: 1 | 2;
}

function RoomGauges({ state, habitacion }: RoomGaugesProps) {
  const gasAlert = state.gas !== null && state.gas > GAS_ALERT_THRESHOLD;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Habitación {habitacion} — Velocímetros
        </h3>
        {gasAlert && (
          <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full animate-pulse">
            ⚠ Gas elevado
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Temperatura */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Temp</span>
          <GaugeChart
            value={state.temperatura}
            min={0} max={50}
            label="Temperatura" unit="°C"
            color="#fb923c" size={150}
            zones={TEMP_ZONES}
            {...LIGHT_GAUGE}
          />
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            <LegendDot color="#818cf8" label="Frío" />
            <LegendDot color="#4ade80" label="Ideal" />
            <LegendDot color="#fb923c" label="Caliente" />
            <LegendDot color="#f87171" label="Crítico" />
          </div>
        </div>

        {/* Humedad */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Humedad</span>
          <GaugeChart
            value={state.humedad}
            min={0} max={100}
            label="Humedad" unit="%"
            color="#60a5fa" size={150}
            zones={HUM_ZONES}
            {...LIGHT_GAUGE}
          />
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            <LegendDot color="#f87171" label="Seco" />
            <LegendDot color="#fbbf24" label="Bajo" />
            <LegendDot color="#4ade80" label="Ideal" />
            <LegendDot color="#60a5fa" label="Alto" />
          </div>
        </div>

        {/* Gas */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gas</span>
          <GaugeChart
            value={state.gas}
            min={0} max={4095}
            label="Gas" unit=""
            color="#4ade80" size={150}
            zones={GAS_ZONES}
            {...LIGHT_GAUGE}
          />
          <div className="flex flex-wrap justify-center gap-1.5 mt-1">
            <LegendDot color="#4ade80" label="Normal" />
            <LegendDot color="#fbbf24" label="Mod." />
            <LegendDot color="#fb923c" label="Alto" />
            <LegendDot color="#f87171" label="Crítico" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[10px] text-gray-400">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [room1, setRoom1] = useState<RoomState>(EMPTY_STATE);
  const [room2, setRoom2] = useState<RoomState>(EMPTY_STATE);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const loadInitial = useCallback(async () => {
    try {
      const [r1, r2] = await Promise.all([fetchLatestReadings(1), fetchLatestReadings(2)]);
      setRoom1(readingsToState(r1));
      setRoom2(readingsToState(r2));
    } catch (err) {
      console.error('[Dashboard] Error:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();

    const interval = setInterval(async () => {
      try {
        const [r1, r2] = await Promise.all([fetchLatestReadings(1), fetchLatestReadings(2)]);
        setRoom1(readingsToState(r1));
        setRoom2(readingsToState(r2));
      } catch { /* silencioso */ }
    }, 3000);

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sensor_readings' }, (payload) => {
        const row = payload.new as SensorReading;
        if (row.habitacion === 1) setRoom1((prev) => applyReading(prev, row));
        if (row.habitacion === 2) setRoom2((prev) => applyReading(prev, row));
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadInitial]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard en Tiempo Real</h1>
        <p className="text-sm text-gray-500 mt-1">
          Estado actual de los sensores · se actualiza cada 3 segundos
        </p>
      </div>

      <div className="space-y-2">
        <GasAlert habitacion={1} gasValue={room1.gas} />
        <GasAlert habitacion={2} gasValue={room2.gas} />
      </div>

      {loadingInitial ? (
        <div className="text-center py-20 text-gray-400">Cargando datos del servidor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Habitación 1 */}
          <div className="space-y-3">
            <RoomCard habitacion={1} state={room1} />
            <RoomGauges state={room1} habitacion={1} />
            <LedControl habitacion={1} />
          </div>
          {/* Habitación 2 */}
          <div className="space-y-3">
            <RoomCard habitacion={2} state={room2} />
            <RoomGauges state={room2} habitacion={2} />
            <LedControl habitacion={2} />
          </div>
        </div>
      )}
    </div>
  );
}
