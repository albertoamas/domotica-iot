'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { fetchHistory } from '@/lib/supabase';
import type { SensorReading, SensorType } from '@/lib/types';

const PAGE_SIZE = 50;

const SENSOR_LABELS: Record<SensorType, string> = {
  temperatura: 'Temperatura',
  humedad: 'Humedad',
  gas: 'Gas / Humo',
  luz: 'Luz',
};

const SENSOR_UNITS: Record<SensorType, string> = {
  temperatura: ' °C',
  humedad: ' %',
  gas: '',
  luz: '',
};

export default function HistoryTable() {
  const [rows, setRows] = useState<SensorReading[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [habitacion, setHabitacion] = useState<'' | '1' | '2'>('');
  const [sensorType, setSensorType] = useState<'' | SensorType>('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await fetchHistory({
        habitacion: habitacion ? (Number(habitacion) as 1 | 2) : undefined,
        sensor_type: sensorType || undefined,
        from: from ? new Date(from).toISOString() : undefined,
        to: to ? new Date(to + 'T23:59:59').toISOString() : undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(data);
      setTotal(count);
    } catch (err) {
      console.error('[HistoryTable] Error:', err);
    } finally {
      setLoading(false);
    }
  }, [habitacion, sensorType, from, to, page]);

  useEffect(() => { load(); }, [load]);

  // Reset page cuando cambian filtros
  useEffect(() => { setPage(0); }, [habitacion, sensorType, from, to]);

  function exportCsv() {
    const header = 'id,fecha,habitacion,sensor,valor\n';
    const body = rows
      .map((r) =>
        `${r.id},"${new Date(r.created_at).toLocaleString('es-ES')}",${r.habitacion},${r.sensor_type},${r.valor}`
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_domotica_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <select
          value={habitacion}
          onChange={(e) => setHabitacion(e.target.value as '' | '1' | '2')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Todas las habitaciones</option>
          <option value="1">Habitación 1</option>
          <option value="2">Habitación 2</option>
        </select>

        <select
          value={sensorType}
          onChange={(e) => setSensorType(e.target.value as '' | SensorType)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Todos los sensores</option>
          {(Object.keys(SENSOR_LABELS) as SensorType[]).map((s) => (
            <option key={s} value={s}>{SENSOR_LABELS[s]}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <label>Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <label>Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <button
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="ml-auto flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40"
        >
          <Download size={15} />
          Exportar CSV
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Fecha / Hora</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Habitación</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Sensor</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  Sin resultados para los filtros seleccionados
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-600">
                    {new Date(r.created_at).toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 font-medium">
                    Hab. {r.habitacion}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {SENSOR_LABELS[r.sensor_type]}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-800">
                    {r.valor}{SENSOR_UNITS[r.sensor_type]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>{total} registros totales</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span>Página {page + 1} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
