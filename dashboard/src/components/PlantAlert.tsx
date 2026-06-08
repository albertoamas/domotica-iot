'use client';

import { AlertTriangle, Info, Thermometer, Droplets, Sun, Moon } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { PLANT_ALERTS, sueloPercent } from '@/lib/plantTypes';

type Priority = 'critica' | 'advertencia' | 'informativa';

interface AlertDef {
  priority: Priority;
  icon: React.ReactNode;
  title: string;
  detail: string;
}

const STYLE: Record<Priority, { bg: string; border: string; iconColor: string; titleColor: string }> = {
  critica:     { bg: 'rgba(239,68,68,0.08)',    border: '#fca5a5', iconColor: '#ef4444', titleColor: '#991b1b' },
  advertencia: { bg: 'rgba(245,158,11,0.08)',   border: '#fcd34d', iconColor: '#f59e0b', titleColor: '#92400e' },
  informativa: { bg: 'rgba(22,163,74,0.07)',    border: '#86efac', iconColor: '#16a34a', titleColor: '#14532d' },
};

const PRIORITY_ORDER: Priority[] = ['critica', 'advertencia', 'informativa'];

function AlertBanner({ priority, icon, title, detail }: AlertDef) {
  const s = STYLE[priority];
  const PriorityIcon = priority === 'critica' ? AlertTriangle : priority === 'advertencia' ? AlertTriangle : Info;
  return (
    <div className="flex items-start gap-3 rounded-xl px-4 py-3"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
        <PriorityIcon size={14} style={{ color: s.iconColor }} />
        <span style={{ color: s.iconColor }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: s.titleColor }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{detail}</p>
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 self-start mt-0.5"
        style={{ background: s.border + '55', color: s.titleColor }}>
        {priority === 'critica' ? 'Crítica' : priority === 'advertencia' ? 'Aviso' : 'Info'}
      </span>
    </div>
  );
}

export default function PlantAlert({ state }: { state: PlantState }) {
  const sueloPct = sueloPercent(state.humedad_suelo);
  const alerts: AlertDef[] = [];

  // ── Críticas ─────────────────────────────────────────────────────
  if (state.temperatura !== null && state.temperatura > PLANT_ALERTS.TEMP_ALTA)
    alerts.push({
      priority: 'critica',
      icon: <Thermometer size={14} />,
      title: `Temperatura alta — ${state.temperatura} °C`,
      detail: `Supera ${PLANT_ALERTS.TEMP_ALTA} °C. La planta puede sufrir estrés térmico grave. Mover a la sombra o ventilar.`,
    });

  if (sueloPct !== null && sueloPct < 15)
    alerts.push({
      priority: 'critica',
      icon: <Droplets size={14} />,
      title: `Suelo muy seco — ${sueloPct}%`,
      detail: 'Humedad crítica. Regar inmediatamente para evitar marchitamiento irreversible.',
    });

  if (state.temperatura !== null && state.temperatura < PLANT_ALERTS.TEMP_BAJA)
    alerts.push({
      priority: 'critica',
      icon: <Thermometer size={14} />,
      title: `Temperatura baja — ${state.temperatura} °C`,
      detail: `Por debajo de ${PLANT_ALERTS.TEMP_BAJA} °C. Riesgo de daño por frío. Llevar la planta a un lugar cálido.`,
    });

  // ── Advertencias ─────────────────────────────────────────────────
  if (sueloPct !== null && sueloPct >= 15 && sueloPct < PLANT_ALERTS.SUELO_SECO)
    alerts.push({
      priority: 'advertencia',
      icon: <Droplets size={14} />,
      title: `Suelo seco — ${sueloPct}%`,
      detail: `La planta necesita agua pronto. Regar antes de que baje del 15%.`,
    });

  if (state.horas_sol !== null && state.horas_sol > PLANT_ALERTS.SOL_EXCESO)
    alerts.push({
      priority: 'advertencia',
      icon: <Sun size={14} />,
      title: `Exposición solar alta — ${Math.round(state.horas_sol)}h`,
      detail: 'Muchas horas de sol acumuladas. Considerar mover a semisombra para evitar quemaduras.',
    });

  // ── Informativas ─────────────────────────────────────────────────
  if (state.luz_estado === 0 && state.horas_sombra !== null && state.horas_sombra > 8)
    alerts.push({
      priority: 'informativa',
      icon: <Moon size={14} />,
      title: `Poca luz solar — ${Math.round(state.horas_sombra)}h en sombra`,
      detail: 'La planta lleva muchas horas sin luz directa. Verificar si necesita más exposición solar.',
    });

  if (sueloPct !== null && sueloPct > 88)
    alerts.push({
      priority: 'informativa',
      icon: <Droplets size={14} />,
      title: `Suelo muy húmedo — ${sueloPct}%`,
      detail: 'Exceso de agua en el sustrato. Pausar el riego y verificar el drenaje.',
    });

  if (alerts.length === 0) return null;

  // Ordenar por prioridad
  const sorted = [...alerts].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((a, i) => <AlertBanner key={i} {...a} />)}
    </div>
  );
}
