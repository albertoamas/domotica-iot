'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { supabase, fetchLatestReadings } from '@/lib/supabase';
import type { SensorReading, RoomState } from '@/lib/types';
import { GAS_ALERT_THRESHOLD } from '@/lib/types';
import GasAlert from '@/components/GasAlert';
import LedControl from '@/components/LedControl';
import SensorRing from '@/components/SensorRing';

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

const TEMP_ZONES = [
  { threshold: 0,  color: '#818cf8' },
  { threshold: 18, color: '#4ade80' },
  { threshold: 28, color: '#fb923c' },
  { threshold: 35, color: '#f87171' },
];
const HUM_ZONES = [
  { threshold: 0,  color: '#f87171' },
  { threshold: 30, color: '#fbbf24' },
  { threshold: 50, color: '#4ade80' },
  { threshold: 80, color: '#60a5fa' },
];
const GAS_ZONES = [
  { threshold: 0,    color: '#4ade80' },
  { threshold: 1000, color: '#fbbf24' },
  { threshold: 2000, color: '#fb923c' },
  { threshold: 3000, color: '#f87171' },
];

interface RoomPanelProps {
  habitacion: 1 | 2;
  state: RoomState;
}

function RoomPanel({ habitacion, state }: RoomPanelProps) {
  const gasAlert  = state.gas !== null && state.gas > GAS_ALERT_THRESHOLD;
  const isOscuro  = state.luz === 1;
  const lastUpdate = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('es-ES')
    : null;

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between ${gasAlert ? 'bg-red-600' : 'bg-slate-800'}`}>
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-base">Habitación {habitacion}</span>
          {gasAlert && (
            <span className="text-xs font-bold bg-white text-red-600 px-2 py-0.5 rounded-full animate-pulse">
              ⚠ Gas elevado
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <span className="text-xs text-slate-400">{lastUpdate}</span>}
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isOscuro ? 'bg-indigo-900 text-indigo-300' : 'bg-yellow-900 text-yellow-300'
          }`}>
            {isOscuro ? <Moon size={11} /> : <Sun size={11} />}
            {isOscuro ? 'Oscuro' : 'Con luz'}
          </div>
        </div>
      </div>

      {/* Rings */}
      <div className="bg-slate-900 px-4 py-6">
        <div className="grid grid-cols-3 gap-2 place-items-center">
          <SensorRing
            value={state.temperatura}
            min={0} max={50}
            label="Temp" unit="°C"
            baseColor="#fb923c"
            size={130}
            zones={TEMP_ZONES}
          />
          <SensorRing
            value={state.humedad}
            min={0} max={100}
            label="Humedad" unit="%"
            baseColor="#60a5fa"
            size={130}
            zones={HUM_ZONES}
          />
          <SensorRing
            value={state.gas}
            min={0} max={4095}
            label="Gas" unit=""
            baseColor="#4ade80"
            size={130}
            zones={GAS_ZONES}
          />
        </div>

        {/* Leyendas */}
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Legend zones={TEMP_ZONES} labels={['Frío','Ideal','Caliente','Crítico']} />
          <Legend zones={HUM_ZONES}  labels={['Seco','Bajo','Ideal','Húmedo']}     />
          <Legend zones={GAS_ZONES}  labels={['Normal','Mod.','Alto','Crítico']}   />
        </div>
      </div>

      {/* LED control */}
      <div className="bg-white px-5 py-3 border-t border-slate-100">
        <LedControl habitacion={habitacion} />
      </div>
    </div>
  );
}

function Legend({ zones, labels }: { zones: { color: string }[]; labels: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      {zones.map((z, i) => (
        <div key={i} className="flex items-center gap-1.5 justify-center">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: z.color }} />
          <span className="text-[10px] text-slate-500">{labels[i]}</span>
        </div>
      ))}
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
          <RoomPanel habitacion={1} state={room1} />
          <RoomPanel habitacion={2} state={room2} />
        </div>
      )}
    </div>
  );
}
