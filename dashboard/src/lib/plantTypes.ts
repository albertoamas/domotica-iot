export type PlantSensorType =
  | 'temperatura'
  | 'humedad_aire'
  | 'luz_estado'
  | 'humedad_suelo'
  | 'horas_sol'
  | 'horas_sombra'
  | 'horas_frio';

export interface PlantReading {
  id: number;
  created_at: string;
  sensor_type: PlantSensorType;
  valor: number;
}

export interface PlantState {
  temperatura:    number | null;
  humedad_aire:   number | null;
  luz_estado:     number | null;   // 0 = sombra, 1 = luz
  humedad_suelo:  number | null;   // 0–4095 raw (menor = más húmedo)
  horas_sol:      number | null;   // horas acumuladas desde boot
  horas_sombra:   number | null;
  horas_frio:     number | null;   // horas acumuladas con temp < 7°C
  lastUpdate:     string | null;
}

// Porcentaje de humedad de suelo (inverso: 4095 = seco, 0 = muy húmedo)
export function sueloPercent(raw: number | null): number | null {
  if (raw === null) return null;
  return Math.round(((4095 - raw) / 4095) * 100);
}

export const PLANT_CHART_LIMIT = 50;

// Convierte horas decimales a texto legible
// 0.021 → "1 min"   |   0.5 → "30 min"   |   1.75 → "1h 45m"
export function formatHoras(h: number | null): string {
  if (h === null) return '—';
  const totalMin = Math.round(h * 60);
  if (totalMin < 60) return `${totalMin} min`;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return mm > 0 ? `${hh}h ${mm}m` : `${hh}h`;
}

// Umbrales de alerta
export const PLANT_ALERTS = {
  TEMP_ALTA:   25,
  TEMP_BAJA:   10,
  SUELO_SECO:  25,
  SOL_EXCESO:  10,   // horas — demasiada exposición directa
};

// ─── Puntaje de salud 0-100 ───────────────────────────────────────────────
export function calcHealthScore(state: PlantState): number {
  const scores: number[] = [];

  // Temperatura (ideal 18–28°C)
  if (state.temperatura !== null) {
    const t = state.temperatura;
    let s = 0;
    if      (t < 0  || t > 50) s = 0;
    else if (t < 5)             s = 10;
    else if (t < 10)            s = 30;
    else if (t < 15)            s = 65;
    else if (t <= 28)           s = 100;
    else if (t <= 32)           s = 80;
    else if (t <= 38)           s = 40;
    else                        s = 15;
    scores.push(s);
  }

  // Humedad suelo (ideal 40–75%)
  const sp = sueloPercent(state.humedad_suelo);
  if (sp !== null) {
    let s = 0;
    if      (sp < 10)  s = 0;
    else if (sp < 25)  s = 20;
    else if (sp < 40)  s = 60;
    else if (sp <= 75) s = 100;
    else if (sp <= 88) s = 75;
    else               s = 50;
    scores.push(s);
  }

  // Humedad aire (ideal 45–70%)
  if (state.humedad_aire !== null) {
    const h = state.humedad_aire;
    let s = 0;
    if      (h < 20)  s = 20;
    else if (h < 35)  s = 55;
    else if (h <= 70) s = 100;
    else if (h <= 85) s = 75;
    else              s = 50;
    scores.push(s);
  }

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export type HealthLabel = 'Excelente' | 'Buena' | 'Regular' | 'Mala';

export function calcHealthLabel(score: number): { label: HealthLabel; color: string } {
  if (score >= 80) return { label: 'Excelente', color: '#16a34a' };
  if (score >= 60) return { label: 'Buena',     color: '#65a30d' };
  if (score >= 35) return { label: 'Regular',   color: '#f59e0b' };
  return               { label: 'Mala',      color: '#ef4444' };
}

// ─── Índice de estrés ─────────────────────────────────────────────────────
export type StressLevel = 'bajo' | 'medio' | 'alto';

export function calcStressIndex(state: PlantState): {
  level: StressLevel; label: string; detail: string; color: string;
} {
  const score = calcHealthScore(state);
  if (score >= 70) return { level: 'bajo',  label: 'Saludable',         detail: 'Condiciones óptimas para la planta.',          color: '#16a34a' };
  if (score >= 40) return { level: 'medio', label: 'Atención',          detail: 'Alguna condición fuera del rango ideal.',       color: '#f59e0b' };
  return               { level: 'alto',  label: 'Riesgo de marchitamiento', detail: 'Varias condiciones críticas simultáneas.', color: '#ef4444' };
}

// ─── Clasificación climática del día ─────────────────────────────────────
export function calcClimateClass(state: PlantState): { title: string; detail: string } {
  const t = state.temperatura;
  const h = state.humedad_aire;

  if (t === null) return { title: '—', detail: 'Sin datos de temperatura.' };

  if (t >= 18 && t <= 28 && h !== null && h >= 40 && h <= 70)
    return { title: 'Día ideal para crecimiento',     detail: 'Temperatura estable y humedad adecuada.' };
  if (t > 38)
    return { title: 'Día muy caluroso',               detail: 'Temperatura crítica — mover a la sombra.' };
  if (t > 32)
    return { title: 'Día cálido',                     detail: 'Temperatura elevada — vigilar la hidratación.' };
  if (t < 5)
    return { title: 'Día muy frío',                   detail: 'Riesgo de daño por helada.' };
  if (t < 12)
    return { title: 'Día fresco',                     detail: 'Temperatura baja — proteger si es posible.' };
  if (h !== null && h < 28)
    return { title: 'Día seco',                       detail: 'Humedad baja — riesgo de deshidratación.' };
  if (h !== null && h > 85)
    return { title: 'Día muy húmedo',                 detail: 'Alta humedad — vigilar hongos o enfermedades.' };
  return   { title: 'Condiciones moderadas',          detail: 'Variables dentro de rango aceptable.' };
}

// ─── Porcentaje de sol del día ────────────────────────────────────────────────
export function calcSolPercent(sol: number | null, sombra: number | null): number | null {
  if (sol === null || sombra === null) return null;
  const total = sol + sombra;
  if (total <= 0.001) return null;
  return Math.round((sol / total) * 100);
}

export function calcSolLabel(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: 'Mucha luz directa',    color: '#f59e0b' };
  if (pct >= 40) return { label: 'Exposición moderada',  color: '#4ade80' };
  if (pct >= 15) return { label: 'Poca exposición',      color: '#60a5fa' };
  return              { label: 'Casi sin luz directa', color: '#818cf8' };
}

// ─── Evapotranspiración simplificada ─────────────────────────────────────────
export function calcEvapotranspiration(state: PlantState): {
  mmPerDay: number; label: string; color: string;
} {
  const t       = state.temperatura ?? 22;
  const h       = state.humedad_aire ?? 60;
  const hayLuz  = state.luz_estado === 1;
  const base    = t * 0.13;
  const humFact = Math.max(0, (80 - h) / 80) * 1.8;
  const luFact  = hayLuz ? 1.7 : 0.75;
  const et      = Math.round(Math.max(0, (base + humFact) * luFact) * 10) / 10;

  if (et < 1.5) return { mmPerDay: et, label: 'Evaporación baja',     color: '#60a5fa' };
  if (et < 3.5) return { mmPerDay: et, label: 'Evaporación moderada', color: '#4ade80' };
  return             { mmPerDay: et, label: 'Evaporación alta',      color: '#f59e0b' };
}

// ─── Predicción de riego ─────────────────────────────────────────────────
export function calcIrrigationPrediction(state: PlantState): { text: string; urgente: boolean } {
  const sp = sueloPercent(state.humedad_suelo);
  if (sp === null) return { text: 'Sin datos de suelo', urgente: false };
  if (sp < 15)    return { text: 'Riego urgente',        urgente: true  };
  if (sp < 25)    return { text: 'Regar pronto',         urgente: true  };

  const t       = state.temperatura ?? 22;
  const hayLuz  = state.luz_estado === 1;
  let secadoH   = 2.5;
  if (t > 28) secadoH += (t - 28) * 0.4;
  if (hayLuz)  secadoH *= 1.6;

  const horasRestantes = Math.max(1, Math.round((sp - 25) / secadoH));
  if (horasRestantes === 1)   return { text: 'Riego en ~1 hora',                   urgente: false };
  if (horasRestantes < 24)    return { text: `Riego en ~${horasRestantes} horas`,  urgente: false };
  const dias = Math.round(horasRestantes / 24);
  return { text: `Riego en ~${dias} día${dias > 1 ? 's' : ''}`, urgente: false };
}
