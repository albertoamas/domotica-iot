'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchLatestPlantReadings } from '@/lib/plantSupabase';
import type { PlantReading, PlantState } from '@/lib/plantTypes';
import { sueloPercent } from '@/lib/plantTypes';
import PlantCard from '@/components/PlantCard';
import GaugeChart from '@/components/GaugeChart';

// Paleta tierra-bosque (sincronizada con layout y componentes)
const C = {
  cardBg:    '#0f1c0b',
  border:    '#1e3d17',
  borderDim: '#142a10',
  textMed:   '#6b9960',
  textDim:   '#3a5c34',
};

const EMPTY: PlantState = {
  temperatura: null, humedad_aire: null, luz_estado: null,
  humedad_suelo: null, horas_sol: null, horas_sombra: null, lastUpdate: null,
};

const TEMP_ZONES = [
  { threshold: 0,  color: '#818cf8' },
  { threshold: 15, color: '#4ade80' },
  { threshold: 30, color: '#fbbf24' },
  { threshold: 38, color: '#f87171' },
];
const HUM_ZONES = [
  { threshold: 0,  color: '#f87171' },
  { threshold: 30, color: '#fbbf24' },
  { threshold: 50, color: '#4ade80' },
  { threshold: 80, color: '#60a5fa' },
];

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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-xs" style={{ color: C.textMed }}>{label}</span>
    </div>
  );
}

export default function PlantasPage() {
  const [plant, setPlant] = useState<PlantState>(EMPTY);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#1e3d17', borderTopColor: '#4ade80' }} />
        <span className="text-sm" style={{ color: C.textDim }}>Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#e8f5e1' }}>
          Plant Monitor
        </h1>
        <p className="text-sm mt-1" style={{ color: C.textDim }}>
          Temperatura · Humedad · Suelo · Luz acumulada — actualización cada 3s
        </p>
      </div>

      {/* ── Estado actual — FULL WIDTH, GRANDE ── */}
      <section>
        <SectionTitle>Estado actual</SectionTitle>
        <PlantCard state={plant} />
      </section>

      {/* ── Gauges — Temperatura y Humedad ── */}
      <section>
        <SectionTitle>Condiciones ambientales</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Gauge Temperatura */}
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3"
            style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <span className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: C.textMed }}>
              Temperatura
            </span>
            <GaugeChart
              value={plant.temperatura}
              min={0} max={50}
              label="Temperatura" unit="°C"
              color="#fb923c" size={240} zones={TEMP_ZONES}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <LegendDot color="#818cf8" label="Frío < 15°C" />
              <LegendDot color="#4ade80" label="Ideal 15–30°C" />
              <LegendDot color="#fbbf24" label="Caliente 30–38°C" />
              <LegendDot color="#f87171" label="Crítico > 38°C" />
            </div>
          </div>

          {/* Gauge Humedad */}
          <div className="rounded-2xl p-6 flex flex-col items-center gap-3"
            style={{ background: C.cardBg, border: `1px solid ${C.border}` }}>
            <span className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: C.textMed }}>
              Humedad del aire
            </span>
            <GaugeChart
              value={plant.humedad_aire}
              min={0} max={100}
              label="Humedad aire" unit="%"
              color="#60a5fa" size={240} zones={HUM_ZONES}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <LegendDot color="#f87171" label="Muy seco < 30%" />
              <LegendDot color="#fbbf24" label="Bajo 30–50%" />
              <LegendDot color="#4ade80" label="Ideal 50–80%" />
              <LegendDot color="#60a5fa" label="Húmedo > 80%" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
