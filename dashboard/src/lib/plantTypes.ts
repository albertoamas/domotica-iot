export type PlantSensorType =
  | 'temperatura'
  | 'humedad_aire'
  | 'luz_estado'
  | 'humedad_suelo'
  | 'horas_sol'
  | 'horas_sombra';

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
  TEMP_ALTA:   35,   // °C — estrés por calor
  TEMP_BAJA:   10,   // °C — riesgo de frío
  SUELO_SECO:  25,   // % — necesita agua (basado en sueloPercent)
};
