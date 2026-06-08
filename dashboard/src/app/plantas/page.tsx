'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, BellOff, Thermometer, Wind } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchLatestPlantReadings } from '@/lib/plantSupabase';
import type { PlantReading, PlantState } from '@/lib/plantTypes';
import { sueloPercent, PLANT_ALERTS } from '@/lib/plantTypes';
import PlantCard from '@/components/PlantCard';
import AmbientCard from '@/components/AmbientCard';
import PlantAlert from '@/components/PlantAlert';
import PlantHealthWidget from '@/components/PlantHealthWidget';
import PlantStatsCard from '@/components/PlantStatsCard';

const C = {
  cardBg:    '#ffffff',
  border:    '#bbf7d0',
  borderDim: '#dcfce7',
  textMed:   '#166534',
  textDim:   '#6b9960',
};

const EMPTY: PlantState = {
  temperatura: null, humedad_aire: null, luz_estado: null,
  humedad_suelo: null, horas_sol: null, horas_sombra: null, lastUpdate: null,
};

const TEMP_ZONES = [
  { threshold: 0,  color: '#818cf8', label: 'Frío < 15°C' },
  { threshold: 15, color: '#4ade80', label: 'Ideal 15–30°C' },
  { threshold: 30, color: '#fbbf24', label: 'Caliente 30–38°C' },
  { threshold: 38, color: '#f87171', label: 'Crítico > 38°C' },
];
const HUM_ZONES = [
  { threshold: 0,  color: '#f87171', label: 'Muy seco < 30%' },
  { threshold: 30, color: '#fbbf24', label: 'Bajo 30–50%' },
  { threshold: 50, color: '#4ade80', label: 'Ideal 50–80%' },
  { threshold: 80, color: '#60a5fa', label: 'Húmedo > 80%' },
];

// ── Notificaciones ───────────────────────────────────────────────────────
function notifSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function sendNotif(title: string, body: string) {
  if (!notifSupported() || Notification.permission !== 'granted') return;
  try { new Notification(title, { body, icon: '/favicon.ico', tag: `plant-${Date.now()}` }); }
  catch { /* no soportado */ }
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.textDim }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: C.borderDim }} />
    </div>
  );
}

export default function PlantasPage() {
  const [plant, setPlant] = useState<PlantState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission | 'unsupported'>('default');

  const lastNotifSuelo = useRef(0);
  const lastNotifTemp  = useRef(0);
  const COOLDOWN = 30_000;

  useEffect(() => {
    setNotifPerm(notifSupported() ? Notification.permission : 'unsupported');
  }, []);

  // Notificación suelo seco
  useEffect(() => {
    const sp = sueloPercent(plant.humedad_suelo);
    if (sp !== null && sp < PLANT_ALERTS.SUELO_SECO) {
      const now = Date.now();
      if (now - lastNotifSuelo.current >= COOLDOWN) {
        lastNotifSuelo.current = now;
        sendNotif('💧 Suelo seco', `Humedad del suelo: ${sp}%. La planta necesita agua.`);
      }
    }
  }, [plant.humedad_suelo]);

  // Notificación temperatura
  useEffect(() => {
    if (plant.temperatura === null) return;
    const alta = plant.temperatura > PLANT_ALERTS.TEMP_ALTA;
    const baja  = plant.temperatura < PLANT_ALERTS.TEMP_BAJA;
    if (alta || baja) {
      const now = Date.now();
      if (now - lastNotifTemp.current >= COOLDOWN) {
        lastNotifTemp.current = now;
        sendNotif(
          alta ? '🌡️ Temperatura alta' : '❄️ Temperatura baja',
          `Temperatura actual: ${plant.temperatura} °C.`
        );
      }
    }
  }, [plant.temperatura]);

  const loadInitial = useCallback(async () => {
    try { setPlant(await fetchLatestPlantReadings()); }
    catch (err) { console.error('[Plantas]', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadInitial();
    const interval = setInterval(async () => {
      try { setPlant(await fetchLatestPlantReadings()); }
      catch { /* silencioso */ }
    }, 3000);
    const channel = supabase
      .channel('plantas-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plant_readings' }, (payload) => {
        const row = payload.new as PlantReading;
        setPlant((prev) => ({ ...prev, [row.sensor_type]: row.valor, lastUpdate: row.created_at }));
      })
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [loadInitial]);

  async function requestNotifications() {
    if (!notifSupported()) return;
    try {
      const perm = await Notification.requestPermission();
      setNotifPerm(perm);
    } catch { /* no soportado */ }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#bbf7d0', borderTopColor: '#16a34a' }} />
        <span className="text-sm" style={{ color: C.textDim }}>Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Título + notificaciones ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#14532d' }}>Plant Monitor</h1>
          <p className="text-sm mt-1" style={{ color: C.textDim }}>
            Temperatura · Humedad · Suelo · Luz acumulada — actualización cada 3s
          </p>
        </div>
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
              : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
          }`}
        >
          {notifPerm === 'granted' ? <Bell size={13} /> : <BellOff size={13} />}
          {notifPerm === 'granted'     ? 'Alertas activas'
            : notifPerm === 'denied'  ? 'Alertas bloqueadas'
            : notifPerm === 'unsupported' ? 'No disponible'
            : 'Activar alertas'}
        </button>
      </div>

      {/* ── Alertas ── */}
      <PlantAlert state={plant} />

      {/* ── Estado actual ── */}
      <section>
        <SectionTitle>Estado actual</SectionTitle>
        <PlantCard state={plant} />
      </section>

      {/* ── Salud de la planta ── */}
      <section>
        <SectionTitle>Salud de la planta</SectionTitle>
        <PlantHealthWidget state={plant} />
      </section>

      {/* ── Condiciones ambientales ── */}
      <section>
        <SectionTitle>Condiciones ambientales</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AmbientCard
            title="Temperatura"
            icon={<Thermometer size={20} />}
            value={plant.temperatura}
            unit="°C"
            min={0} max={50}
            defaultColor="#fb923c"
            zones={TEMP_ZONES}
          />
          <AmbientCard
            title="Humedad del aire"
            icon={<Wind size={20} />}
            value={plant.humedad_aire}
            unit="%"
            min={0} max={100}
            defaultColor="#60a5fa"
            zones={HUM_ZONES}
          />
        </div>
      </section>

      {/* ── Resumen de hoy ── */}
      <section>
        <SectionTitle>Resumen de hoy</SectionTitle>
        <PlantStatsCard />
      </section>

    </div>
  );
}
