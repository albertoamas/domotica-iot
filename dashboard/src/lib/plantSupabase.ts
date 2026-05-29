import { supabase } from './supabase';
import type { PlantReading, PlantSensorType, PlantState } from './plantTypes';
import { PLANT_CHART_LIMIT } from './plantTypes';

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
