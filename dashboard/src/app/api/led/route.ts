import { NextRequest, NextResponse } from 'next/server';
import * as mqtt from 'mqtt';

// Mantener una conexión MQTT reutilizable durante el ciclo de vida del servidor
let mqttClient: mqtt.MqttClient | null = null;

function getMqttClient(): Promise<mqtt.MqttClient> {
  return new Promise((resolve, reject) => {
    if (mqttClient && mqttClient.connected) {
      return resolve(mqttClient);
    }

    const broker = process.env.MQTT_BROKER;
    const user   = process.env.MQTT_USER;
    const pass   = process.env.MQTT_PASS;

    if (!broker || !user || !pass) {
      return reject(new Error('Variables MQTT no configuradas en el servidor'));
    }

    const client = mqtt.connect(broker, {
      username: user,
      password: pass,
      rejectUnauthorized: false,
      connectTimeout: 10000,
    });

    client.once('connect', () => {
      mqttClient = client;
      resolve(client);
    });

    client.once('error', (err) => {
      client.end();
      reject(err);
    });
  });
}

export async function POST(req: NextRequest) {
  let body: { habitacion?: number; estado?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { habitacion, estado } = body;

  if (habitacion !== 1 && habitacion !== 2) {
    return NextResponse.json({ error: 'habitacion debe ser 1 o 2' }, { status: 400 });
  }

  if (estado !== 'ON' && estado !== 'OFF') {
    return NextResponse.json({ error: 'estado debe ser ON o OFF' }, { status: 400 });
  }

  const topic = habitacion === 1
    ? 'habitacion/led/control'
    : 'habitacion2/led/control';

  try {
    const client = await getMqttClient();

    await new Promise<void>((resolve, reject) => {
      client.publish(topic, estado, { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return NextResponse.json({ ok: true, topic, estado });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al publicar MQTT';
    console.error('[API /led] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
