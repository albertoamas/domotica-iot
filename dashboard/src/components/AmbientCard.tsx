'use client';

import { ReactNode } from 'react';

export interface AmbientZone {
  threshold: number;
  color: string;
  label: string;
}

interface AmbientCardProps {
  title: string;
  icon: ReactNode;
  value: number | null;
  unit: string;
  min: number;
  max: number;
  defaultColor: string;
  zones: AmbientZone[];
}

function getActiveZone(value: number, zones: AmbientZone[]): AmbientZone | null {
  let active: AmbientZone | null = null;
  for (const z of zones) {
    if (value >= z.threshold) active = z;
  }
  return active;
}

export default function AmbientCard({
  title, icon, value, unit, min, max, defaultColor, zones,
}: AmbientCardProps) {
  const activeZone  = value !== null ? getActiveZone(value, zones) : null;
  const activeColor = activeZone?.color ?? defaultColor;

  const pct       = value !== null ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  const r         = 68;
  const cx        = 88;
  const cy        = 84;
  const arcLen    = Math.PI * r;
  const filled    = pct * arcLen;
  const sw        = 13;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5 transition-all duration-500"
      style={{
        background: '#ffffff',
        border: `2px solid ${activeColor}30`,
        boxShadow: `0 4px 24px ${activeColor}18`,
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${activeColor}18`, color: activeColor }}
          >
            {icon}
          </div>
          <span className="font-bold text-base" style={{ color: '#14532d' }}>{title}</span>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full transition-all duration-500"
          style={{ background: `${activeColor}18`, color: activeColor }}
        >
          {activeZone?.label ?? '—'}
        </span>
      </div>

      {/* ── Valor principal ── */}
      <div className="flex items-end justify-center gap-1 leading-none">
        <span
          className="font-black transition-colors duration-500"
          style={{ fontSize: 72, color: activeColor, lineHeight: 1 }}
        >
          {value !== null ? value : '—'}
        </span>
        <span
          className="font-bold mb-2"
          style={{ fontSize: 28, color: activeColor }}
        >
          {unit}
        </span>
      </div>

      {/* ── Arco decorativo ── */}
      <div className="flex flex-col items-center gap-1">
        <svg width={176} height={100} overflow="visible">
          {/* Track */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
            fill="none"
            stroke="#dcfce7"
            strokeWidth={sw}
            strokeLinecap="round"
          />
          {/* Relleno */}
          {value !== null && (
            <path
              d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
              fill="none"
              stroke={activeColor}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${arcLen}`}
              style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.5s ease' }}
            />
          )}
        </svg>
        <div className="flex justify-between w-44 -mt-3">
          <span className="text-xs" style={{ color: '#6b9960' }}>{min}{unit}</span>
          <span className="text-xs" style={{ color: '#6b9960' }}>{max}{unit}</span>
        </div>
      </div>

      {/* ── Leyenda de zonas ── */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 border-t" style={{ borderColor: '#dcfce7' }}>
        {zones.map((z) => (
          <div key={z.threshold} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: z.color,
                boxShadow: activeZone?.color === z.color ? `0 0 6px ${z.color}` : 'none',
              }}
            />
            <span className="text-xs" style={{ color: activeZone?.color === z.color ? z.color : '#6b9960', fontWeight: activeZone?.color === z.color ? 600 : 400 }}>
              {z.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
