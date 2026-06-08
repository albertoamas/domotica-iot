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

export type HistoryRange = 'realtime' | '1h' | '6h' | '24h';

// Lecturas históricas con rango de tiempo opcional
export async function fetchPlantHistory(
  sensor_type: PlantSensorType,
  range: HistoryRange = 'realtime'
): Promise<PlantReading[]> {
  let query = supabase
    .from('plant_readings')
    .select('*')
    .eq('sensor_type', sensor_type)
    .order('created_at', { ascending: false });

  if (range === 'realtime') {
    query = query.limit(PLANT_CHART_LIMIT);
  } else {
    const horasAtras = range === '1h' ? 1 : range === '6h' ? 6 : 24;
    const since = new Date(Date.now() - horasAtras * 3600 * 1000);
    query = query.gte('created_at', since.toISOString()).limit(500);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = data as PlantReading[];

  // Downsample a máximo 150 puntos para gráfica fluida
  if (rows.length > 150) {
    const step = Math.floor(rows.length / 150);
    return rows.filter((_, i) => i % step === 0).reverse();
  }
  return rows.reverse();
}


// Horas acumuladas totales desde el primer registro (sin reinicio a medianoche)
export async function fetchPlantTotalHours(): Promise<{
  horas_sol: number; horas_sombra: number; horas_frio: number;
} | null> {
  // Buscar el primer registro de la planta
  const { data: first } = await supabase
    .from('plant_readings')
    .select('created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const since = first ? first.created_at : new Date(0).toISOString();

  const { data, error } = await supabase.rpc('get_plant_computed_hours', { p_since: since });
  if (error || !data?.[0]) return null;

  const h = data[0] as { horas_sol: number; horas_sombra: number; horas_frio: number };
  return {
    horas_sol:    Number(h.horas_sol),
    horas_sombra: Number(h.horas_sombra),
    horas_frio:   Number(h.horas_frio),
  };
}

// Historial paginado de lecturas de planta (para la tabla /plantas/historial)
export async function fetchPlantHistoryTable(params: {
  sensor_type?: PlantSensorType;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: PlantReading[]; count: number }> {
  const { sensor_type, from, to, page = 0, pageSize = 50 } = params;

  let query = supabase
    .from('plant_readings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (sensor_type) query = query.eq('sensor_type', sensor_type);
  if (from)        query = query.gte('created_at', from);
  if (to)          query = query.lte('created_at', to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data as PlantReading[], count: count ?? 0 };
}

// Estado actual de la planta (última lectura de cada sensor)
// Las horas de sol/sombra/frío se calculan desde la BD (no del acumulador del ESP32)
export async function fetchLatestPlantReadings(): Promise<PlantState> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Fetch en paralelo: sensores directos + horas calculadas desde BD
  const [sensorResults, hoursResult] = await Promise.all([
    Promise.all(
      (['temperatura', 'humedad_aire', 'luz_estado', 'humedad_suelo'] as PlantSensorType[]).map((s) =>
        supabase
          .from('plant_readings')
          .select('*')
          .eq('sensor_type', s)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      )
    ),
    supabase.rpc('get_plant_computed_hours', { p_since: startOfDay.toISOString() }),
  ]);

  const state: PlantState = {
    temperatura: null, humedad_aire: null, luz_estado: null,
    humedad_suelo: null, horas_sol: null, horas_sombra: null,
    horas_frio: null, lastUpdate: null,
  };

  sensorResults.forEach((r) => {
    if (!r.data) return;
    const row = r.data as PlantReading;
    (state as unknown as Record<string, number | null>)[row.sensor_type] = row.valor;
    if (!state.lastUpdate || row.created_at > state.lastUpdate) {
      state.lastUpdate = row.created_at;
    }
  });

  // Horas calculadas desde la BD (desde medianoche, no se reinician con el ESP32)
  if (!hoursResult.error && hoursResult.data?.[0]) {
    const h = hoursResult.data[0] as { horas_sol: number; horas_sombra: number; horas_frio: number };
    state.horas_sol    = Number(h.horas_sol);
    state.horas_sombra = Number(h.horas_sombra);
    state.horas_frio   = Number(h.horas_frio);
  }

  return state;
}
