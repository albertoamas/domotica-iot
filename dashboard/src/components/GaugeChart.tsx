'use client';

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
  const activeColor = value !== null && zones.length > 0
    ? getZoneColor(value, zones, color)
    : color;

  const r          = size * 0.37;
  const cx         = size / 2;
  const cy         = size * 0.56;
  const arcLength  = Math.PI * r;
  const filled     = pct * arcLength;
  const sw         = size * 0.09; // stroke width

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <div style={{ position: 'relative', width: size, height: size * 0.62 }}>
        <svg width={size} height={size * 0.62} overflow="visible">
          {/* Track */}
          <path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
            fill="none"
            stroke="#dcfce7"
            strokeWidth={sw}
            strokeLinecap="round"
          />
          {/* Valor */}
          {value !== null && (
            <path
              d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
              fill="none"
              stroke={activeColor}
              strokeWidth={sw}
              strokeLinecap="round"
              strokeDasharray={`${filled} ${arcLength}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          )}
        </svg>

        {/* Número centrado */}
        <div style={{
          position: 'absolute',
          bottom: '2%', left: 0, right: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: size * 0.22, fontWeight: 800, color: activeColor, lineHeight: 1 }}>
            {value !== null ? value : '—'}
          </span>
          <span style={{ fontSize: size * 0.09, color: '#6b9960', marginTop: 2 }}>
            {unit}
          </span>
        </div>
      </div>

      {/* Min / Max */}
      <div style={{ width: size * 0.85, display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: '#6b9960' }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: '#6b9960' }}>{max}{unit}</span>
      </div>
    </div>
  );
}
