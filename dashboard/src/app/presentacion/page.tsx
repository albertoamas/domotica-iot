'use client';

import Link from 'next/link';
import {
  Wifi, Thermometer, Droplets, Flame, Sun,
  Lightbulb, BarChart2, Bell, FileText, Database,
  Server, Globe, Cpu, ArrowDown, ChevronRight,
  RefreshCw, Home,
} from 'lucide-react';

/* ─── datos ─── */

const SENSORES = [
  { icon: Thermometer, color: '#f97316', bg: '#fff7ed', label: 'Temperatura',    desc: 'DHT11 — temperatura del ambiente en °C' },
  { icon: Droplets,    color: '#3b82f6', bg: '#eff6ff', label: 'Humedad del aire',desc: 'DHT11 — humedad relativa del aire en %' },
  { icon: Flame,       color: '#ef4444', bg: '#fef2f2', label: 'Gas / Humo',     desc: 'MQ-2 — detección de gas y humo (valor analógico)' },
  { icon: Sun,         color: '#ca8a04', bg: '#fefce8', label: 'Luz ambiental',  desc: 'LDR — presencia de luz (oscuro / con luz)' },
  { icon: Lightbulb,   color: '#7c3aed', bg: '#f5f3ff', label: 'LED Hab. 1',     desc: 'Actuador — controlable ON/OFF desde el dashboard' },
  { icon: Lightbulb,   color: '#059669', bg: '#f0fdf4', label: 'LED Hab. 2',     desc: 'Actuador — controlable ON/OFF desde el dashboard' },
];

const FEATURES = [
  { icon: RefreshCw, color: '#2563eb', title: 'Tiempo real',         desc: 'Lecturas cada 2 s · Realtime Supabase + polling de respaldo cada 3 s.' },
  { icon: Bell,      color: '#ef4444', title: 'Alertas de gas',      desc: 'Banner visual + push notification cuando gas > 3 000. Registro con inicio, fin y valor máximo.' },
  { icon: BarChart2, color: '#8b5cf6', title: 'Gráficas históricas', desc: '50 pts en vivo · 1 h · 6 h · 24 h — una gráfica por sensor por habitación.' },
  { icon: FileText,  color: '#059669', title: 'Historial + Export',  desc: 'Tabla paginada con filtros. Exportación a PDF y CSV.' },
  { icon: Lightbulb, color: '#ca8a04', title: 'Control de LEDs',     desc: 'Toggle ON/OFF desde el navegador. Estado persistido en BD — no se pierde al recargar.' },
  { icon: Flame,     color: '#f97316', title: 'Eventos de gas',      desc: 'Página con cada alerta: duración, valor máx, activa o resuelta. Generadas por trigger SQL.' },
];

const FLOW = [
  { icon: Cpu,      label: 'ESP32 ×2',       sub: 'publica cada 2 s',      color: '#6366f1' },
  { icon: Wifi,     label: 'HiveMQ Cloud',   sub: 'MQTT / TLS 8883',       color: '#f97316' },
  { icon: Server,   label: 'Bridge Node.js', sub: 'suscribe + guarda',     color: '#10b981' },
  { icon: Database, label: 'Supabase',       sub: 'PostgreSQL + Realtime', color: '#3b82f6' },
  { icon: Globe,    label: 'Dashboard',      sub: 'Next.js en Vercel',     color: '#8b5cf6' },
];

const STACK = [
  { category: 'Hardware',     color: '#6366f1', items: ['ESP32 DevKit ×2', 'DHT11', 'MQ-2', 'LDR', 'LED'] },
  { category: 'Mensajería',   color: '#f97316', items: ['HiveMQ Cloud', 'MQTT / TLS 8883', 'QoS 1'] },
  { category: 'Backend',      color: '#10b981', items: ['Node.js + TypeScript', 'Railway', 'mqtt npm package'] },
  { category: 'Base de datos',color: '#3b82f6', items: ['Supabase PostgreSQL', 'Realtime', 'Triggers SQL'] },
  { category: 'Frontend',     color: '#8b5cf6', items: ['Next.js 15', 'Tailwind CSS', 'Recharts', 'Vercel'] },
];

/* ─── página ─── */

export default function PresentacionPage() {
  return (
    <>
      {/* Nav fija */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Wifi size={16} className="text-blue-600" />
            Domótica IoT
          </div>
          <Link
            href="/domotica"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Ver dashboard <ChevronRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Contenedor scroll-snap */}
      <div
        className="h-screen overflow-y-scroll"
        style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
      >

        {/* ══ 1. HERO ══ */}
        <section
          className="h-screen flex flex-col items-center justify-center px-4 bg-white relative overflow-hidden"
          style={{ scrollSnapAlign: 'start' }}
        >
          {/* Fondo sutil */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(59,130,246,0.07),transparent)]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(#94a3b8 1px,transparent 1px),linear-gradient(90deg,#94a3b8 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

          <div className="relative z-10 text-center max-w-3xl pt-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Internet de las Cosas · 7° Semestre
            </div>

            <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-5 text-slate-900 leading-none">
              Domótica
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                IoT
              </span>
            </h1>

            <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Monitoreo y control de 2 habitaciones con sensores físicos,
              arquitectura cloud completa y dashboard en tiempo real.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { n: '2',  label: 'Habitaciones' },
                { n: '6',  label: 'Sensores' },
                { n: '2 s',label: 'Frecuencia' },
                { n: '5',  label: 'Tecnologías' },
              ].map(({ n, label }) => (
                <div key={label} className="flex flex-col items-center px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-3xl font-black text-blue-600">{n}</span>
                  <span className="text-xs text-slate-400 mt-0.5">{label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/domotica"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-200"
            >
              Abrir dashboard en vivo <ChevronRight size={16} />
            </Link>
          </div>

          {/* Indicador scroll */}
          <div className="absolute bottom-8 flex flex-col items-center gap-1.5 text-slate-400 animate-bounce">
            <span className="text-xs font-medium">Siguiente</span>
            <ArrowDown size={16} />
          </div>
        </section>

        {/* ══ 2. ARQUITECTURA ══ */}
        <section
          className="h-screen flex flex-col items-center justify-center px-4 bg-slate-50"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="w-full max-w-5xl pt-14">
            <SectionLabel>Arquitectura</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Cómo fluyen los datos</h2>
            <p className="text-slate-500 mb-10 max-w-lg">
              Cada lectura del ESP32 atraviesa 5 capas antes de llegar al navegador.
              La comunicación es bidireccional — los comandos de LED recorren el camino inverso.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-1">
              {FLOW.map(({ icon: Icon, label, sub, color }, i) => (
                <div key={label} className="flex sm:flex-col items-center sm:items-start flex-1 w-full">
                  <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-4 rounded-xl w-full"
                    style={{ background: `${color}0d`, border: `1.5px solid ${color}30` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}18` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  </div>
                  {i < FLOW.length - 1 && (
                    <ChevronRight size={16} className="text-slate-300 shrink-0 mx-0.5 rotate-90 sm:rotate-0" />
                  )}
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs text-slate-400 text-center">
              ↕ Bidireccional — Dashboard → Vercel API → MQTT → ESP32 para control de LEDs
            </p>
          </div>
        </section>

        {/* ══ 3. HARDWARE ══ */}
        <section
          className="h-screen flex flex-col items-center justify-center px-4 bg-white"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="w-full max-w-4xl pt-14">
            <SectionLabel>Hardware</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Componentes físicos</h2>
            <p className="text-slate-500 mb-10 max-w-lg">
              Dos ESP32 idénticos, uno por habitación, cada uno con el mismo set de sensores.
            </p>

            {/* ESP32 highlight */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-200 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-100">
                <Cpu size={22} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  ESP32 DevKit v1
                  <span className="ml-2 text-indigo-600 font-semibold text-sm">×2 unidades</span>
                </p>
                <p className="text-sm text-slate-500">
                  WiFi integrado · publica cada 2 s · reconexión automática al reinicio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SENSORES.map(({ icon: Icon, color, bg, label, desc }) => (
                <div key={label} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200"
                  style={{ background: bg }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/70">
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 4. FUNCIONALIDADES ══ */}
        <section
          className="h-screen flex flex-col items-center justify-center px-4 bg-slate-50"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="w-full max-w-5xl pt-14">
            <SectionLabel>Dashboard</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Funcionalidades</h2>
            <p className="text-slate-500 mb-8 max-w-lg">
              Accesible desde cualquier navegador. Desplegado en Vercel con CI/CD automático.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${color}12` }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <p className="font-bold text-slate-800 text-sm mb-1">{title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 5. STACK ══ */}
        <section
          className="h-screen flex flex-col items-center justify-center px-4 bg-white"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="w-full max-w-5xl pt-14">
            <SectionLabel>Tecnologías</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Stack completo</h2>
            <p className="text-slate-500 mb-8 max-w-lg">
              Servicios cloud gestionados en todas las capas — sin servidores propios.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {STACK.map(({ category, color, items }) => (
                <div key={category} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-none">{category}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item) => (
                      <li key={item} className="text-xs text-slate-700 flex items-start gap-1">
                        <ChevronRight size={10} className="mt-0.5 shrink-0" style={{ color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 6. CTA ══ */}
        <section
          className="h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

          <div className="relative z-10 text-center max-w-xl pt-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-semibold mb-8">
              <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
              Sistema activo en producción
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ver el sistema<br />en vivo
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              El dashboard muestra datos reales del ESP32 actualizándose en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/domotica"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                <Home size={16} /> Abrir dashboard
              </Link>
              <Link
                href="/domotica/graficas"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/15 border border-white/30 text-white font-semibold hover:bg-white/25 transition-all"
              >
                <BarChart2 size={16} /> Ver gráficas
              </Link>
            </div>
          </div>

          <p className="absolute bottom-6 text-blue-200 text-xs">
            Domótica IoT · ESP32 + HiveMQ + Supabase + Next.js · Internet de las Cosas — 7° Semestre
          </p>
        </section>

      </div>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      {children}
    </div>
  );
}
