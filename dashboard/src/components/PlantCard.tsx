'use client';

import { Sun, Moon, Leaf, Droplets, Thermometer, Wind, Snowflake } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { sueloPercent, formatHoras, calcSolPercent, calcSolLabel } from '@/lib/plantTypes';

// Paleta tierra-bosque (sincronizada con layout.tsx)
const T = {
  cardBg:    '#ffffff',
  cardRaise: '#f0fdf4',
  border:    '#bbf7d0',
  borderDim: '#dcfce7',
  accent:    '#16a34a',
  textHi:    '#14532d',
  textMed:   '#166534',
  textDim:   '#6b9960',
};

interface PlantCardProps { state: PlantState }

export default function PlantCard({ state }: PlantCardProps) {
  const hayLuz   = state.luz_estado === 1;
  const sueloPct = sueloPercent(state.humedad_suelo);

  const sueloColor = sueloPct === null ? T.accent
    : sueloPct < 25 ? '#f87171'
    : sueloPct < 50 ? '#fbbf24'
    : '#4ade80';

  const horasSol    = formatHoras(state.horas_sol);
  const horasSombra = formatHoras(state.horas_sombra);
  const horasFrio   = formatHoras(state.horas_frio);
  const solPct      = calcSolPercent(state.horas_sol, state.horas_sombra);
  const solInfo     = solPct !== null ? calcSolLabel(solPct) : null;
  const lastUpdate  = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('es-ES') : null;

  return (
    <div className="w-full rounded-2xl p-6"
      style={{ background: T.cardBg, border: `1px solid ${T.border}` }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(74,222,128,0.12)', border: `1px solid ${T.border}` }}>
            <Leaf size={20} style={{ color: T.accent }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: T.textHi }}>Estado actual</h2>
            {lastUpdate && (
              <p className="text-xs" style={{ color: T.textDim }}>Act: {lastUpdate}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={hayLuz
            ? { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid #713f12' }
            : { background: 'rgba(129,140,248,0.1)', color: '#a5b4fc', border: '1px solid #312e81' }}>
          {hayLuz ? <Sun size={14} /> : <Moon size={14} />}
          {hayLuz ? 'Con luz solar' : 'En sombra'}
        </div>
      </div>

      {/* ── Grid de métricas 3 columnas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Columna 1 — Temperatura, Humedad aire, Horas frío */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4"
            style={{ background: T.cardRaise, border: `1px solid ${T.borderDim}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Thermometer size={16} className="text-orange-400" />
              <span className="text-xs font-medium" style={{ color: T.textMed }}>Temperatura</span>
            </div>
            <span className="text-4xl font-extrabold text-orange-400">
              {state.temperatura !== null ? state.temperatura : '—'}
            </span>
            <span className="text-lg font-semibold text-orange-400 ml-1">°C</span>
          </div>

          <div className="rounded-xl p-4"
            style={{ background: T.cardRaise, border: `1px solid ${T.borderDim}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Wind size={16} className="text-blue-400" />
              <span className="text-xs font-medium" style={{ color: T.textMed }}>Humedad aire</span>
            </div>
            <span className="text-4xl font-extrabold text-blue-400">
              {state.humedad_aire !== null ? state.humedad_aire : '—'}
            </span>
            <span className="text-lg font-semibold text-blue-400 ml-1">%</span>
          </div>

          {/* Horas frío */}
          <div className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid #c7d2fe' }}>
            <Snowflake size={16} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-medium" style={{ color: T.textMed }}>Horas frío (&lt;7°C)</p>
              <p className="text-lg font-extrabold text-indigo-400">{horasFrio}</p>
            </div>
          </div>
        </div>

        {/* Columna 2 — Humedad del suelo */}
        <div className="rounded-xl p-4 flex flex-col gap-4"
          style={{ background: T.cardRaise, border: `1px solid ${T.borderDim}` }}>
          <div className="flex items-center gap-2">
            <Droplets size={16} style={{ color: sueloColor }} />
            <span className="text-xs font-medium" style={{ color: T.textMed }}>Humedad del suelo</span>
          </div>

          {/* Valor grande */}
          <div className="flex items-end gap-1">
            <span className="text-5xl font-extrabold" style={{ color: sueloColor }}>
              {sueloPct !== null ? sueloPct : '—'}
            </span>
            {sueloPct !== null && (
              <span className="text-2xl font-bold mb-1.5" style={{ color: sueloColor }}>%</span>
            )}
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: T.borderDim }}>
              {sueloPct !== null && (
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${sueloPct}%`, background: sueloColor }} />
              )}
            </div>
            <div className="flex justify-between text-xs mt-1.5" style={{ color: T.textDim }}>
              <span>Seco</span>
              <span className="font-medium" style={{ color: T.textMed }}>
                {sueloPct !== null && sueloPct < 25 ? '⚠ Regar pronto'
                  : sueloPct !== null && sueloPct >= 50 ? '✓ Bien hidratada'
                  : 'Moderado'}
              </span>
              <span>Húmedo</span>
            </div>
          </div>

          {/* Raw value */}
          <div className="text-xs" style={{ color: T.textDim }}>
            Sensor RAW: {state.humedad_suelo ?? '—'}
          </div>
        </div>

        {/* Columna 3 — Horas de luz + % solar */}
        <div className="flex flex-col gap-3">

          {/* Porcentaje de sol del día */}
          {solInfo && solPct !== null && (
            <div className="rounded-xl p-4"
              style={{ background: 'rgba(253,230,138,0.06)', border: `1px solid ${solInfo.color}50` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: T.textMed }}>% del tiempo con sol</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${solInfo.color}20`, color: solInfo.color }}>
                  {solInfo.label}
                </span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-extrabold" style={{ color: solInfo.color }}>{solPct}</span>
                <span className="text-base font-bold mb-0.5" style={{ color: solInfo.color }}>%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: T.borderDim }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${solPct}%`, background: solInfo.color }} />
              </div>
            </div>
          )}

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(253,230,138,0.06)', border: '1px solid #713f12' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sun size={16} className="text-yellow-400" />
              <span className="text-xs font-medium" style={{ color: T.textMed }}>Horas de sol acum.</span>
            </div>
            <span className="text-3xl font-extrabold text-yellow-400">{horasSol}</span>
          </div>

          <div className="rounded-xl p-4"
            style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid #312e81' }}>
            <div className="flex items-center gap-2 mb-2">
              <Moon size={16} className="text-indigo-400" />
              <span className="text-xs font-medium" style={{ color: T.textMed }}>Horas de sombra acum.</span>
            </div>
            <span className="text-3xl font-extrabold text-indigo-400">{horasSombra}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
