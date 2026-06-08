'use client';

import { AlertTriangle, Info, Thermometer, Droplets, Sun, Moon } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { PLANT_ALERTS, sueloPercent } from '@/lib/plantTypes';
import { PT } from '@/lib/plantTheme';

type Priority = 'critica' | 'advertencia' | 'informativa';

interface AlertDef {
  priority: Priority;
  icon: React.ReactNode;
  title: string;
  detail: string;
}

const STYLE: Record<Priority, {
  bg: string; border: string; iconBg: string; iconColor: string;
  titleColor: string; detailColor: string; pillBg: string; pillText: string;
  pulse: boolean;
}> = {
  critica: {
    bg: '#fff0f0', border: '#f5a0a0',
    iconBg: '#dc2626', iconColor: '#fff',
    titleColor: '#991b1b', detailColor: '#b91c1c',
    pillBg: '#dc2626', pillText: '#fff',
    pulse: true,
  },
  advertencia: {
    bg: '#fffbeb', border: '#fcd34d',
    iconBg: '#d97706', iconColor: '#fff',
    titleColor: '#92400e', detailColor: '#b45309',
    pillBg: '#d97706', pillText: '#fff',
    pulse: false,
  },
  informativa: {
    bg: '#f0fdf4', border: '#86efac',
    iconBg: PT.green, iconColor: '#fff',
    titleColor: PT.greenDeep, detailColor: PT.green,
    pillBg: PT.green, pillText: '#fff',
    pulse: false,
  },
};

const PRIORITY_ORDER: Priority[] = ['critica', 'advertencia', 'informativa'];

function AlertBanner({ priority, icon, title, detail }: AlertDef) {
  const s = STYLE[priority];
  const PriorityIcon = priority === 'critica' ? AlertTriangle : priority === 'advertencia' ? AlertTriangle : Info;
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-4"
      style={{
        background: s.bg,
        border: `1.5px solid ${s.border}`,
        boxShadow: `0 4px 16px ${s.border}60`,
      }}>

      {/* Icono en círculo sólido */}
      <div className="relative shrink-0">
        {s.pulse && (
          <span className="absolute inset-0 rounded-full animate-ping"
            style={{ background: s.iconBg, opacity: 0.35 }} />
        )}
        <div className="w-11 h-11 rounded-full flex items-center justify-center relative"
          style={{ background: s.iconBg }}>
          <PriorityIcon size={20} style={{ color: s.iconColor }} strokeWidth={2.5} />
        </div>
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-sm leading-tight" style={{ color: s.titleColor }}>{title}</p>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: s.detailColor }}>{detail}</p>
      </div>

      {/* Badge */}
      <span className="text-xs font-bold px-3 py-1 rounded-full shrink-0 uppercase tracking-wide"
        style={{ background: s.pillBg, color: s.pillText }}>
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
