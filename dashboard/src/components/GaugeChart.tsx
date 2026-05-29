'use client';

import { PieChart, Pie, Cell } from 'recharts';

interface GaugeChartProps {
  value: number | null;
  min: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
  zones?: { threshold: number; color: string }[];
}

function getZoneColor(value: number, zones: { threshold: number; color: string }[], defaultColor: string): string {
  for (const zone of [...zones].reverse()) {
    if (value >= zone.threshold) return zone.color;
  }
  return defaultColor;
}

export default function GaugeChart({
  value, min, max, label, unit, color, size = 220,
  zones = [],
}: GaugeChartProps) {
  const pct     = value !== null ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  const filled  = pct * 100;
  const empty   = 100 - filled;
  const activeColor = value !== null && zones.length > 0
    ? getZoneColor(value, zones, color)
    : color;

  // Fondo oscuro café para el track vacío
  const TRACK = '#2a1605';
  const cx = size / 2;
  const cy = size / 2 + size * 0.08;

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <div style={{ position: 'relative', width: size, height: size * 0.62 }}>
        <PieChart width={size} height={size * 0.72}>
          {/* Track (fondo) */}
          <Pie
            data={[{ value: 100 }]}
            cx={cx} cy={cy}
            startAngle={215} endAngle={-35}
            innerRadius={size * 0.32} outerRadius={size * 0.44}
            dataKey="value" stroke="none"
          >
            <Cell fill={TRACK} />
          </Pie>

          {/* Valor activo */}
          {value !== null && (
            <Pie
              data={[{ value: filled }, { value: empty }]}
              cx={cx} cy={cy}
              startAngle={215} endAngle={-35}
              innerRadius={size * 0.32} outerRadius={size * 0.44}
              dataKey="value" stroke="none"
              cornerRadius={4}
            >
              <Cell fill={activeColor} />
              <Cell fill="transparent" />
            </Pie>
          )}
        </PieChart>

        {/* Valor central */}
        <div style={{
          position: 'absolute', bottom: 2, left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{ fontSize: size * 0.2, fontWeight: 800, color: activeColor, lineHeight: 1 }}>
            {value !== null ? value : '—'}
          </span>
          <span style={{ fontSize: size * 0.07, color: '#6b7280', marginTop: 2 }}>{unit}</span>
        </div>
      </div>

      {/* Min / Max */}
      <div style={{ width: size * 0.78, display: 'flex', justifyContent: 'space-between', marginTop: -4 }}>
        <span style={{ fontSize: 11, color: '#4b5563' }}>{min}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af' }}>{label}</span>
        <span style={{ fontSize: 11, color: '#4b5563' }}>{max}</span>
      </div>
    </div>
  );
}
