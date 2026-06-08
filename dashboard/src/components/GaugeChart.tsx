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
  value, min, max, label, unit, color, size = 220, zones = [],
}: GaugeChartProps) {
  const pct         = value !== null ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  const filled      = pct * 100;
  const empty       = 100 - filled;
  const activeColor = value !== null && zones.length > 0
    ? getZoneColor(value, zones, color)
    : color;

  const TRACK = '#dcfce7';
  const cx    = size / 2;
  const cy    = size / 2;

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <PieChart width={size} height={size}>
          {/* Track completo */}
          <Pie
            data={[{ value: 100 }]}
            cx={cx} cy={cy}
            startAngle={90} endAngle={-270}
            innerRadius={size * 0.30} outerRadius={size * 0.42}
            dataKey="value" stroke="none"
          >
            <Cell fill={TRACK} />
          </Pie>

          {/* Relleno del valor */}
          {value !== null && (
            <Pie
              data={[{ value: filled }, { value: empty }]}
              cx={cx} cy={cy}
              startAngle={90} endAngle={-270}
              innerRadius={size * 0.30} outerRadius={size * 0.42}
              dataKey="value" stroke="none"
              cornerRadius={4}
            >
              <Cell fill={activeColor} />
              <Cell fill="transparent" />
            </Pie>
          )}
        </PieChart>

        {/* Número centrado dentro del anillo */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: size * 0.20,
            fontWeight: 800,
            color: activeColor,
            lineHeight: 1,
          }}>
            {value !== null ? value : '—'}
          </span>
          <span style={{ fontSize: size * 0.09, color: '#6b9960', marginTop: 4 }}>
            {unit}
          </span>
        </div>
      </div>

      {/* Min / Max */}
      <div style={{
        width: size * 0.80,
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: -8,
      }}>
        <span style={{ fontSize: 11, color: '#6b9960' }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: '#6b9960' }}>{max}{unit}</span>
      </div>
    </div>
  );
}
