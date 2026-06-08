'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { supabase, fetchLatestReadings } from '@/lib/supabase';
import type { SensorReading, RoomState } from '@/lib/types';
import { GAS_ALERT_THRESHOLD } from '@/lib/types';
import RoomCard from '@/components/RoomCard';
import GasAlert from '@/components/GasAlert';
import LedControl from '@/components/LedControl';
import StatsCard from '@/components/StatsCard';

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

function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function sendGasNotification(habitacion: number, gasValue: number) {
  if (!notificationsSupported()) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(`⚠ Gas elevado — Habitación ${habitacion}`, {
      body: `Nivel: ${gasValue} (umbral: ${GAS_ALERT_THRESHOLD}). Ventila el ambiente.`,
      icon: '/favicon.ico',
      tag: `gas-h${habitacion}`,
    });
  } catch { /* Safari puede rechazarlo silenciosamente */ }
}

export default function DashboardPage() {
  const [room1, setRoom1] = useState<RoomState>(EMPTY_STATE);
  const [room2, setRoom2] = useState<RoomState>(EMPTY_STATE);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('default');

  // Timestamp de la última notificación enviada por habitación (0 = nunca)
  const lastNotif1 = useRef(0);
  const lastNotif2 = useRef(0);
  const NOTIF_COOLDOWN_MS = 30_000; // 30 segundos entre notificaciones

  useEffect(() => {
    setNotifPerm(notificationsSupported() ? Notification.permission : 'unsupported');
  }, []);

  // Notifica cada vez que gas > umbral, con cooldown de 30s para no spamear
  useEffect(() => {
    if (room1.gas !== null && room1.gas > GAS_ALERT_THRESHOLD) {
      const now = Date.now();
      if (now - lastNotif1.current >= NOTIF_COOLDOWN_MS) {
        lastNotif1.current = now;
        sendGasNotification(1, room1.gas);
      }
    }
  }, [room1.gas]);

  useEffect(() => {
    if (room2.gas !== null && room2.gas > GAS_ALERT_THRESHOLD) {
      const now = Date.now();
      if (now - lastNotif2.current >= NOTIF_COOLDOWN_MS) {
        lastNotif2.current = now;
        sendGasNotification(2, room2.gas);
      }
    }
  }, [room2.gas]);

  async function requestNotifications() {
    if (!notificationsSupported()) return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPerm(perm);
    } catch { /* no soportado */ }
  }

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

    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [loadInitial]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard en Tiempo Real</h1>
          <p className="text-sm text-gray-500 mt-1">
            Estado actual de los sensores · se actualiza cada 3 segundos
          </p>
        </div>

        {/* Botón notificaciones — siempre visible */}
        <button
          onClick={requestNotifications}
          disabled={notifPerm === 'granted' || notifPerm === 'denied' || notifPerm === 'unsupported'}
          className={`self-start flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full border transition-colors whitespace-nowrap ${
            notifPerm === 'granted'
              ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
              : notifPerm === 'denied'
              ? 'bg-red-50 text-red-500 border-red-200 cursor-not-allowed'
              : notifPerm === 'unsupported'
              ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
          }`}
        >
          {notifPerm === 'granted' ? <Bell size={13} /> : <BellOff size={13} />}
          {notifPerm === 'granted'
            ? 'Notificaciones activas'
            : notifPerm === 'denied'
            ? 'Notificaciones bloqueadas'
            : notifPerm === 'unsupported'
            ? 'No disponible en Safari'
            : 'Activar notificaciones'}
        </button>
      </div>

      {/* Alertas de gas */}
      <div className="space-y-2">
        <GasAlert habitacion={1} gasValue={room1.gas} />
        <GasAlert habitacion={2} gasValue={room2.gas} />
      </div>

      {loadingInitial ? (
        <div className="text-center py-20 text-gray-400">Cargando datos del servidor...</div>
      ) : (
        <div className="space-y-5">
          {/* Habitaciones */}
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

          {/* Estadísticas del día */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StatsCard habitacion={1} />
            <StatsCard habitacion={2} />
          </div>
        </div>
      )}
    </div>
  );
}
