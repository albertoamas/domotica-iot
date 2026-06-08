'use client';

import { Sun, Moon, Leaf, Droplets, Thermometer, Wind, Snowflake } from 'lucide-react';
import type { PlantState } from '@/lib/plantTypes';
import { sueloPercent, formatHoras, calcSolPercent, calcSolLabel } from '@/lib/plantTypes';
import { PT, SENSOR } from '@/lib/plantTheme';

interface PlantCardProps { state: PlantState }

export default function PlantCard({ state }: PlantCardProps) {
  const hayLuz   = state.luz_estado === 1;
  const sueloPct = sueloPercent(state.humedad_suelo);

  const sueloColor = sueloPct === null ? PT.green
    : sueloPct < 25 ? '#d9534f'
    : sueloPct < 50 ? SENSOR.sun
    : SENSOR.soil;

  const horasSol    = formatHoras(state.horas_sol);
  const horasSombra = formatHoras(state.horas_sombra);
  const horasFrio   = formatHoras(state.horas_frio);
  const solPct      = calcSolPercent(state.horas_sol, state.horas_sombra);
  const solInfo     = solPct !== null ? calcSolLabel(solPct) : null;
  const lastUpdate  = state.lastUpdate
    ? new Date(state.lastUpdate).toLocaleTimeString('es-ES') : null;

  return (
    <div className="w-full rounded-3xl p-6"
      style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadow }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${PT.grass} 0%, ${PT.greenDeep} 100%)`,
              boxShadow: '0 2px 8px rgba(63,107,30,0.35)',
            }}>
            <Leaf size={21} style={{ color: '#fff' }} strokeWidth={2.3} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: PT.textHi }}>Estado actual</h2>
            {lastUpdate && (
              <p className="text-xs flex items-center gap-1" style={{ color: PT.textDim }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: PT.green }} />
                Actualizado: {lastUpdate}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold"
          style={hayLuz
            ? { background: 'rgba(224,169,46,0.14)', color: '#b07d18', border: '1px solid rgba(224,169,46,0.4)' }
            : { background: 'rgba(123,115,201,0.14)', color: SENSOR.shade, border: '1px solid rgba(123,115,201,0.4)' }}>
          {hayLuz ? <Sun size={15} /> : <Moon size={15} />}
          {hayLuz ? 'Con luz solar' : 'En sombra'}
        </div>
      </div>

      {/* ── Grid de métricas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* ── Columna 1 — Temperatura, Humedad aire, Frío ── */}
        <div className="flex flex-col gap-3">
          {/* Temperatura */}
          <Tile>
            <TileHead icon={<Thermometer size={16} />} color={SENSOR.temp} label="Temperatura" />
            <div className="flex items-end gap-1 mt-1">
              <span className="text-4xl font-extrabold" style={{ color: SENSOR.temp }}>
                {state.temperatura !== null ? state.temperatura : '—'}
              </span>
              <span className="text-lg font-bold mb-0.5" style={{ color: SENSOR.temp }}>°C</span>
            </div>
          </Tile>

          {/* Humedad aire */}
          <Tile>
            <TileHead icon={<Wind size={16} />} color={SENSOR.hum} label="Humedad aire" />
            <div className="flex items-end gap-1 mt-1">
              <span className="text-4xl font-extrabold" style={{ color: SENSOR.hum }}>
                {state.humedad_aire !== null ? state.humedad_aire : '—'}
              </span>
              <span className="text-lg font-bold mb-0.5" style={{ color: SENSOR.hum }}>%</span>
            </div>
          </Tile>

          {/* Horas frío */}
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: PT.cardRaise, border: `1px solid ${PT.borderDim}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(110,134,201,0.14)' }}>
              <Snowflake size={17} style={{ color: SENSOR.cold }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PT.textMed }}>Horas frío (&lt;7°C)</p>
              <p className="text-lg font-extrabold" style={{ color: SENSOR.cold }}>{horasFrio}</p>
            </div>
          </div>
        </div>

        {/* ── Columna 2 — Humedad del suelo (destacada) ── */}
        <div className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: `linear-gradient(160deg, ${PT.greenSoft} 0%, ${PT.cardRaise} 100%)`,
            border: `1px solid ${sueloColor}30`,
          }}>
          <TileHead icon={<Droplets size={16} />} color={sueloColor} label="Humedad del suelo" />

          {/* Valor grande */}
          <div className="flex items-end gap-1">
            <span className="text-6xl font-black leading-none" style={{ color: sueloColor }}>
              {sueloPct !== null ? sueloPct : '—'}
            </span>
            {sueloPct !== null && (
              <span className="text-2xl font-bold mb-2" style={{ color: sueloColor }}>%</span>
            )}
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="h-3.5 rounded-full overflow-hidden" style={{ background: PT.cardSunk }}>
              {sueloPct !== null && (
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${sueloPct}%`,
                    background: `linear-gradient(90deg, ${sueloColor}cc, ${sueloColor})`,
                  }} />
              )}
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: PT.textDim }}>
              <span>Seco</span>
              <span className="font-semibold" style={{ color: sueloColor }}>
                {sueloPct !== null && sueloPct < 25 ? '⚠ Regar pronto'
                  : sueloPct !== null && sueloPct >= 50 ? '✓ Bien hidratada'
                  : 'Moderado'}
              </span>
              <span>Húmedo</span>
            </div>
          </div>

          {/* Raw value */}
          <div className="text-xs mt-auto pt-2 border-t flex items-center justify-between"
            style={{ color: PT.textDim, borderColor: PT.borderDim }}>
            <span>Sensor RAW</span>
            <span className="font-mono font-semibold" style={{ color: PT.textMed }}>
              {state.humedad_suelo ?? '—'}
            </span>
          </div>
        </div>

        {/* ── Columna 3 — Sol, sombra, % solar ── */}
        <div className="flex flex-col gap-3">

          {/* % del tiempo con sol */}
          {solInfo && solPct !== null && (
            <div className="rounded-2xl p-4"
              style={{ background: PT.cardRaise, border: `1px solid ${solInfo.color}30` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: PT.textMed }}>% del día con sol</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${solInfo.color}20`, color: solInfo.color }}>
                  {solInfo.label}
                </span>
              </div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-extrabold" style={{ color: solInfo.color }}>{solPct}</span>
                <span className="text-base font-bold mb-0.5" style={{ color: solInfo.color }}>%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: PT.cardSunk }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${solPct}%`, background: solInfo.color }} />
              </div>
            </div>
          )}

          {/* Horas sol */}
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(224,169,46,0.08)', border: '1px solid rgba(224,169,46,0.28)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(224,169,46,0.16)' }}>
              <Sun size={17} style={{ color: SENSOR.sun }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PT.textMed }}>Sol acumulado hoy</p>
              <p className="text-2xl font-extrabold" style={{ color: SENSOR.sun }}>{horasSol}</p>
            </div>
          </div>

          {/* Horas sombra */}
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'rgba(123,115,201,0.08)', border: '1px solid rgba(123,115,201,0.28)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(123,115,201,0.16)' }}>
              <Moon size={17} style={{ color: SENSOR.shade }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PT.textMed }}>Sombra acumulada hoy</p>
              <p className="text-2xl font-extrabold" style={{ color: SENSOR.shade }}>{horasSombra}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componentes ──
function Tile({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: PT.cardRaise, border: `1px solid ${PT.borderDim}` }}>
      {children}
    </div>
  );
}

function TileHead({ icon, color, label }: { icon: React.ReactNode; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color }}>{icon}</span>
      <span className="text-xs font-semibold" style={{ color: PT.textMed }}>{label}</span>
    </div>
  );
}
