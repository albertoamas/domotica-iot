'use client';

import { useEffect, useState, useCallback } from 'react';
import { Thermometer, Wind } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchLatestPlantReadings } from '@/lib/plantSupabase';
import type { PlantReading, PlantState } from '@/lib/plantTypes';
import PlantCard from '@/components/PlantCard';
import AmbientCard from '@/components/AmbientCard';
import PlantAlert from '@/components/PlantAlert';
import PlantHealthWidget from '@/components/PlantHealthWidget';
import PlantStatsCard from '@/components/PlantStatsCard';
import PlantAssistant from '@/components/PlantAssistant';
import { PT, SENSOR } from '@/lib/plantTheme';

const C = {
  cardBg:    PT.card,
  border:    PT.border,
  borderDim: 'rgba(242,232,213,0.18)',
  textMed:   PT.textNav,
  textDim:   PT.textNavDim,
};

const EMPTY: PlantState = {
  temperatura: null, humedad_aire: null, luz_estado: null,
  humedad_suelo: null, horas_sol: null, horas_sombra: null,
  horas_frio: null, lastUpdate: null,
};

const TEMP_ZONES = [
  { threshold: 0,  color: SENSOR.cold,  label: 'Frío < 15°C' },
  { threshold: 15, color: SENSOR.soil,  label: 'Ideal 15–30°C' },
  { threshold: 30, color: SENSOR.sun,   label: 'Caliente 30–38°C' },
  { threshold: 38, color: '#d9534f',    label: 'Crítico > 38°C' },
];
const HUM_ZONES = [
  { threshold: 0,  color: '#d9534f',    label: 'Muy seco < 30%' },
  { threshold: 30, color: SENSOR.sun,   label: 'Bajo 30–50%' },
  { threshold: 50, color: SENSOR.soil,  label: 'Ideal 50–80%' },
  { threshold: 80, color: SENSOR.hum,   label: 'Húmedo > 80%' },
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
        // Las horas se calculan desde la BD — ignorar valores acumulados del ESP32
        if (['horas_sol', 'horas_sombra', 'horas_frio'].includes(row.sensor_type)) return;
        setPlant((prev) => ({ ...prev, [row.sensor_type]: row.valor, lastUpdate: row.created_at }));
      })
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, [loadInitial]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(242,232,213,0.25)', borderTopColor: PT.grass }} />
        <span className="text-sm" style={{ color: C.textDim }}>Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Título ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: PT.textNav }}>Plant Monitor</h1>
        <p className="text-sm mt-1" style={{ color: C.textDim }}>
          Temperatura · Humedad · Suelo · Luz acumulada — actualización cada 3s
        </p>
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

      {/* ── Asistente inteligente ── */}
      <section>
        <SectionTitle>Asistente de cuidado</SectionTitle>
        <PlantAssistant state={plant} />
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
