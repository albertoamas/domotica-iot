'use client';

import { Lightbulb, Droplets, Thermometer, Sun, Wind, Leaf } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { sueloPercent, calcHealthScore } from '@/lib/plantTypes';
import { PT } from '@/lib/plantTheme';

interface Tip {
  priority: 'alta' | 'media' | 'baja';
  icon: React.ReactNode;
  title: string;
  detail: string;
}

const STYLE = {
  alta:  { bg: 'rgba(217,83,79,0.07)',   border: 'rgba(217,83,79,0.35)',  dot: '#d9534f', title: '#a23c38' },
  media: { bg: 'rgba(224,169,46,0.08)',  border: 'rgba(224,169,46,0.4)',  dot: '#c8901c', title: '#8a6614' },
  baja:  { bg: PT.greenSoft,             border: 'rgba(92,138,46,0.3)',   dot: PT.green,  title: PT.greenDeep },
};

function generateTips(state: PlantState): Tip[] {
  const tips: Tip[] = [];
  const sp    = sueloPercent(state.humedad_suelo);
  const score = calcHealthScore(state);

  // ── Suelo ─────────────────────────────────────────────────────────────────
  if (sp !== null && sp < 20) {
    tips.push({
      priority: 'alta',
      icon: <Droplets size={14} />,
      title: 'Regar la planta inmediatamente',
      detail: `Humedad del suelo al ${sp}% — nivel crítico. El marchitamiento es inminente.`,
    });
  } else if (sp !== null && sp < 35) {
    tips.push({
      priority: 'media',
      icon: <Droplets size={14} />,
      title: 'Preparar el riego pronto',
      detail: `Suelo al ${sp}% — se acerca al umbral seco. Regar en las próximas horas.`,
    });
  } else if (sp !== null && sp > 88) {
    tips.push({
      priority: 'baja',
      icon: <Droplets size={14} />,
      title: 'No regar por ahora',
      detail: 'El suelo está saturado. Esperar a que drene antes del próximo riego.',
    });
  }

  // ── Temperatura ───────────────────────────────────────────────────────────
  if (state.temperatura !== null) {
    if (state.temperatura > 38) {
      tips.push({
        priority: 'alta',
        icon: <Thermometer size={14} />,
        title: 'Mover a la sombra urgente',
        detail: `${state.temperatura} °C — temperatura crítica. La planta puede sufrir quemaduras.`,
      });
    } else if (state.temperatura > 32) {
      tips.push({
        priority: 'media',
        icon: <Thermometer size={14} />,
        title: 'Temperatura elevada — vigilar hidratación',
        detail: `${state.temperatura} °C acelera la evaporación del suelo. Verificar humedad con frecuencia.`,
      });
    } else if (state.temperatura < 7) {
      tips.push({
        priority: 'alta',
        icon: <Thermometer size={14} />,
        title: 'Proteger la planta del frío',
        detail: `${state.temperatura} °C — riesgo de daño celular. Llevar a un lugar cálido.`,
      });
    } else if (state.temperatura < 12) {
      tips.push({
        priority: 'media',
        icon: <Thermometer size={14} />,
        title: 'Temperatura baja — mantener abrigada',
        detail: `${state.temperatura} °C puede ralentizar el crecimiento. Abrigar si es posible.`,
      });
    }
  }

  // ── Luz ───────────────────────────────────────────────────────────────────
  if (state.horas_sol !== null && state.horas_sol > 10) {
    tips.push({
      priority: 'media',
      icon: <Sun size={14} />,
      title: 'Reducir exposición solar',
      detail: `${Math.round(state.horas_sol)}h de sol directo — mover a semisombra para evitar quemaduras en hojas.`,
    });
  } else if (state.luz_estado === 0 && state.horas_sombra !== null && state.horas_sombra > 8) {
    tips.push({
      priority: 'baja',
      icon: <Sun size={14} />,
      title: 'Acercar a una fuente de luz',
      detail: `${Math.round(state.horas_sombra)}h en sombra — la planta necesita más luz para la fotosíntesis.`,
    });
  }

  // ── Humedad aire ──────────────────────────────────────────────────────────
  if (state.humedad_aire !== null && state.humedad_aire < 30) {
    tips.push({
      priority: 'media',
      icon: <Wind size={14} />,
      title: 'Humedad ambiental muy baja',
      detail: `${state.humedad_aire}% — nebulizar las hojas o colocar un recipiente con agua cerca.`,
    });
  } else if (state.humedad_aire !== null && state.humedad_aire > 85) {
    tips.push({
      priority: 'baja',
      icon: <Wind size={14} />,
      title: 'Alta humedad ambiental',
      detail: `${state.humedad_aire}% — ventilar el área para prevenir hongos o enfermedades.`,
    });
  }

  // ── General ───────────────────────────────────────────────────────────────
  if (tips.length === 0) {
    if (score >= 80) {
      tips.push({
        priority: 'baja',
        icon: <Leaf size={14} />,
        title: '¡Planta en excelentes condiciones!',
        detail: 'Todas las variables están en rango óptimo. Continúa con el cuidado habitual.',
      });
    } else if (score >= 60) {
      tips.push({
        priority: 'baja',
        icon: <Leaf size={14} />,
        title: 'Planta en buen estado general',
        detail: 'Condiciones aceptables. Monitorear regularmente para mantener la salud.',
      });
    }
  }

  const ORDER = ['alta', 'media', 'baja'] as const;
  return [...tips]
    .sort((a, b) => ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority))
    .slice(0, 4);
}

export default function PlantAssistant({ state }: { state: PlantState }) {
  const tips = generateTips(state);

  return (
    <div className="rounded-3xl p-6 flex flex-col gap-4"
      style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadow }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(224,169,46,0.15)', color: '#c8901c' }}>
          <Lightbulb size={18} />
        </div>
        <span className="font-bold text-base" style={{ color: PT.textHi }}>Asistente de cuidado</span>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: PT.greenSoft, color: PT.greenDeep }}>
          {tips.length} consejo{tips.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tips */}
      <div className="flex flex-col gap-2.5">
        {tips.map((tip, i) => {
          const s = STYLE[tip.priority];
          return (
            <div key={i} className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                <span style={{ color: s.dot }}>{tip.icon}</span>
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: s.title }}>{tip.title}</p>
                <p className="text-xs mt-0.5" style={{ color: PT.textMed }}>{tip.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
