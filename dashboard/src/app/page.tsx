import Link from 'next/link';
import { Wifi, Leaf } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">IoT Platform</h1>
        <p className="text-gray-500 mt-2 text-sm">Selecciona un proyecto para continuar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
        {/* Domótica */}
        <Link href="/domotica"
          className="group rounded-2xl p-7 flex flex-col gap-4 border border-gray-800 bg-gray-900 hover:border-blue-700 hover:bg-gray-800 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center">
            <Wifi size={24} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              Domótica IoT
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              2 habitaciones · temperatura, humedad, gas, luz · control de LEDs
            </p>
          </div>
          <span className="text-xs text-blue-500 font-medium">/domotica →</span>
        </Link>

        {/* Plantas */}
        <Link href="/plantas"
          className="group rounded-2xl p-7 flex flex-col gap-4 border border-gray-800 bg-gray-900 hover:border-green-700 hover:bg-gray-800 transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-950 border border-green-800 flex items-center justify-center">
            <Leaf size={24} className="text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-green-300 transition-colors">
              Plant Monitor
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Temperatura, humedad del suelo, horas de sol acumuladas
            </p>
          </div>
          <span className="text-xs text-green-500 font-medium">/plantas →</span>
        </Link>
      </div>
    </div>
  );
}
