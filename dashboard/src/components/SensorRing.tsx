'use client';

interface Zone { threshold: number; color: string }

function resolveColor(value: number | null, zones: Zone[], fallback: string): string {
  if (value === null || zones.length === 0) return fallback;
  let active = zones[0].color;
  for (const z of zones) {
    if (value >= z.threshold) active = z.color;
  }
  return active;
}

interface SensorRingProps {
  value: number | null;
  min: number;
  max: number;
  label: string;
  unit: string;
  baseColor: string;
  size?: number;
  zones?: Zone[];
}

export default function SensorRing({
  value, min, max, label, unit, baseColor, size = 130, zones = [],
}: SensorRingProps) {
  const r    = size * 0.36;
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * r;
  const pct  = value !== null ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  const fill = pct * circ;
  const sw   = size * 0.095;

  const color = resolveColor(value, zones, baseColor);

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ display: 'block' }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={sw} />
          {/* Progress */}
          {value !== null && (
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={color}
              strokeWidth={sw}
              strokeDasharray={`${fill} ${circ}`}
              strokeLinecap="round"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.6s ease' }}
            />
          )}
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: size * 0.20,
            fontWeight: 800,
            color: value !== null ? color : '#475569',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {value !== null ? value : '—'}
          </span>
          {unit && (
            <span style={{ fontSize: size * 0.10, color: '#64748b', marginTop: 3 }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
  );
}
