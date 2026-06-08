'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase, fetchLatestReadings } from '@/lib/supabase';
import type { SensorReading, RoomState } from '@/lib/types';
import RoomCard from '@/components/RoomCard';
import GasAlert from '@/components/GasAlert';
import LedControl from '@/components/LedControl';

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
          <div className="space-y-3">
            <RoomCard habitacion={1} state={room1} />
            <LedControl habitacion={1} />
          </div>
          <div className="space-y-3">
            <RoomCard habitacion={2} state={room2} />
            <LedControl habitacion={2} />
          </div>
        </div>
      )}
    </div>
  );
}
