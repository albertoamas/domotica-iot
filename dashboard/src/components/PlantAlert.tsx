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

const STYLE: Record<Priority, { leftBorder: string; tint: string; pill: string; pillText: string; iconColor: string; titleColor: string }> = {
  critica:     { leftBorder: '#d9534f', tint: 'rgba(217,83,79,0.06)',  pill: '#d9534f', pillText: '#fff',     iconColor: '#d9534f', titleColor: '#8b1a18' },
  advertencia: { leftBorder: '#c8901c', tint: 'rgba(224,169,46,0.07)', pill: '#c8901c', pillText: '#fff',     iconColor: '#c8901c', titleColor: '#7a5810' },
  informativa: { leftBorder: PT.green,  tint: 'rgba(92,138,46,0.06)',  pill: PT.green,  pillText: '#fff',     iconColor: PT.green,  titleColor: PT.greenDeep },
};

const PRIORITY_ORDER: Priority[] = ['critica', 'advertencia', 'informativa'];

function AlertBanner({ priority, icon, title, detail }: AlertDef) {
  const s = STYLE[priority];
  const PriorityIcon = priority === 'critica' ? AlertTriangle : priority === 'advertencia' ? AlertTriangle : Info;
  return (
    <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5 overflow-hidden"
      style={{
        background: PT.card,
        boxShadow: PT.shadow,
        borderLeft: `4px solid ${s.leftBorder}`,
        borderTop: `1px solid ${PT.border}`,
        borderRight: `1px solid ${PT.border}`,
        borderBottom: `1px solid ${PT.border}`,
        backgroundImage: `linear-gradient(to right, ${s.tint}, transparent 40%)`,
      }}>
      <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
        <PriorityIcon size={15} style={{ color: s.iconColor }} />
        <span style={{ color: s.iconColor }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm" style={{ color: s.titleColor }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: PT.textMed }}>{detail}</p>
      </div>
      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 self-start mt-0.5"
        style={{ background: s.pill, color: s.pillText }}>
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
