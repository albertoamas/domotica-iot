import { createClient } from '@supabase/supabase-js';
import type { SensorReading } from './types';

// Fallback a placeholder para que `next build` no falle sin env vars.
// En producción (Railway/Vercel) siempre estarán definidas.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
);

// Últimas N lecturas de un sensor específico ordenadas por tiempo
export async function fetchSensorHistory(
  habitacion: 1 | 2,
  sensor_type: string,
  limit = 50
): Promise<SensorReading[]> {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('habitacion', habitacion)
    .eq('sensor_type', sensor_type)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as SensorReading[]).reverse(); // cronológico para las gráficas
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
        .single()
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
