'use client';

import { Droplets, Thermometer, Sun, Wind } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import {
  calcHealthScore, calcHealthLabel,
  calcStressIndex, calcClimateClass,
  calcIrrigationPrediction, calcEvapotranspiration,
} from '@/lib/plantTypes';

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
          fill="none" stroke="#dcfce7" strokeWidth={11} strokeLinecap="round" />
        <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none" stroke={color} strokeWidth={11} strokeLinecap="round"
          strokeDasharray={`${filled} ${arc}`}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <span style={{ fontSize: 30, fontWeight: 900, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: '#6b9960' }}>/ 100</span>
      </div>
    </div>
  );
}

const PRIORITY_STYLES = {
  informativa: { bg: '#f0fdf4', border: '#bbf7d0', dot: '#16a34a' },
  advertencia: { bg: '#fefce8', border: '#fde047', dot: '#ca8a04' },
  critica:     { bg: '#fff1f2', border: '#fecdd3', dot: '#ef4444' },
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
    <div className="rounded-2xl p-5 flex flex-col gap-5"
      style={{ background: '#ffffff', border: '2px solid #bbf7d0', boxShadow: '0 4px 20px #bbf7d015' }}>

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: '#f0fdf4', color: '#16a34a' }}>
          <Wind size={16} />
        </div>
        <span className="font-bold text-base" style={{ color: '#14532d' }}>Salud de la planta</span>
      </div>

      {/* Evapotranspiración */}
      <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
        style={{ background: '#f0fdf4', border: `1px solid ${et.color}40` }}>
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: et.color }}>💧</span>
          <span className="text-xs font-bold" style={{ color: '#14532d' }}>Evapotranspiración estimada</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-extrabold" style={{ color: et.color }}>{et.mmPerDay} mm/día</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${et.color}20`, color: et.color }}>{et.label}</span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* ── Puntaje ── */}
        <div className="flex flex-col items-center gap-2 p-4 rounded-xl"
          style={{ background: '#f0fdf4', border: `1px solid ${health.color}30` }}>
          <ScoreRing score={score} color={health.color} />
          <span className="text-sm font-bold" style={{ color: health.color }}>{health.label}</span>
          <span className="text-xs text-center" style={{ color: '#6b9960' }}>Salud general</span>
        </div>

        {/* ── Estrés + Clima ── */}
        <div className="flex flex-col gap-3">
          {/* Estrés */}
          <div className="flex-1 rounded-xl p-3 flex flex-col gap-1"
            style={{
              background: PRIORITY_STYLES[stressPriority].bg,
              border: `1px solid ${PRIORITY_STYLES[stressPriority].border}`,
            }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full"
                style={{ background: PRIORITY_STYLES[stressPriority].dot }} />
              <span className="text-xs font-bold" style={{ color: '#14532d' }}>Índice de estrés</span>
            </div>
            <span className="text-sm font-extrabold" style={{ color: stress.color }}>{stress.label}</span>
            <span className="text-xs" style={{ color: '#6b9960' }}>{stress.detail}</span>
          </div>

          {/* Clima */}
          <div className="flex-1 rounded-xl p-3 flex flex-col gap-1"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="flex items-center gap-2">
              <Sun size={12} style={{ color: '#16a34a' }} />
              <span className="text-xs font-bold" style={{ color: '#14532d' }}>Clima del día</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#14532d' }}>{climate.title}</span>
            <span className="text-xs" style={{ color: '#6b9960' }}>{climate.detail}</span>
          </div>
        </div>

        {/* ── Predicción riego ── */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 rounded-xl p-4 flex flex-col justify-between gap-2"
            style={{
              background: PRIORITY_STYLES[riegoPriority].bg,
              border: `1px solid ${PRIORITY_STYLES[riegoPriority].border}`,
            }}>
            <div className="flex items-center gap-2">
              <Droplets size={15} style={{ color: riego.urgente ? '#ef4444' : '#16a34a' }} />
              <span className="text-xs font-bold" style={{ color: '#14532d' }}>Predicción de riego</span>
            </div>
            <span className="text-xl font-extrabold"
              style={{ color: riego.urgente ? '#ef4444' : '#16a34a' }}>
              {riego.text}
            </span>
            <span className="text-xs" style={{ color: '#6b9960' }}>
              Basado en humedad del suelo, temperatura y luz actual
            </span>
          </div>

          {/* Variables que afectan la predicción */}
          <div className="rounded-xl p-3 flex flex-col gap-1.5"
            style={{ background: '#f0fdf4', border: '1px solid #dcfce7' }}>
            <span className="text-xs font-semibold" style={{ color: '#14532d' }}>Variables actuales</span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#6b9960' }}>
                  <Thermometer size={10} className="inline mr-1" />Temperatura
                </span>
                <span className="text-xs font-bold" style={{ color: '#14532d' }}>
                  {state.temperatura !== null ? `${state.temperatura} °C` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#6b9960' }}>
                  <Sun size={10} className="inline mr-1" />Luz
                </span>
                <span className="text-xs font-bold" style={{ color: '#14532d' }}>
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
