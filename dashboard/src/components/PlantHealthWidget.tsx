'use client';

import { Droplets, Thermometer, Sun, HeartPulse } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import {
  calcHealthScore, calcHealthLabel,
  calcStressIndex, calcClimateClass,
  calcIrrigationPrediction, calcEvapotranspiration,
} from '@/lib/plantTypes';
import { PT } from '@/lib/plantTheme';

interface Props { state: PlantState }

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r   = 52;
  const cx  = 64;
  const cy  = 64;
  const arc = Math.PI * r;
  const filled = (score / 100) * arc;

  return (
    <div style={{ position: 'relative', width: 128, height: 80 }}>
      <svg width={128} height={80} overflow="visible">
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke={PT.cardSunk} strokeWidth={11} strokeLinecap="round" />
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke={color} strokeWidth={11} strokeLinecap="round"
          strokeDasharray={`${filled} ${arc}`}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: PT.textDim }}>/ 100</span>
      </div>
    </div>
  );
}

const PRIORITY_STYLES = {
  informativa: { bg: PT.greenSoft,            border: 'rgba(92,138,46,0.3)',  dot: PT.green },
  advertencia: { bg: 'rgba(224,169,46,0.1)',  border: 'rgba(224,169,46,0.4)', dot: '#c8901c' },
  critica:     { bg: 'rgba(217,83,79,0.08)',  border: 'rgba(217,83,79,0.35)', dot: '#d9534f' },
};

export default function PlantHealthWidget({ state }: Props) {
  const score   = calcHealthScore(state);
  const health  = calcHealthLabel(score);
  const stress  = calcStressIndex(state);
  const climate = calcClimateClass(state);
  const riego   = calcIrrigationPrediction(state);
  const et      = calcEvapotranspiration(state);

  const stressPriority =
    stress.level === 'alto'  ? 'critica' :
    stress.level === 'medio' ? 'advertencia' : 'informativa';

  const riegoPriority = riego.urgente ? 'critica' : 'informativa';

  return (
    <div className="rounded-3xl p-6 flex flex-col gap-5"
      style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadow }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: PT.greenSoft, color: PT.green }}>
          <HeartPulse size={18} />
        </div>
        <span className="font-bold text-base" style={{ color: PT.textHi }}>Salud de la planta</span>
      </div>

      {/* Evapotranspiración */}
      <div className="rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
        style={{ background: PT.cardRaise, border: `1px solid ${et.color}40` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${et.color}1e` }}>
            <Droplets size={15} style={{ color: et.color }} />
          </div>
          <span className="text-xs font-bold" style={{ color: PT.textHi }}>Evapotranspiración estimada</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold" style={{ color: et.color }}>{et.mmPerDay} mm/día</span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: `${et.color}20`, color: et.color }}>{et.label}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* ── Puntaje ── */}
        <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl"
          style={{
            background: `linear-gradient(160deg, ${PT.greenSoft} 0%, ${PT.cardRaise} 100%)`,
            border: `1px solid ${health.color}35`,
          }}>
          <ScoreRing score={score} color={health.color} />
          <span className="text-base font-extrabold" style={{ color: health.color }}>{health.label}</span>
          <span className="text-xs text-center" style={{ color: PT.textDim }}>Salud general</span>
        </div>

        {/* ── Estrés + Clima ── */}
        <div className="flex flex-col gap-3">
          {/* Estrés */}
          <div className="flex-1 rounded-2xl p-3.5 flex flex-col gap-1"
            style={{
              background: PRIORITY_STYLES[stressPriority].bg,
              border: `1px solid ${PRIORITY_STYLES[stressPriority].border}`,
            }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_STYLES[stressPriority].dot }} />
              <span className="text-xs font-bold" style={{ color: PT.textHi }}>Índice de estrés</span>
            </div>
            <span className="text-sm font-extrabold" style={{ color: stress.color }}>{stress.label}</span>
            <span className="text-xs" style={{ color: PT.textMed }}>{stress.detail}</span>
          </div>

          {/* Clima */}
          <div className="flex-1 rounded-2xl p-3.5 flex flex-col gap-1"
            style={{ background: PT.cardRaise, border: `1px solid ${PT.borderDim}` }}>
            <div className="flex items-center gap-2">
              <Sun size={13} style={{ color: PT.green }} />
              <span className="text-xs font-bold" style={{ color: PT.textHi }}>Clima del día</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: PT.textHi }}>{climate.title}</span>
            <span className="text-xs" style={{ color: PT.textMed }}>{climate.detail}</span>
          </div>
        </div>

        {/* ── Predicción riego ── */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-2xl p-4 flex flex-col justify-between gap-2"
            style={{
              background: PRIORITY_STYLES[riegoPriority].bg,
              border: `1px solid ${PRIORITY_STYLES[riegoPriority].border}`,
            }}>
            <div className="flex items-center gap-2">
              <Droplets size={15} style={{ color: riego.urgente ? '#d9534f' : PT.green }} />
              <span className="text-xs font-bold" style={{ color: PT.textHi }}>Predicción de riego</span>
            </div>
            <span className="text-xl font-extrabold"
              style={{ color: riego.urgente ? '#d9534f' : PT.greenDeep }}>
              {riego.text}
            </span>
            <span className="text-xs" style={{ color: PT.textMed }}>
              Según humedad del suelo, temperatura y luz actual
            </span>
          </div>

          {/* Variables actuales */}
          <div className="rounded-2xl p-3.5 flex flex-col gap-2"
            style={{ background: PT.cardRaise, border: `1px solid ${PT.borderDim}` }}>
            <span className="text-xs font-semibold" style={{ color: PT.textHi }}>Variables actuales</span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1" style={{ color: PT.textMed }}>
                  <Thermometer size={11} />Temperatura
                </span>
                <span className="text-xs font-bold" style={{ color: PT.textHi }}>
                  {state.temperatura !== null ? `${state.temperatura} °C` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1" style={{ color: PT.textMed }}>
                  <Sun size={11} />Luz
                </span>
                <span className="text-xs font-bold" style={{ color: PT.textHi }}>
                  {state.luz_estado === 1 ? 'Con luz' : state.luz_estado === 0 ? 'En sombra' : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
