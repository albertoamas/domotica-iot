import { createClient } from '@supabase/supabase-js';
import type { SensorReading, SensorStats, TodayStats } from './types';

// Fallback a placeholder para que `next build` no falle sin env vars.
// En producción (Railway/Vercel) siempre estarán definidas.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
);

// Estadísticas del día (min/max/avg) para temperatura, humedad y gas
export async function fetchTodayStats(habitacion: 1 | 2): Promise<TodayStats> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('sensor_readings')
    .select('sensor_type, valor')
    .eq('habitacion', habitacion)
    .gte('created_at', since24h.toISOString())
    .in('sensor_type', ['temperatura', 'humedad', 'gas']);

  if (error) throw new Error(error.message);

  const result: TodayStats = { temperatura: null, humedad: null, gas: null };
  const groups: Record<string, number[]> = { temperatura: [], humedad: [], gas: [] };

  for (const row of data as { sensor_type: string; valor: number }[]) {
    groups[row.sensor_type]?.push(Number(row.valor));
  }

  for (const key of ['temperatura', 'humedad', 'gas'] as const) {
    const vals = groups[key];
    if (vals.length === 0) continue;
    result[key] = {
      min:   Math.min(...vals),
      max:   Math.max(...vals),
      avg:   Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10,
      count: vals.length,
    } satisfies SensorStats;
  }

  return result;
}

// Últimas N lecturas de un sensor específico ordenadas por tiempo
// Si se pasa `since` (ISO string), filtra por tiempo en vez de por límite
export async function fetchSensorHistory(
  habitacion: 1 | 2,
  sensor_type: string,
  limit = 50,
  since?: string
): Promise<SensorReading[]> {
  let query = supabase
    .from('sensor_readings')
    .select('*')
    .eq('habitacion', habitacion)
    .eq('sensor_type', sensor_type)
    .order('created_at', { ascending: false });

  if (since) {
    query = query.gte('created_at', since).limit(500);
  } else {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as SensorReading[]).reverse();
}

// Última lectura de cada sensor para una habitación
export async function fetchLatestReadings(
  habitacion: 1 | 2
): Promise<SensorReading[]> {
  const sensors = ['temperatura', 'humedad', 'gas', 'luz'];
  const results = await Promise.all(
    sensors.map((s) =>
      supabase
        .from('sensor_readings')
        .select('*')
        .eq('habitacion', habitacion)
        .eq('sensor_type', s)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    )
  );

  return results
    .filter((r) => r.data !== null)
    .map((r) => r.data as SensorReading);
}

// Historial paginado con filtros (para la página /historial)
export async function fetchHistory(params: {
  habitacion?: 1 | 2;
  sensor_type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: SensorReading[]; count: number }> {
  const { habitacion, sensor_type, from, to, page = 0, pageSize = 50 } = params;

  let query = supabase
    .from('sensor_readings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (habitacion) query = query.eq('habitacion', habitacion);
  if (sensor_type) query = query.eq('sensor_type', sensor_type);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data as SensorReading[], count: count ?? 0 };
}
