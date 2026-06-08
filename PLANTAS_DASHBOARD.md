# Plant Monitor — Explicación de secciones y tarjetas

## Cómo se actualizan los datos

El ESP32 publica una lectura cada **2 segundos** a HiveMQ → el bridge la guarda en Supabase.
El dashboard escucha cambios en tiempo real (Supabase Realtime) **y** hace polling cada 3 s
para asegurarse de no perder ningún dato.

Los valores de horas (sol, sombra, frío) **no vienen del ESP32** — se calculan contando
registros directamente en la base de datos desde medianoche. Esto evita que se reinicien
cada vez que el ESP32 se reinicia.

---

## Página principal — `/plantas`

### Alertas

Las alertas aparecen en la parte superior **solo cuando hay algo que informar**.
Si todo está bien, esta sección no se muestra.

| Nivel | Color | Condición que la dispara |
|---|---|---|
| **Crítica** | Rojo | Temperatura > 35 °C, temperatura < 10 °C, o suelo < 15 % |
| **Advertencia** | Ámbar | Suelo entre 15–25 %, o sol acumulado > 10 h |
| **Informativa** | Verde | En sombra > 8 h, o suelo > 88 % (exceso de agua) |

- **Tipo de dato:** tiempo real — se recalculan con cada actualización del estado.
- Si hay varias alertas activas a la vez, se ordenan de mayor a menor gravedad.

---

### Sección: Estado actual

Es la tarjeta principal del dashboard. Muestra el estado de todos los sensores en un solo vistazo.
Se actualiza cada 3 segundos con el último valor registrado en la base de datos.

#### Columna izquierda — Ambiente

**Temperatura**
- Qué muestra: la temperatura del ambiente donde está la planta, en °C.
- Tipo: **tiempo real** — es la última lectura recibida del sensor DHT22.
- Sensor ESP32: DHT22 (temperatura).

**Humedad del aire**
- Qué muestra: el porcentaje de humedad relativa del aire, de 0 a 100 %.
- Tipo: **tiempo real** — última lectura del mismo sensor DHT22.
- Ideal para la mayoría de plantas: entre 45 % y 70 %.

**Horas frío (< 7 °C)**
- Qué muestra: cuánto tiempo ha estado la temperatura por debajo de 7 °C hoy.
- Tipo: **acumulativo desde medianoche** — se cuenta cuántos registros de temperatura
  tienen valor < 7 °C desde las 00:00 del día actual, y se multiplica por 2 s (el intervalo
  de publicación del ESP32) para convertirlo a horas.
- Formato: se muestra como "X min" si es menos de una hora, o "Xh Ym" si es mayor.
- Se reinicia automáticamente a medianoche.

#### Columna central — Humedad del suelo (destacada)

- Qué muestra: el nivel de humedad del sustrato de la maceta, expresado en porcentaje (0–100 %).
- Tipo: **tiempo real** — última lectura del sensor capacitivo de suelo.
- El sensor devuelve un valor RAW de 0 a 4095 (analógico). El dashboard lo convierte:
  `% = ((4095 - raw) / 4095) × 100` — porque el sensor da valores **altos cuando está seco**
  y **bajos cuando está húmedo** (capacitivo inverso).
- También muestra el valor RAW original al pie de la tarjeta.
- La barra de progreso y el color cambian según el nivel:
  - < 25 % → rojo → "⚠ Regar pronto"
  - 25–50 % → ámbar → "Moderado"
  - ≥ 50 % → verde → "✓ Bien hidratada"

#### Columna derecha — Luz solar acumulada

**% del día con sol**
- Qué muestra: de todo el tiempo que la planta ha sido monitoreada hoy, qué porcentaje
  estuvo con luz solar directa.
- Fórmula: `horas_sol / (horas_sol + horas_sombra) × 100`
- Tipo: **calculado desde acumulativos de hoy**.
- Niveles:
  - ≥ 70 % → "Mucha luz directa" (ámbar)
  - 40–70 % → "Exposición moderada" (verde)
  - 15–40 % → "Poca exposición" (azul)
  - < 15 % → "Casi sin luz directa" (violeta)

**Sol acumulado hoy**
- Qué muestra: cuántas horas/minutos ha recibido luz solar directa desde medianoche.
- Tipo: **acumulativo desde medianoche** — se cuenta cuántos registros de `luz_estado`
  tienen valor = 1 (luz encendida) y se multiplica por 2 s.
- Se muestra como "X min" o "Xh Ym".

**Sombra acumulada hoy**
- Qué muestra: cuántas horas/minutos ha estado en sombra desde medianoche.
- Tipo: **acumulativo desde medianoche** — igual que el sol pero con registros `luz_estado = 0`.
- Complementario al sol: sol + sombra = tiempo total monitoreado hoy.

**Indicador de luz (esquina superior derecha de la tarjeta)**
- Muestra si en este momento la planta tiene luz solar o está en sombra.
- Tipo: **tiempo real** — basado en el último valor de `luz_estado` del ESP32.

---

### Sección: Salud de la planta

Tarjeta de análisis que combina varios sensores para dar una evaluación general.
No requiere datos históricos — trabaja con el estado actual.

**Evapotranspiración estimada** (banda superior)
- Qué muestra: cuánta agua pierde la planta por evaporación + transpiración, estimado en mm/día.
- Tipo: **calculado en tiempo real** a partir de la temperatura, humedad del aire y si hay luz.
- Fórmula simplificada: `ET = (temperatura × 0.13 + factor_humedad) × factor_luz`
  - Factor luz: ×1.7 si hay sol, ×0.75 si hay sombra.
  - Factor humedad: aumenta cuando el ambiente es seco (< 80 % humedad).
- Sirve para estimar la urgencia del riego: a mayor ET, el suelo se seca más rápido.
- Niveles: < 1.5 mm/día (bajo), 1.5–3.5 (moderado), > 3.5 (alto).

**Puntaje de salud (0–100)**
- Qué muestra: una puntuación general del bienestar de la planta.
- Tipo: **calculado en tiempo real** — promedio de tres sub-puntuaciones:
  - Temperatura: 100 puntos si está entre 15–28 °C; penaliza extremos.
  - Humedad del suelo: 100 puntos si está entre 40–75 %; penaliza si está muy seco o saturado.
  - Humedad del aire: 100 puntos si está entre 35–70 %; penaliza extremos.
- Etiquetas: Excelente (≥ 80), Buena (60–79), Regular (35–59), Mala (< 35).

**Índice de estrés**
- Derivado directo del puntaje de salud:
  - ≥ 70 → "Saludable" (verde)
  - 40–69 → "Atención" (ámbar)
  - < 40 → "Riesgo de marchitamiento" (rojo)

**Clima del día**
- Etiqueta descriptiva calculada desde temperatura y humedad del aire actuales.
- Ejemplos: "Día ideal para crecimiento", "Día muy caluroso", "Día seco".

**Predicción de riego**
- Qué muestra: una estimación de cuándo la planta necesitará riego.
- Tipo: **calculado en tiempo real** — usa humedad del suelo, temperatura y estado de luz.
- Lógica:
  - Si suelo < 15 % → "Riego urgente"
  - Si suelo < 25 % → "Regar pronto"
  - Si suelo ≥ 25 % → calcula horas hasta llegar a 25 % según velocidad de secado estimada
    (temperatura alta y luz solar aceleran el secado).

---

### Sección: Asistente de cuidado

Sistema de consejos automáticos basado en reglas. Evalúa el estado actual y genera
hasta 4 consejos ordenados por prioridad.

| Prioridad | Color | Ejemplos de consejo |
|---|---|---|
| **Alta** | Rojo | Regar inmediatamente (suelo < 20 %), mover a la sombra (temp > 38 °C), proteger del frío (temp < 7 °C) |
| **Media** | Ámbar | Preparar el riego (suelo < 35 %), temperatura elevada (> 32 °C), humedad ambiental muy baja (< 30 %) |
| **Baja** | Verde | No regar por ahora (suelo > 88 %), acercar a la luz (> 8 h en sombra), alta humedad ambiental (> 85 %) |

- Si no hay ningún problema y la salud es ≥ 80 → muestra "¡Planta en excelentes condiciones!".
- Si salud es 60–79 → "Planta en buen estado general".
- Tipo: **calculado en tiempo real** desde el estado actual, sin histórico.

---

### Sección: Condiciones ambientales

Dos tarjetas con gauges semicirculares (arcos SVG), una para temperatura y otra para
humedad del aire. Son visualizaciones más detalladas de los mismos valores del Estado actual.

**Temperatura**
- Rango visual: 0 °C a 50 °C.
- Zonas de color:
  - Azul frío (< 15 °C)
  - Verde ideal (15–30 °C)
  - Ámbar caliente (30–38 °C)
  - Rojo crítico (> 38 °C)
- El arco, el valor, el icono y el borde de la tarjeta cambian de color según la zona activa.
- Tipo: **tiempo real**.

**Humedad del aire**
- Rango visual: 0 % a 100 %.
- Zonas de color:
  - Rojo muy seco (< 30 %)
  - Ámbar bajo (30–50 %)
  - Verde ideal (50–80 %)
  - Azul húmedo (> 80 %)
- Tipo: **tiempo real**.

---

### Sección: Resumen de hoy

Tabla de estadísticas del día actual (desde medianoche hasta ahora) para tres sensores.

| Sensor | Mín | Prom | Máx |
|---|---|---|---|
| Temperatura | °C mínima del día | °C promedio | °C máxima |
| Humedad del aire | % mínimo | % promedio | % máximo |
| Humedad del suelo | % mínimo convertido | % promedio | % máximo |

- Tipo: **acumulativo desde medianoche** — se calcula con una función de agregación SQL
  (`get_plant_today_stats`) que corre directamente en Supabase, evitando traer miles de filas.
- Se actualiza cada 30 segundos (no en tiempo real, ya que las estadísticas no cambian rápido).
- La humedad del suelo convierte los valores RAW a porcentaje antes de mostrarlos.

---

## Página de gráficas — `/plantas/graficas`

Visualización histórica de todos los sensores. Se puede seleccionar el rango de tiempo
con los botones en la parte superior.

### Modos de visualización

| Modo | Datos mostrados | Actualización |
|---|---|---|
| **Tiempo real** | Últimos 50 registros en BD (≈ últimos 100 s) | Cada 5 s + Realtime (instantáneo con cada lectura) |
| **Última hora** | Todos los registros de la última hora | Cada 30 s |
| **Últimas 6h** | Todos los registros de las últimas 6 horas | Cada 30 s |
| **Últimas 24h** | Todos los registros de las últimas 24 horas | Cada 30 s |

En modos históricos (1h, 6h, 24h), si hay más de 150 puntos, se aplica **downsample**
automático para mantener la gráfica fluida (se conserva 1 de cada N puntos).

### Sección: Ambiente

| Gráfica | Sensor | Unidad | Descripción |
|---|---|---|---|
| **Temperatura** | temperatura | °C | Temperatura del aire en tiempo real/histórico |
| **Humedad del aire** | humedad_aire | % | Humedad relativa del ambiente |
| **Humedad del suelo** | humedad_suelo | % | Valor RAW convertido a porcentaje (inverso) |
| **Sol acumulado** | horas_sol | min | Horas × 60 — cada punto es el acumulado hasta ese momento |

### Sección: Sombra y frío

| Gráfica | Sensor | Unidad | Descripción |
|---|---|---|---|
| **Sombra acumulada** | horas_sombra | min | Tiempo en sombra acumulado hasta cada instante |
| **Tiempo en frío (< 7 °C)** | horas_frio | min | Tiempo con temperatura bajo 7 °C acumulado |

> Las gráficas de sol, sombra y frío muestran el valor acumulado publicado por el ESP32
> en cada momento — son series crecientes a lo largo del día. En tiempo real (últimos 50
> registros) esto se ve como una línea que sube gradualmente.

---

## Resumen: tipo de dato por variable

| Variable | Fuente | Tipo | Reinicio |
|---|---|---|---|
| Temperatura | ESP32 → DHT22 | Tiempo real | — |
| Humedad del aire | ESP32 → DHT22 | Tiempo real | — |
| Estado de luz | ESP32 → LDR/fotodiodo | Tiempo real | — |
| Humedad del suelo | ESP32 → sensor capacitivo | Tiempo real | — |
| Horas de sol | Supabase (conteo BD) | Acumulativo diario | Medianoche (automático) |
| Horas de sombra | Supabase (conteo BD) | Acumulativo diario | Medianoche (automático) |
| Horas de frío | Supabase (conteo BD) | Acumulativo diario | Medianoche (automático) |
| Puntaje de salud | Frontend (cálculo) | Derivado en tiempo real | — |
| Evapotranspiración | Frontend (cálculo) | Derivado en tiempo real | — |
| Predicción de riego | Frontend (cálculo) | Derivado en tiempo real | — |
| Resumen de hoy (min/prom/máx) | Supabase (agregación SQL) | Acumulativo diario | Medianoche (automático) |
