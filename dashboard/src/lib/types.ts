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

export const GAS_ALERT_THRESHOLD = 3000;
export const CHART_HISTORY_LIMIT = 50;

export interface SensorStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface TodayStats {
  temperatura: SensorStats | null;
  humedad:     SensorStats | null;
  gas:         SensorStats | null;
}
