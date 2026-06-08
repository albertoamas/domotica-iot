'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Snowflake } from 'lucide-react';
import { fetchPlantTotalHours } from '@/lib/plantSupabase';
import { formatHoras } from '@/lib/plantTypes';
import { PT, SENSOR } from '@/lib/plantTheme';

export default function PlantHistorialPage() {
  const [totals, setTotals] = useState<{ horas_sol: number; horas_sombra: number; horas_frio: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlantTotalHours()
      .then(setTotals)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: PT.textNav }}>
          Historial
        </h1>
        <p className="text-sm mt-1" style={{ color: PT.textNavDim }}>
          Acumulado desde el primer registro en base de datos · sin reinicio
        </p>
      </div>

      {/* Tarjeta principal */}
      <div className="rounded-3xl p-6 flex flex-col gap-5"
        style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadow }}>

        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: PT.textDim }}>
            Acumulado total — desde el inicio del monitoreo
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: PT.greenSoft, color: PT.greenDeep }}>
            Sin reinicio
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm" style={{ color: PT.textDim }}>Calculando...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Sol */}
            <div className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(224,169,46,0.08)', border: '1px solid rgba(224,169,46,0.28)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(224,169,46,0.18)' }}>
                <Sun size={22} style={{ color: SENSOR.sun }} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: PT.textMed }}>Sol acumulado</p>
                <p className="text-3xl font-extrabold leading-none" style={{ color: SENSOR.sun }}>
                  {totals ? formatHoras(totals.horas_sol) : '—'}
                </p>
              </div>
            </div>

            {/* Sombra */}
            <div className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(123,115,201,0.08)', border: '1px solid rgba(123,115,201,0.28)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(123,115,201,0.18)' }}>
                <Moon size={22} style={{ color: SENSOR.shade }} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: PT.textMed }}>Sombra acumulada</p>
                <p className="text-3xl font-extrabold leading-none" style={{ color: SENSOR.shade }}>
                  {totals ? formatHoras(totals.horas_sombra) : '—'}
                </p>
              </div>
            </div>

            {/* Frío */}
            <div className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(110,134,201,0.08)', border: '1px solid rgba(110,134,201,0.28)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(110,134,201,0.18)' }}>
                <Snowflake size={22} style={{ color: SENSOR.cold }} />
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: PT.textMed }}>Tiempo en frío &lt;7°C</p>
                <p className="text-3xl font-extrabold leading-none" style={{ color: SENSOR.cold }}>
                  {totals ? formatHoras(totals.horas_frio) : '—'}
                </p>
              </div>
            </div>

          </div>
        )}

        <p className="text-xs" style={{ color: PT.textDim }}>
          Calculado contando cada lectura × 2 s desde el primer registro.
          No se reinicia al medianoche ni cuando el ESP32 se reinicia.
        </p>
      </div>

    </div>
  );
}
