# MQTT Bridge — Domótica IoT

Proceso Node.js que suscribe a HiveMQ Cloud y persiste los datos en Supabase.

## Cómo funciona

1. Se conecta a HiveMQ Cloud vía MQTT/TLS (puerto 8883)
2. Suscribe a todos los topics: `habitacion/+` y `habitacion2/+`
3. Por cada mensaje, parsea el topic y hace INSERT en la tabla `sensor_readings` de Supabase
4. El cliente MQTT reconecta automáticamente si se pierde la conexión

## Desarrollo local

1. Copiar `.env.example` a `.env` y rellenar las credenciales
2. Instalar dependencias: `npm install`
3. Ejecutar: `npm run dev`

## Deploy en Railway

### Pasos:
1. Crear cuenta en [railway.app](https://railway.app)
2. New Project → Deploy from GitHub Repo → seleccionar este repositorio
3. En Settings → Root Directory → escribir: `mqtt-bridge`
4. En Variables agregar:
   - `MQTT_BROKER` = `mqtts://7c9421041ec04ce79cbf3520e3fcc77b.s1.eu.hivemq.cloud:8883`
   - `MQTT_USER` = `albertoamas`
   - `MQTT_PASS` = (tu contraseña)
   - `SUPABASE_URL` = (tu URL de Supabase)
   - `SUPABASE_SERVICE_KEY` = (clave service_role de Supabase)
5. Railway detecta el `railway.toml` y hace build + deploy automáticamente

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `MQTT_BROKER` | URL del broker HiveMQ en formato `mqtts://host:8883` |
| `MQTT_USER` | Usuario HiveMQ |
| `MQTT_PASS` | Contraseña HiveMQ |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Clave `service_role` (tiene permiso de INSERT) |
