import SensorChart from '@/components/SensorChart';

export const metadata = {
  title: 'Gráficas — Domótica IoT',
};

const CHARTS = [
  { sensorType: 'temperatura' as const, label: 'Temperatura', color: '#f97316', unit: ' °C' },
  { sensorType: 'humedad'     as const, label: 'Humedad',     color: '#3b82f6', unit: ' %'  },
  { sensorType: 'gas'         as const, label: 'Gas / Humo',  color: '#ef4444', unit: ''    },
  { sensorType: 'luz'         as const, label: 'Luz (LDR)',   color: '#eab308', unit: ''    },
];

export default function GraficasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gráficas Históricas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Últimas 50 lecturas por sensor · se actualizan en tiempo real
        </p>
      </div>

      {/* Habitación 1 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-700">Habitación 1</h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHARTS.map((c) => (
            <SensorChart key={c.sensorType} habitacion={1} {...c} />
          ))}
        </div>
      </section>

      {/* Habitación 2 */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-700">Habitación 2</h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHARTS.map((c) => (
            <SensorChart key={c.sensorType} habitacion={2} {...c} />
          ))}
        </div>
      </section>
    </div>
  );
}
