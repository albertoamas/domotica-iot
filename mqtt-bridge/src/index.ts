import * as mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// ===== Validar variables de entorno =====
const {
  MQTT_BROKER,
  MQTT_USER,
  MQTT_PASS,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
} = process.env;

if (!MQTT_BROKER || !MQTT_USER || !MQTT_PASS || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Faltan variables de entorno. Revisa .env');
  process.exit(1);
}

// ===== Supabase (service_role para insertar) =====
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ===== Tipos permitidos =====
const VALID_SENSORS = new Set(['temperatura', 'humedad', 'gas', 'luz']);

// ===== Parser de topic MQTT → { habitacion, sensor_type } =====
function parseTopic(topic: string): { habitacion: 1 | 2; sensor_type: string } | null {
  // Formato: "habitacion/<sensor>"  o  "habitacion2/<sensor>"
  const match = topic.match(/^habitacion(2?)\/(\w+)$/);
  if (!match) return null;

  const habitacion = match[1] === '2' ? 2 : 1;
  const sensor_type = match[2];

  if (!VALID_SENSORS.has(sensor_type)) return null;

  return { habitacion: habitacion as 1 | 2, sensor_type };
}

// ===== Insertar lectura en Supabase =====
async function insertReading(
  habitacion: 1 | 2,
  sensor_type: string,
  valor: number
): Promise<void> {
  const { error } = await supabase
    .from('sensor_readings')
    .insert({ habitacion, sensor_type, valor });

  if (error) {
    console.error(`[Supabase] Error INSERT habitacion ${habitacion} ${sensor_type}:`, error.message);
  } else {
    console.log(`[DB] ✓ H${habitacion} ${sensor_type} = ${valor}`);
  }
}

// ===== Conexión MQTT =====
console.log('[Bridge] Conectando a HiveMQ...');

const client = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: false,       // HiveMQ Cloud con certificado autofirmado
  reconnectPeriod: 5000,           // Reconectar cada 5s si se cae
  connectTimeout: 30000,
});

client.on('connect', () => {
  console.log('[MQTT] ✓ Conectado a HiveMQ Cloud');

  // Suscribirse a los 8 topics de sensores con wildcard
  client.subscribe(['habitacion/+', 'habitacion2/+'], (err) => {
    if (err) {
      console.error('[MQTT] Error al suscribirse:', err.message);
    } else {
      console.log('[MQTT] Suscrito a habitacion/+ y habitacion2/+');
      console.log('[Bridge] Esperando datos del ESP32...\n');
    }
  });
});

client.on('message', (topic, payload) => {
  const raw = payload.toString().trim();
  const valor = parseFloat(raw);

  if (isNaN(valor)) {
    console.warn(`[MQTT] Payload no numérico en ${topic}: "${raw}"`);
    return;
  }

  const parsed = parseTopic(topic);
  if (!parsed) {
    console.warn(`[MQTT] Topic desconocido: ${topic}`);
    return;
  }

  insertReading(parsed.habitacion, parsed.sensor_type, valor).catch(console.error);
});

client.on('reconnect', () => {
  console.log('[MQTT] Reconectando...');
});

client.on('error', (err) => {
  console.error('[MQTT] Error:', err.message);
});

client.on('offline', () => {
  console.warn('[MQTT] Conexión offline');
});

// Manejo limpio de cierre
process.on('SIGTERM', () => {
  console.log('[Bridge] Cerrando conexión...');
  client.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Bridge] Cerrando conexión...');
  client.end();
  process.exit(0);
});
