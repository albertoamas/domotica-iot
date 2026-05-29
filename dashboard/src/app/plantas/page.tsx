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
  humedad_suelo: null, horas_sol: null, horas_sombra: null,
  lastUpdate: null,
};

export default function PlantasPage() {
  const [plant, setPlant] = useState<PlantState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  const loadInitial = useCallback(async () => {
    try {
      const state = await fetchLatestPlantReadings();
      setPlant(state);
    } catch (err) {
      console.error('[Plantas] Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();

    const channel = supabase
      .channel('plantas-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'plant_readings' },
        (payload) => {
          const row = payload.new as PlantReading;
          setPlant((prev) => ({
            ...prev,
            [row.sensor_type]: row.valor,
            lastUpdate: row.created_at,
          }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadInitial]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Monitoreo de Plantas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Temperatura, humedad del suelo, luz acumulada — actualizado en tiempo real
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Cargando datos del servidor...</div>
      ) : (
        <>
          {/* Card de estado actual */}
          <div className="max-w-md">
            <PlantCard state={plant} />
          </div>

          {/* Gráficas — Ambiente */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Ambiente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PlantChart sensorType="temperatura"  label="Temperatura"      color="#f97316" unit=" °C" />
              <PlantChart sensorType="humedad_aire" label="Humedad del aire"  color="#3b82f6" unit=" %"  />
              <PlantChart sensorType="luz_estado"   label="Luz (0=sombra 1=sol)" color="#eab308" unit=""  />
            </div>
          </section>

          {/* Gráficas — Suelo y acumulados */}
          <section>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Suelo y tiempo de luz</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PlantChart
                sensorType="humedad_suelo"
                label="Humedad del suelo"
                color="#10b981"
                unit=" %"
                transform={(v) => sueloPercent(v) ?? 0}
              />
              <PlantChart sensorType="horas_sol"    label="Horas de sol acumuladas"    color="#f59e0b" unit=" h" />
              <PlantChart sensorType="horas_sombra" label="Horas de sombra acumuladas" color="#6366f1" unit=" h" />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
