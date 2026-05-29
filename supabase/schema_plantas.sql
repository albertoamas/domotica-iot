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
