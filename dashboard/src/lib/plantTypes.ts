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

// Umbrales de alerta
export const PLANT_ALERTS = {
  TEMP_ALTA:   35,   // °C — estrés por calor
  TEMP_BAJA:   10,   // °C — riesgo de frío
  SUELO_SECO:  25,   // % — necesita agua (basado en sueloPercent)
};
