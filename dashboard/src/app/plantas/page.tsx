'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchLatestPlantReadings } from '@/lib/plantSupabase';
import type { PlantReading, PlantState } from '@/lib/plantTypes';
import { sueloPercent } from '@/lib/plantTypes';
import PlantCard from '@/components/PlantCard';
import PlantChart from '@/components/PlantChart';
import GaugeChart from '@/components/GaugeChart';

const B = '#2a1605';
const S = '#160d03';

const EMPTY: PlantState = {
  temperatura: null, humedad_aire: null, luz_estado: null,
  humedad_suelo: null, horas_sol: null, horas_sombra: null, lastUpdate: null,
};

// Zonas de color para los gauges
const TEMP_ZONES = [
  { threshold: 0,  color: '#818cf8' }, // frío
  { threshold: 15, color: '#4ade80' }, // ideal
  { threshold: 30, color: '#fbbf24' }, // caliente
  { threshold: 38, color: '#f87171' }, // muy caliente
];
const HUM_ZONES = [
  { threshold: 0,  color: '#f87171' }, // muy seco
  { threshold: 30, color: '#fbbf24' }, // bajo
  { threshold: 50, color: '#4ade80' }, // ideal
  { threshold: 80, color: '#60a5fa' }, // muy húmedo
];

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

    // Polling cada 3s — respaldo si Realtime no está habilitado
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
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadInitial]);

  const hayLuz   = plant.luz_estado === 1;
  const sueloPct = sueloPercent(plant.humedad_suelo);

  return (
    <div className="space-y-7">

      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Plant Monitor</h1>
        <p className="text-sm mt-1" style={{ color: '#4b5563' }}>
          Temperatura · Humedad · Suelo · Luz acumulada — tiempo real
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
          <span className="text-sm" style={{ color: '#4b5563' }}>Cargando datos...</span>
        </div>
      ) : (
        <>
          {/* ── GAUGES — Temperatura y Humedad ── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4b5563' }}>
              Condiciones ambientales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Gauge Temperatura */}
              <div className="rounded-2xl p-6 flex flex-col items-center gap-2"
                style={{ background: S, border: `1px solid ${B}` }}>
                <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>
                  Temperatura
                </span>
                <GaugeChart
                  value={plant.temperatura}
                  min={0} max={50}
                  label="Temperatura" unit="°C"
                  color="#fb923c"
                  size={240}
                  zones={TEMP_ZONES}
                />
                <div className="flex gap-3 text-xs mt-1">
                  {[
                    { label: 'Frío',   color: '#818cf8', range: '< 15°C' },
                    { label: 'Ideal',  color: '#4ade80', range: '15–30°C' },
                    { label: 'Caliente', color: '#fbbf24', range: '30–38°C' },
                    { label: 'Crítico', color: '#f87171', range: '> 38°C' },
                  ].map((z) => (
                    <div key={z.label} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: z.color }} />
                      <span style={{ color: '#6b7280' }}>{z.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gauge Humedad */}
              <div className="rounded-2xl p-6 flex flex-col items-center gap-2"
                style={{ background: S, border: `1px solid ${B}` }}>
                <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#6b7280' }}>
                  Humedad del aire
                </span>
                <GaugeChart
                  value={plant.humedad_aire}
                  min={0} max={100}
                  label="Humedad aire" unit="%"
                  color="#60a5fa"
                  size={240}
                  zones={HUM_ZONES}
                />
                <div className="flex gap-3 text-xs mt-1">
                  {[
                    { label: 'Muy seco', color: '#f87171', range: '< 30%' },
                    { label: 'Bajo',     color: '#fbbf24', range: '30–50%' },
                    { label: 'Ideal',    color: '#4ade80', range: '50–80%' },
                    { label: 'Húmedo',   color: '#60a5fa', range: '> 80%' },
                  ].map((z) => (
                    <div key={z.label} className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: z.color }} />
                      <span style={{ color: '#6b7280' }}>{z.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── ESTADO + Suelo ── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4b5563' }}>
              Estado de la planta
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PlantCard state={plant} />

              {/* Panel de horas y luz */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4 content-start">
                {[
                  { label: 'Horas de sol acum.',    val: plant.horas_sol    !== null ? `${plant.horas_sol.toFixed(2)} h`    : null, color: '#fde68a', bg: 'rgba(253,230,138,0.05)', br: '#713f12' },
                  { label: 'Horas de sombra acum.', val: plant.horas_sombra !== null ? `${plant.horas_sombra.toFixed(2)} h` : null, color: '#818cf8', bg: 'rgba(129,140,248,0.05)', br: '#312e81' },
                  { label: 'Humedad del suelo',      val: sueloPct !== null ? `${sueloPct} %` : null,                               color: '#4ade80', bg: 'rgba(74,222,128,0.05)', br: '#166534' },
                  { label: 'Luz detectada',          val: plant.luz_estado !== null ? (hayLuz ? 'Con luz ☀' : 'Sombra 🌑') : null, color: hayLuz ? '#fbbf24' : '#818cf8', bg: hayLuz ? 'rgba(251,191,36,0.05)' : 'rgba(99,102,241,0.05)', br: hayLuz ? '#713f12' : '#312e81' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl px-5 py-6 flex flex-col gap-2"
                    style={{ background: item.bg, border: `1px solid ${item.br}` }}>
                    <span className="text-xs" style={{ color: '#6b7280' }}>{item.label}</span>
                    <span className="text-3xl font-bold" style={{ color: item.color }}>
                      {item.val ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── GRÁFICAS GRANDES ── */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#4b5563' }}>
              Histórico de sensores
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <PlantChart sensorType="temperatura"  label="Temperatura"        color="#fb923c" unit=" °C" height={220} />
              <PlantChart sensorType="humedad_aire" label="Humedad del aire"    color="#60a5fa" unit=" %"  height={220} />
              <PlantChart
                sensorType="humedad_suelo"
                label="Humedad del suelo"
                color="#4ade80" unit=" %"
                height={220}
                transform={(v) => sueloPercent(v) ?? 0}
              />
              <PlantChart sensorType="horas_sol"    label="Horas de sol acum." color="#fde68a" unit=" h"  height={220} />
            </div>
            {/* Gráfica ancha — sombra */}
            <div className="mt-5">
              <PlantChart sensorType="horas_sombra" label="Horas de sombra acumuladas" color="#818cf8" unit=" h" height={200} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
