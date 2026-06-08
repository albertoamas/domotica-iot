'use client';

import PlantChart from '@/components/PlantChart';
import { sueloPercent } from '@/lib/plantTypes';

export default function PlantasGraficasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#14532d' }}>Gráficas</h1>
        <p className="text-sm mt-1" style={{ color: '#6b9960' }}>
          Últimos 50 registros por sensor · se actualiza cada 5 segundos
        </p>
      </div>

      {/* Ambiente */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b9960' }}>
            Ambiente
          </h2>
          <div className="flex-1 h-px" style={{ background: '#dcfce7' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PlantChart sensorType="temperatura"  label="Temperatura"     color="#fb923c" unit=" °C" height={220} />
          <PlantChart sensorType="humedad_aire" label="Humedad del aire" color="#60a5fa" unit=" %"  height={220} />
          <PlantChart
            sensorType="humedad_suelo"
            label="Humedad del suelo"
            color="#4ade80" unit=" %"
            height={220}
            transform={(v) => sueloPercent(v) ?? 0}
          />
          <PlantChart
            sensorType="horas_sol"
            label="Sol acumulado"
            color="#fde68a" unit=" min"
            height={220}
            transform={(v) => Math.round(v * 60)}
          />
        </div>
      </section>

      {/* Sombra */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6b9960' }}>
            Sombra acumulada
          </h2>
          <div className="flex-1 h-px" style={{ background: '#dcfce7' }} />
        </div>
        <PlantChart
          sensorType="horas_sombra"
          label="Sombra acumulada"
          color="#818cf8" unit=" min"
          height={200}
          transform={(v) => Math.round(v * 60)}
        />
      </section>
    </div>
  );
}
