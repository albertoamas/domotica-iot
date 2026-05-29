# Dashboard — Domótica IoT

Frontend Next.js con gráficas en tiempo real, historial y control de LEDs.

## Características

- **Dashboard en tiempo real** — Supabase Realtime actualiza la UI cada vez que el ESP32 envía un dato
- **Gráficas Recharts** — Temperatura, humedad, gas y luz para cada habitación
- **Alertas de gas** — Banner animado cuando el nivel supera 1000
- **Control LED** — Toggle ON/OFF por habitación via MQTT
- **Historial** — Tabla con filtros, paginación y exportación CSV

## Desarrollo local

1. Copiar `.env.local.example` a `.env.local` y rellenar las credenciales
2. `npm install`
3. `npm run dev` → abrir http://localhost:3000

## Deploy en Vercel

1. Crear cuenta en vercel.com
2. New Project → Import Git Repository → seleccionar este repo
3. En **Root Directory** escribir: `dashboard`
4. En **Environment Variables** agregar:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = clave anon de Supabase
   - `MQTT_BROKER` = `mqtts://7c9421041ec04ce79cbf3520e3fcc77b.s1.eu.hivemq.cloud:8883`
   - `MQTT_USER` = `albertoamas`
   - `MQTT_PASS` = tu contraseña HiveMQ
5. Deploy

## Variables de entorno

| Variable | Dónde se usa | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | URL pública del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Clave anon para leer datos |
| `MQTT_BROKER` | Servidor (API route) | URL HiveMQ para control LED |
| `MQTT_USER` | Servidor | Usuario HiveMQ |
| `MQTT_PASS` | Servidor | Contraseña HiveMQ |

> Las variables `MQTT_*` solo las usa el servidor para el endpoint de control LED. Nunca llegan al browser.
