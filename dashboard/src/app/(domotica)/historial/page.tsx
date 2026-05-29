import HistoryTable from '@/components/HistoryTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Historial — Domótica IoT',
};

export default function HistorialPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Historial de Lecturas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Filtra por habitación, sensor y rango de fechas. Exporta a CSV.
        </p>
      </div>
      <HistoryTable />
    </div>
  );
}
