import * as mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// ===== Validar variables de entorno =====
const {
  MQTT_BROKER,
  MQTT_USER,
  MQTT_PASS,
  MQTT_BROKER_PLANTAS,
  MQTT_USER_PLANTAS,
  MQTT_PASS_PLANTAS,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
} = process.env;

if (!MQTT_BROKER || !MQTT_USER || !MQTT_PASS || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Faltan variables de entorno del broker principal o Supabase.');
  process.exit(1);
}

// ===== Supabase (service_role para insertar) =====
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ===== Sensores válidos por proyecto =====
const VALID_DOMOTICA  = new Set(['temperatura', 'humedad', 'gas', 'luz']);
const VALID_PLANTAS   = new Set([
  'temperatura', 'humedad_aire', 'luz_estado',
  'humedad_suelo', 'horas_sol', 'horas_sombra',
]);

// ===== Parser domótica: "habitacion/temperatura" → { habitacion, sensor_type } =====
function parseDomoticaTopic(topic: string): { habitacion: 1 | 2; sensor_type: string } | null {
  const match = topic.match(/^habitacion(2?)\/(\w+)$/);
  if (!match) return null;
  const habitacion = match[1] === '2' ? 2 : 1;
  const sensor_type = match[2];
  if (!VALID_DOMOTICA.has(sensor_type)) return null;
  return { habitacion: habitacion as 1 | 2, sensor_type };
}

// ===== Parser plantas: "planta/horas_sol" → sensor_type =====
function parsePlantTopic(topic: string): string | null {
  const match = topic.match(/^planta\/(\w+)$/);
  if (!match) return null;
  const sensor_type = match[1];
  if (!VALID_PLANTAS.has(sensor_type)) return null;
  return sensor_type;
}

// ===== Insertar lectura domótica =====
async function insertDomotica(habitacion: 1 | 2, sensor_type: string, valor: number) {
  const { error } = await supabase
    .from('sensor_readings')
    .insert({ habitacion, sensor_type, valor });
  if (error) {
    console.error(`[Supabase] Error domótica H${habitacion} ${sensor_type}:`, error.message);
  } else {
    console.log(`[DB] ✓ H${habitacion} ${sensor_type} = ${valor}`);
  }
}

// ===== Insertar lectura de plantas =====
async function insertPlanta(sensor_type: string, valor: number) {
  const { error } = await supabase
    .from('plant_readings')
    .insert({ sensor_type, valor });
  if (error) {
    console.error(`[Supabase] Error planta ${sensor_type}:`, error.message);
  } else {
    console.log(`[DB] 🌿 planta ${sensor_type} = ${valor}`);
  }
}

// ===== BROKER 1: Domótica (habitaciones) =====
console.log('[Bridge] Conectando a HiveMQ — Domótica...');

const clientDomotica = mqtt.connect(MQTT_BROKER, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: false,
  reconnectPeriod: 5000,
  connectTimeout: 30000,
});

clientDomotica.on('connect', () => {
  console.log('[MQTT Domótica] ✓ Conectado');
  clientDomotica.subscribe(['habitacion/+', 'habitacion2/+'], (err) => {
    if (err) console.error('[MQTT Domótica] Error suscripción:', err.message);
    else console.log('[MQTT Domótica] Suscrito a habitacion/+ y habitacion2/+');
  });
});

clientDomotica.on('message', (topic, payload) => {
  const valor = parseFloat(payload.toString().trim());
  if (isNaN(valor)) return;
  const parsed = parseDomoticaTopic(topic);
  if (!parsed) return;
  insertDomotica(parsed.habitacion, parsed.sensor_type, valor).catch(console.error);
});

clientDomotica.on('reconnect', () => console.log('[MQTT Domótica] Reconectando...'));
clientDomotica.on('error', (err) => console.error('[MQTT Domótica] Error:', err.message));

// ===== BROKER 2: Plantas (si está configurado) =====
if (MQTT_BROKER_PLANTAS && MQTT_USER_PLANTAS && MQTT_PASS_PLANTAS) {
  console.log('[Bridge] Conectando a HiveMQ — Plantas...');

  const clientPlantas = mqtt.connect(MQTT_BROKER_PLANTAS, {
    username: MQTT_USER_PLANTAS,
    password: MQTT_PASS_PLANTAS,
    rejectUnauthorized: false,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  });

  clientPlantas.on('connect', () => {
    console.log('[MQTT Plantas] ✓ Conectado');
    clientPlantas.subscribe('planta/+', (err) => {
      if (err) console.error('[MQTT Plantas] Error suscripción:', err.message);
      else console.log('[MQTT Plantas] Suscrito a planta/+');
    });
  });

  clientPlantas.on('message', (topic, payload) => {
    const valor = parseFloat(payload.toString().trim());
    if (isNaN(valor)) return;
    const sensor_type = parsePlantTopic(topic);
    if (!sensor_type) return;
    insertPlanta(sensor_type, valor).catch(console.error);
  });

  clientPlantas.on('reconnect', () => console.log('[MQTT Plantas] Reconectando...'));
  clientPlantas.on('error', (err) => console.error('[MQTT Plantas] Error:', err.message));
} else {
  console.log('[Bridge] Variables MQTT_BROKER_PLANTAS no configuradas — modo solo domótica.');
}

// ===== Cierre limpio =====
function shutdown() {
  console.log('[Bridge] Cerrando conexiones...');
  clientDomotica.end();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
