import { supabase } from './supabase';
import type { PlantReading, PlantSensorType, PlantState } from './plantTypes';
import { PLANT_CHART_LIMIT } from './plantTypes';

export interface PlantSensorStats {
  min: number; max: number; avg: number; count: number;
}
export interface PlantTodayStats {
  temperatura:   PlantSensorStats | null;
  humedad_aire:  PlantSensorStats | null;
  humedad_suelo: PlantSensorStats | null;
}

// Requiere la función SQL get_plant_today_stats en Supabase (ver supabase/schema_plantas.sql)
export async function fetchPlantTodayStats(): Promise<PlantTodayStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase.rpc('get_plant_today_stats', {
    p_since: startOfDay.toISOString(),
  });

  if (error) throw new Error(error.message);

  const result: PlantTodayStats = { temperatura: null, humedad_aire: null, humedad_suelo: null };

  for (const row of data as { sensor_type: string; min_val: number; max_val: number; avg_val: number; cnt: number }[]) {
    const key = row.sensor_type as keyof PlantTodayStats;
    if (!(key in result)) continue;
    result[key] = {
      min:   Number(row.min_val),
      max:   Number(row.max_val),
      avg:   Number(row.avg_val),
      count: Number(row.cnt),
    };
  }

  return result;
}

// Últimas N lecturas de un sensor de planta
export async function fetchPlantHistory(
  sensor_type: PlantSensorType,
  limit = PLANT_CHART_LIMIT
): Promise<PlantReading[]> {
  const { data, error } = await supabase
    .from('plant_readings')
    .select('*')
    .eq('sensor_type', sensor_type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as PlantReading[]).reverse();
}

// Estado actual de la planta (última lectura de cada sensor)
export async function fetchLatestPlantReadings(): Promise<PlantState> {
  const sensors: PlantSensorType[] = [
    'temperatura', 'humedad_aire', 'luz_estado',
    'humedad_suelo', 'horas_sol', 'horas_sombra',
  ];

  const results = await Promise.all(
    sensors.map((s) =>
      supabase
        .from('plant_readings')
        .select('*')
        .eq('sensor_type', s)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
  );

  const state: PlantState = {
    temperatura: null, humedad_aire: null, luz_estado: null,
    humedad_suelo: null, horas_sol: null, horas_sombra: null,
    lastUpdate: null,
  };

  results.forEach((r) => {
    if (!r.data) return;
    const row = r.data as PlantReading;
    (state as unknown as Record<string, number | null>)[row.sensor_type] = row.valor;
    if (!state.lastUpdate || row.created_at > state.lastUpdate) {
      state.lastUpdate = row.created_at;
    }
  });

  return state;
}
