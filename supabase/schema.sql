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

-- ============================================================
--  Extensión v2: Estado de LEDs + Historial de alertas de gas
--  Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Estado persistente del LED por habitación
CREATE TABLE led_states (
  habitacion  SMALLINT PRIMARY KEY CHECK (habitacion IN (1, 2)),
  estado      TEXT NOT NULL CHECK (estado IN ('ON', 'OFF')) DEFAULT 'OFF',
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insertar filas iniciales (una por habitación)
INSERT INTO led_states (habitacion, estado)
VALUES (1, 'OFF'), (2, 'OFF');

ALTER TABLE led_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_led"
  ON led_states FOR SELECT TO anon USING (true);

-- El frontend (clave anon) puede actualizar el estado tras publicar MQTT
CREATE POLICY "anon_update_led"
  ON led_states FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- ============================================================

-- Historial de alertas de gas (registradas automáticamente por trigger)
CREATE TABLE gas_alerts (
  id          BIGSERIAL PRIMARY KEY,
  habitacion  SMALLINT NOT NULL CHECK (habitacion IN (1, 2)),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  max_valor   NUMERIC NOT NULL
);

CREATE INDEX idx_gas_alerts_lookup
  ON gas_alerts (habitacion, started_at DESC);

ALTER TABLE gas_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_gas_alerts"
  ON gas_alerts FOR SELECT TO anon USING (true);

-- El trigger corre como SECURITY DEFINER → acceso de superusuario

-- Función trigger: detecta cruces del umbral de gas en cada INSERT
CREATE OR REPLACE FUNCTION handle_gas_alert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.sensor_type = 'gas' THEN
    IF NEW.valor > 3000 THEN
      IF EXISTS (
        SELECT 1 FROM gas_alerts
        WHERE habitacion = NEW.habitacion AND ended_at IS NULL
      ) THEN
        -- Alerta ya abierta: actualizar valor máximo si es mayor
        UPDATE gas_alerts
          SET max_valor = GREATEST(max_valor, NEW.valor)
          WHERE habitacion = NEW.habitacion AND ended_at IS NULL;
      ELSE
        -- Gas superó el umbral por primera vez: abrir nueva alerta
        INSERT INTO gas_alerts (habitacion, started_at, max_valor)
        VALUES (NEW.habitacion, NEW.created_at, NEW.valor);
      END IF;
    ELSE
      -- Gas volvió a niveles normales: cerrar alerta abierta
      UPDATE gas_alerts
        SET ended_at = NEW.created_at
        WHERE habitacion = NEW.habitacion AND ended_at IS NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gas_alert
  AFTER INSERT ON sensor_readings
  FOR EACH ROW EXECUTE FUNCTION handle_gas_alert();
