'use client';

import { PieChart, Pie, Cell } from 'recharts';

interface GaugeChartProps {
  value: number | null;
  min: number;
  max: number;
  label: string;   // nombre del sensor, ej: "Temperatura"
  unit: string;    // unidad de medida, ej: "°C"
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
  const pct        = value !== null ? Math.min(Math.max((value - min) / (max - min), 0), 1) : 0;
  const filled     = pct * 100;
  const empty      = 100 - filled;
  const activeColor = value !== null && zones.length > 0
    ? getZoneColor(value, zones, color)
    : color;

  const TRACK = '#1a3314';
  const cx    = size / 2;
  // Subimos el centro del arco para que el número quede holgado debajo
  const cy    = size * 0.52;

  // Altura del contenedor: suficiente para el arco + número sin solaparse
  const containerH = size * 0.68;
  const chartH     = size * 0.78;

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>

      {/* Arco + número superpuesto */}
      <div style={{ position: 'relative', width: size, height: containerH }}>
        <PieChart width={size} height={chartH}>
          {/* Track vacío */}
          <Pie
            data={[{ value: 100 }]}
            cx={cx} cy={cy}
            startAngle={215} endAngle={-35}
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
              startAngle={215} endAngle={-35}
              innerRadius={size * 0.30} outerRadius={size * 0.42}
              dataKey="value" stroke="none"
              cornerRadius={4}
            >
              <Cell fill={activeColor} />
              <Cell fill="transparent" />
            </Pie>
          )}
        </PieChart>

        {/* Número centrado dentro del hueco del arco */}
        <div style={{
          position: 'absolute',
          top: cy - size * 0.13,   // centrado verticalmente en el hueco
          left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: size * 0.22,
            fontWeight: 800,
            color: activeColor,
            lineHeight: 1,
          }}>
            {value !== null ? value : '—'}
          </span>
          <span style={{ fontSize: size * 0.08, color: '#4a7c40', marginTop: 4 }}>
            {unit}
          </span>
        </div>
      </div>

      {/* Min / Max — sin repetir el nombre del sensor */}
      <div style={{
        width: size * 0.80,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: -8,
      }}>
        <span style={{ fontSize: 11, color: '#3a5c34' }}>{min}{unit}</span>
        <span style={{ fontSize: 11, color: '#3a5c34' }}>{max}{unit}</span>
      </div>
    </div>
  );
}
