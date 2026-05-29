'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchLatestPlantReadings } from '@/lib/plantSupabase';
import type { PlantReading, PlantState } from '@/lib/plantTypes';
import { sueloPercent } from '@/lib/plantTypes';
import PlantCard from '@/components/PlantCard';
import PlantChart from '@/components/PlantChart';

const EMPTY_STATE: PlantState = {
  temperatura: null, humedad_aire: null, luz_estado: null,
  humedad_suelo: null, horas_sol: null, horas_sombra: null, lastUpdate: null,
};

export default function PlantasPage() {
  const [plant, setPlant] = useState<PlantState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  const loadInitial = useCallback(async () => {
    try {
      setPlant(await fetchLatestPlantReadings());
    } catch (err) {
      console.error('[Plantas] Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
    const channel = supabase
      .channel('plantas-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plant_readings' }, (payload) => {
        const row = payload.new as PlantReading;
        setPlant((prev) => ({ ...prev, [row.sensor_type]: row.valor, lastUpdate: row.created_at }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadInitial]);

  return (
    <div className="space-y-8">

      {/* Título */}
      <div className="border-b pb-5" style={{ borderColor: '#111' }}>
        <h1 className="text-3xl font-bold text-white tracking-tight">Plant Monitor</h1>
        <p className="text-sm mt-1" style={{ color: '#4b5563' }}>
          Monitoreo en tiempo real · temperatura, humedad de suelo y acumulación de luz solar
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
            <span className="text-sm" style={{ color: '#4b5563' }}>Cargando datos...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Card estado + métricas ambientales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <PlantCard state={plant} />
            </div>

            {/* Mini stats */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
              {[
                { label: 'Temperatura', value: plant.temperatura, unit: '°C', color: '#fb923c' },
                { label: 'Humedad aire', value: plant.humedad_aire, unit: '%', color: '#60a5fa' },
                { label: 'Suelo', value: sueloPercent(plant.humedad_suelo), unit: '%', color: '#4ade80' },
                { label: 'Luz actual', value: plant.luz_estado !== null ? (plant.luz_estado === 1 ? 'Sí' : 'No') : null, unit: '', color: '#fbbf24' },
                { label: 'Horas sol', value: plant.horas_sol !== null ? plant.horas_sol.toFixed(2) : null, unit: 'h', color: '#fde68a' },
                { label: 'Horas sombra', value: plant.horas_sombra !== null ? plant.horas_sombra.toFixed(2) : null, unit: 'h', color: '#818cf8' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-4 flex flex-col gap-1"
                  style={{ background: '#0d0d0d', border: '1px solid #1a2e1a' }}>
                  <span className="text-xs" style={{ color: '#4b5563' }}>{s.label}</span>
                  <span className="text-2xl font-bold" style={{ color: s.color }}>
                    {s.value !== null ? `${s.value}${s.unit ? ' ' + s.unit : ''}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Separador */}
          <div style={{ borderTop: '1px solid #111' }} />

          {/* Gráficas — Ambiente */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#374151' }}>
              Ambiente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PlantChart sensorType="temperatura"  label="Temperatura"       color="#fb923c" unit=" °C" />
              <PlantChart sensorType="humedad_aire" label="Humedad del aire"   color="#60a5fa" unit=" %"  />
              <PlantChart sensorType="luz_estado"   label="Estado de luz"      color="#fbbf24" unit=""    />
            </div>
          </section>

          {/* Gráficas — Suelo y luz acumulada */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#374151' }}>
              Suelo y luz acumulada
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PlantChart
                sensorType="humedad_suelo"
                label="Humedad del suelo"
                color="#4ade80"
                unit=" %"
                transform={(v) => sueloPercent(v) ?? 0}
              />
              <PlantChart sensorType="horas_sol"    label="Horas de sol acum."    color="#fde68a" unit=" h" />
              <PlantChart sensorType="horas_sombra" label="Horas de sombra acum." color="#818cf8" unit=" h" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
