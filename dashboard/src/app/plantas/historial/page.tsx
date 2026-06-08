'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, Sun, Moon, Snowflake } from 'lucide-react';
import { fetchPlantHistoryTable, fetchPlantTotalHours } from '@/lib/plantSupabase';
import { sueloPercent, formatHoras } from '@/lib/plantTypes';
import type { PlantReading, PlantSensorType } from '@/lib/plantTypes';
import { PT, SENSOR } from '@/lib/plantTheme';

const PAGE_SIZE = 50;

const SENSOR_META: Record<PlantSensorType, { label: string; color: string; format: (v: number) => string }> = {
  temperatura:   { label: 'Temperatura',       color: SENSOR.temp,  format: (v) => `${v} °C` },
  humedad_aire:  { label: 'Humedad del aire',   color: SENSOR.hum,   format: (v) => `${v} %` },
  humedad_suelo: { label: 'Humedad del suelo',  color: SENSOR.soil,  format: (v) => { const p = sueloPercent(v); return p !== null ? `${p} %` : `${v}`; } },
  luz_estado:    { label: 'Luz',                color: SENSOR.sun,   format: (v) => v === 1 ? 'Con luz' : 'Sombra' },
  horas_sol:     { label: 'Horas de sol',       color: SENSOR.sun,   format: (v) => formatHoras(v) },
  horas_sombra:  { label: 'Horas de sombra',    color: SENSOR.shade, format: (v) => formatHoras(v) },
  horas_frio:    { label: 'Horas de frío <7°C', color: SENSOR.cold,  format: (v) => formatHoras(v) },
};

const SENSOR_TYPES = Object.keys(SENSOR_META) as PlantSensorType[];

export default function PlantHistorialPage() {
  const [rows, setRows]       = useState<PlantReading[]>([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(0);
  const [loading, setLoading] = useState(true);

  const [sensorType, setSensorType] = useState<PlantSensorType | ''>('');
  const [from, setFrom] = useState('');
  const [to, setTo]     = useState('');

  // Totales acumulados desde el inicio
  const [totals, setTotals] = useState<{ horas_sol: number; horas_sombra: number; horas_frio: number } | null>(null);

  // Cargar totales una sola vez al montar
  useEffect(() => {
    fetchPlantTotalHours().then(setTotals).catch(console.error);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await fetchPlantHistoryTable({
        sensor_type: sensorType || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to:   to   ? new Date(to + 'T23:59:59').toISOString() : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(data);
      setTotal(count);
    } catch (err) {
      console.error('[PlantHistorial]', err);
    } finally {
      setLoading(false);
    }
  }, [sensorType, from, to, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [sensorType, from, to]);

  /* ── Export CSV ── */
  function exportCsv() {
    const header = 'id,fecha,sensor,valor\n';
    const body = rows.map((r) => {
      const m = SENSOR_META[r.sensor_type];
      return `${r.id},"${new Date(r.created_at).toLocaleString('es-ES')}",${m.label},"${m.format(r.valor)}"`;
    }).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_planta_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Export PDF ── */
  async function exportPdf() {
    const { default: jsPDF }     = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Historial Plant Monitor', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}  ·  ${total} registros totales`, 14, 26);
    autoTable(doc, {
      startY: 32,
      head: [['Fecha / Hora', 'Sensor', 'Valor']],
      body: rows.map((r) => {
        const m = SENSOR_META[r.sensor_type];
        return [new Date(r.created_at).toLocaleString('es-ES'), m.label, m.format(r.valor)];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [92, 138, 46] },
      alternateRowStyles: { fillColor: [251, 247, 240] },
    });
    doc.save(`historial_planta_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* ── Cabecera ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: PT.textNav }}>
          Historial de lecturas
        </h1>
        <p className="text-sm mt-1" style={{ color: PT.textNavDim }}>
          Registro completo desde el inicio del monitoreo
        </p>
      </div>

      {/* ── Acumulado total desde el inicio ── */}
      <div className="rounded-3xl p-5 flex flex-col gap-4"
        style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadow }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: PT.textDim }}>
            Acumulado total — desde el inicio del monitoreo
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: PT.greenSoft, color: PT.greenDeep }}>
            Sin reinicio
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Sol */}
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(224,169,46,0.08)', border: '1px solid rgba(224,169,46,0.28)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(224,169,46,0.16)' }}>
              <Sun size={18} style={{ color: SENSOR.sun }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PT.textMed }}>Sol acumulado total</p>
              <p className="text-2xl font-extrabold" style={{ color: SENSOR.sun }}>
                {totals ? formatHoras(totals.horas_sol) : '—'}
              </p>
            </div>
          </div>

          {/* Sombra */}
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(123,115,201,0.08)', border: '1px solid rgba(123,115,201,0.28)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(123,115,201,0.16)' }}>
              <Moon size={18} style={{ color: SENSOR.shade }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PT.textMed }}>Sombra acumulada total</p>
              <p className="text-2xl font-extrabold" style={{ color: SENSOR.shade }}>
                {totals ? formatHoras(totals.horas_sombra) : '—'}
              </p>
            </div>
          </div>

          {/* Frío */}
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(110,134,201,0.08)', border: '1px solid rgba(110,134,201,0.28)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(110,134,201,0.16)' }}>
              <Snowflake size={18} style={{ color: SENSOR.cold }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PT.textMed }}>Tiempo en frío total</p>
              <p className="text-2xl font-extrabold" style={{ color: SENSOR.cold }}>
                {totals ? formatHoras(totals.horas_frio) : '—'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs" style={{ color: PT.textDim }}>
          Calculado contando cada lectura × 2 s desde el primer registro en base de datos.
          No se reinicia cuando el ESP32 se reinicia ni a medianoche.
        </p>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-wrap gap-3 p-4 rounded-2xl"
        style={{ background: PT.card, border: `1px solid ${PT.border}`, boxShadow: PT.shadowSm }}>

        <select
          value={sensorType}
          onChange={(e) => setSensorType(e.target.value as PlantSensorType | '')}
          className="text-sm rounded-xl px-3 py-2 font-medium focus:outline-none"
          style={{ background: PT.cardRaise, border: `1px solid ${PT.border}`, color: PT.textHi }}
        >
          <option value="">Todos los sensores</option>
          {SENSOR_TYPES.map((s) => (
            <option key={s} value={s}>{SENSOR_META[s].label}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: PT.textMed }}>Desde</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 focus:outline-none"
            style={{ background: PT.cardRaise, border: `1px solid ${PT.border}`, color: PT.textHi }} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: PT.textMed }}>Hasta</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="text-sm rounded-xl px-3 py-2 focus:outline-none"
            style={{ background: PT.cardRaise, border: `1px solid ${PT.border}`, color: PT.textHi }} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportPdf} disabled={rows.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl disabled:opacity-40"
            style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={exportCsv} disabled={rows.length === 0}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl disabled:opacity-40"
            style={{ color: PT.greenDeep, background: PT.greenSoft, border: `1px solid ${PT.green}55` }}>
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${PT.border}`, boxShadow: PT.shadowSm }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: PT.cardRaise, borderBottom: `1px solid ${PT.border}` }}>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: PT.textMed }}>Fecha / Hora</th>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: PT.textMed }}>Sensor</th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: PT.textMed }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-16" style={{ color: PT.textDim, background: PT.card }}>Cargando...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-16" style={{ color: PT.textDim, background: PT.card }}>Sin resultados para los filtros seleccionados</td></tr>
            ) : (
              rows.map((r, i) => {
                const m = SENSOR_META[r.sensor_type];
                return (
                  <tr key={r.id}
                    style={{ background: i % 2 === 0 ? PT.card : PT.cardRaise, borderBottom: `1px solid ${PT.borderDim}` }}>
                    <td className="px-4 py-2.5" style={{ color: PT.textMed }}>
                      {new Date(r.created_at).toLocaleString('es-ES')}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                        <span style={{ color: PT.textHi }}>{m.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold" style={{ color: m.color }}>
                      {m.format(r.valor)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3"
            style={{ background: PT.cardRaise, borderTop: `1px solid ${PT.border}` }}>
            <span className="text-xs" style={{ color: PT.textMed }}>{total} registros totales</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="p-1.5 rounded-lg disabled:opacity-40"
                style={{ background: PT.card, border: `1px solid ${PT.border}` }}>
                <ChevronLeft size={15} style={{ color: PT.textMed }} />
              </button>
              <span className="text-xs font-semibold" style={{ color: PT.textHi }}>{page + 1} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg disabled:opacity-40"
                style={{ background: PT.card, border: `1px solid ${PT.border}` }}>
                <ChevronRight size={15} style={{ color: PT.textMed }} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
