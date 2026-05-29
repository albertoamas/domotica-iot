export type SensorType = 'temperatura' | 'humedad' | 'gas' | 'luz';
export type Habitacion = 1 | 2;

export interface SensorReading {
  id: number;
  created_at: string;
  habitacion: Habitacion;
  sensor_type: SensorType;
  valor: number;
}

// Estado actual de una habitación (última lectura de cada sensor)
export interface RoomState {
  temperatura: number | null;
  humedad: number | null;
  gas: number | null;
  luz: number | null;
  lastUpdate: string | null;
}

export const GAS_ALERT_THRESHOLD = 1000;
export const CHART_HISTORY_LIMIT = 50;
