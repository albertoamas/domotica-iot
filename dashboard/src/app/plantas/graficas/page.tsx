'use client';

import PlantChart from '@/components/PlantChart';
import { sueloPercent } from '@/lib/plantTypes';

export default function PlantasGraficasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gráficas</h1>
        <p className="text-sm mt-1" style={{ color: '#3a5c34' }}>
          Histórico de los últimos 50 registros por sensor
        </p>
      </div>

      {/* Ambiente */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a5c34' }}>
            Ambiente
          </h2>
          <div className="flex-1 h-px" style={{ background: '#142a10' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PlantChart sensorType="temperatura"  label="Temperatura"      color="#fb923c" unit=" °C" height={220} />
          <PlantChart sensorType="humedad_aire" label="Humedad del aire"  color="#60a5fa" unit=" %"  height={220} />
          <PlantChart sensorType="luz_estado"   label="Estado de luz"     color="#fbbf24" unit=""    height={220} />
          <PlantChart
            sensorType="humedad_suelo"
            label="Humedad del suelo"
            color="#4ade80" unit=" %"
            height={220}
            transform={(v) => sueloPercent(v) ?? 0}
          />
        </div>
      </section>

      {/* Luz acumulada */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3a5c34' }}>
            Luz acumulada
          </h2>
          <div className="flex-1 h-px" style={{ background: '#142a10' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <PlantChart sensorType="horas_sol"    label="Horas de sol acum."    color="#fde68a" unit=" h" height={220} />
          <PlantChart sensorType="horas_sombra" label="Horas de sombra acum." color="#818cf8" unit=" h" height={220} />
        </div>
      </section>
    </div>
  );
}
