-- ============================================================
--  Domótica IoT — Tabla de Plantas
--  Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE TABLE plant_readings (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN (
    'temperatura', 'humedad_aire', 'luz_estado',
    'humedad_suelo', 'horas_sol', 'horas_sombra'
  )),
  valor       NUMERIC NOT NULL
);

CREATE INDEX idx_plant_readings_lookup
  ON plant_readings (sensor_type, created_at DESC);

ALTER TABLE plant_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read"
  ON plant_readings FOR SELECT TO anon USING (true);

CREATE POLICY "service_insert"
  ON plant_readings FOR INSERT TO service_role WITH CHECK (true);

-- ============================================================
--  Después habilitar Realtime:
--  Supabase → Database → Replication → plant_readings ✓
-- ============================================================

-- ============================================================
--  Función RPC para estadísticas de hoy (evita límite 1000 filas)
--  Ejecutar en SQL Editor si aún no existe
-- ============================================================
-- ============================================================
--  Actualización: añadir 'horas_frio' al CHECK constraint
--  Ejecutar cuando se cargue el nuevo codigo ESP32 con horas_frio
-- ============================================================
ALTER TABLE plant_readings
  DROP CONSTRAINT IF EXISTS plant_readings_sensor_type_check;
ALTER TABLE plant_readings
  ADD CONSTRAINT plant_readings_sensor_type_check
    CHECK (sensor_type IN (
      'temperatura', 'humedad_aire', 'luz_estado',
      'humedad_suelo', 'horas_sol', 'horas_sombra', 'horas_frio'
    ));

-- ============================================================
--  Función RPC para estadísticas de hoy (evita límite 1000 filas)
--  Ejecutar en SQL Editor si aún no existe
-- ============================================================
CREATE OR REPLACE FUNCTION get_plant_today_stats(p_since timestamptz)
RETURNS TABLE (sensor_type text, min_val numeric, max_val numeric, avg_val numeric, cnt bigint)
LANGUAGE sql STABLE
AS $$
  SELECT sensor_type,
         MIN(valor),
         MAX(valor),
         ROUND(AVG(valor)::numeric, 1),
         COUNT(*)
  FROM plant_readings
  WHERE created_at >= p_since
    AND sensor_type IN ('temperatura', 'humedad_aire', 'humedad_suelo')
  GROUP BY sensor_type;
$$;
