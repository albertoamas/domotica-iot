-- ============================================================
--  Domótica IoT — Schema Supabase
--  Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Tabla principal de lecturas de sensores
CREATE TABLE sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  habitacion  SMALLINT NOT NULL CHECK (habitacion IN (1, 2)),
  sensor_type TEXT     NOT NULL CHECK (sensor_type IN ('temperatura', 'humedad', 'gas', 'luz')),
  valor       NUMERIC  NOT NULL
);

-- Índice para consultas rápidas (filtrar por habitación + sensor + tiempo)
CREATE INDEX idx_readings_lookup
  ON sensor_readings (habitacion, sensor_type, created_at DESC);

-- Row Level Security
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- Lectura pública (frontend con clave anon)
CREATE POLICY "anon_read"
  ON sensor_readings FOR SELECT
  TO anon
  USING (true);

-- Inserción solo con service_role (el bridge usa esta clave)
CREATE POLICY "service_insert"
  ON sensor_readings FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
--  DESPUÉS de ejecutar este SQL, habilitar Realtime:
--  Supabase Dashboard → Database → Replication → sensor_readings ✓
-- ============================================================
