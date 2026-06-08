'use client';

import { useEffect, useState } from 'react';
import { Flame, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { fetchGasAlerts } from '@/lib/supabase';
import type { GasAlertEvent } from '@/lib/types';
import { GAS_ALERT_THRESHOLD } from '@/lib/types';

type FilterHab = 'all' | 1 | 2;
const PAGE_SIZE = 20;

function formatDuration(start: string, end: string | null): string {
  const endTime = end ? new Date(end) : new Date();
  const totalSecs = Math.max(0, Math.floor((endTime.getTime() - new Date(start).getTime()) / 1000));
  if (totalSecs < 60) return `${totalSecs} s`;
  const mins = Math.floor(totalSecs / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

function AlertRow({ ev }: { ev: GasAlertEvent }) {
  const active = ev.ended_at === null;
  const dur = formatDuration(ev.started_at, ev.ended_at);

  return (
    <div className={`flex items-center gap-4 rounded-xl px-5 py-4 border shadow-sm transition-colors ${
      active ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
    }`}>

      {/* Icono */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
        active ? 'bg-red-100' : 'bg-gray-100'
      }`}>
        {active
          ? <Flame size={20} className="text-red-500" />
          : <CheckCircle size={20} className="text-gray-400" />
        }
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            ev.habitacion === 1 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
          }`}>
            Hab. {ev.habitacion}
          </span>

          {active ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Activa
            </span>
          ) : (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              Resuelta
            </span>
          )}

          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            {dur}
          </span>
        </div>

        <div className="text-xs text-gray-500 space-y-0.5">
          <div>
            <span className="font-medium text-gray-600">Inicio:</span>{' '}
            {new Date(ev.started_at).toLocaleString('es-ES', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit',
            })}
          </div>
          {ev.ended_at && (
            <div>
              <span className="font-medium text-gray-600">Fin:</span>{' '}
              {new Date(ev.ended_at).toLocaleString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Valor máximo */}
      <div className="text-right shrink-0">
        <div className={`text-2xl font-black leading-none ${
          active ? 'text-red-600' : 'text-gray-600'
        }`}>
          {ev.max_valor}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">valor máx</div>
      </div>
    </div>
  );
}

export default function EventosPage() {
  const [events, setEvents] = useState<GasAlertEvent[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hab, setHab] = useState<FilterHab>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(0); }, [hab]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await fetchGasAlerts({
          habitacion: hab === 'all' ? undefined : hab,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!cancelled) { setEvents(result.data); setCount(result.count); }
      } catch (err) {
        console.error('[Eventos]', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 10_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [hab, page]);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const activeAlerts = events.filter((e) => e.ended_at === null);

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Eventos de Gas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro automático · umbral {GAS_ALERT_THRESHOLD} · actualización cada 10 s
          </p>
        </div>

        {activeAlerts.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full self-start">
            <AlertTriangle size={15} className="text-red-500" />
            <span className="text-sm font-bold text-red-700">
              {activeAlerts.length} alerta{activeAlerts.length > 1 ? 's' : ''} activa{activeAlerts.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center flex-wrap gap-2">
        {(['all', 1, 2] as FilterHab[]).map((h) => (
          <button
            key={h}
            onClick={() => setHab(h)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              hab === h
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {h === 'all' ? 'Todas las habitaciones' : `Habitación ${h}`}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">
          {count} evento{count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista */}
      {loading && events.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Cargando eventos...</div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <CheckCircle size={48} strokeWidth={1.2} className="text-green-300" />
          <p className="text-gray-400 text-sm">No hay alertas registradas</p>
          <p className="text-gray-300 text-xs">Las alertas aparecen automáticamente cuando el gas supera {GAS_ALERT_THRESHOLD}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {events.map((ev) => <AlertRow key={ev.id} ev={ev} />)}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
