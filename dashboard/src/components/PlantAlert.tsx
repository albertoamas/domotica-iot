'use client';

import { AlertTriangle, Thermometer, Droplets } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { PLANT_ALERTS, sueloPercent } from '@/lib/plantTypes';

interface AlertBannerProps {
  icon: React.ReactNode;
  title: string;
  detail: string;
  color: string;       // color del borde e ícono
  bgColor: string;     // fondo del banner
}

function AlertBanner({ icon, title, detail, color, bgColor }: AlertBannerProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 animate-pulse"
      style={{ background: bgColor, border: `1px solid ${color}` }}
    >
      <div className="mt-0.5" style={{ color }}>{icon}</div>
      <div>
        <p className="font-bold text-sm text-white">{title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#d1d5db' }}>{detail}</p>
      </div>
    </div>
  );
}

interface PlantAlertProps {
  state: PlantState;
}

export default function PlantAlert({ state }: PlantAlertProps) {
  const sueloPct = sueloPercent(state.humedad_suelo);
  const alerts: AlertBannerProps[] = [];

  // Temperatura alta
  if (state.temperatura !== null && state.temperatura > PLANT_ALERTS.TEMP_ALTA) {
    alerts.push({
      icon: <Thermometer size={20} />,
      title: `⚠ Temperatura alta — ${state.temperatura} °C`,
      detail: `Umbral: ${PLANT_ALERTS.TEMP_ALTA} °C. La planta puede sufrir estrés por calor. Considera moverla a la sombra o ventilar el ambiente.`,
      color: '#f87171',
      bgColor: 'rgba(239,68,68,0.12)',
    });
  }

  // Temperatura baja
  if (state.temperatura !== null && state.temperatura < PLANT_ALERTS.TEMP_BAJA) {
    alerts.push({
      icon: <Thermometer size={20} />,
      title: `⚠ Temperatura baja — ${state.temperatura} °C`,
      detail: `Umbral: ${PLANT_ALERTS.TEMP_BAJA} °C. Riesgo de daño por frío. Lleva la planta a un lugar más cálido.`,
      color: '#818cf8',
      bgColor: 'rgba(99,102,241,0.12)',
    });
  }

  // Suelo muy seco
  if (sueloPct !== null && sueloPct < PLANT_ALERTS.SUELO_SECO) {
    alerts.push({
      icon: <Droplets size={20} />,
      title: `⚠ Suelo muy seco — ${sueloPct}% de humedad`,
      detail: `Umbral: ${PLANT_ALERTS.SUELO_SECO}%. La planta necesita agua. Riega pronto para evitar marchitamiento.`,
      color: '#fbbf24',
      bgColor: 'rgba(245,158,11,0.12)',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a, i) => (
        <AlertBanner key={i} {...a} />
      ))}
    </div>
  );
}
