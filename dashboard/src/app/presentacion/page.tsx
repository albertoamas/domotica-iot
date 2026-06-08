'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wifi, Thermometer, Droplets, Flame, Sun,
  Lightbulb, BarChart2, Bell, FileText, Database,
  Server, Globe, Cpu, ArrowDown, ChevronRight,
  Shield, Zap, RefreshCw, Home,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const SENSORES = [
  { icon: Thermometer, color: '#f97316', label: 'DHT11', desc: 'Temperatura y humedad del aire' },
  { icon: Flame,       color: '#ef4444', label: 'MQ-2',  desc: 'Detección de gas y humo' },
  { icon: Sun,         color: '#eab308', label: 'LDR',   desc: 'Sensor de luz ambiental' },
  { icon: Lightbulb,   color: '#3b82f6', label: 'LED',   desc: 'Actuador controlable remotamente' },
];

const FEATURES = [
  { icon: Zap,       title: 'Tiempo real',        desc: 'Lecturas cada 2 s · Realtime push desde Supabase · Polling de respaldo cada 3 s' },
  { icon: Bell,      title: 'Alertas de gas',     desc: 'Banner visual + notificación push del navegador cuando gas > 3 000. Registro automático con inicio, fin y valor máximo.' },
  { icon: BarChart2, title: 'Gráficas históricas', desc: 'Cuatro rangos: 50 pts en vivo · 1 h · 6 h · 24 h. Una gráfica por sensor por habitación.' },
  { icon: FileText,  title: 'Historial',          desc: 'Tabla paginada con filtros por habitación, sensor y rango de fechas. Exportación a PDF y CSV.' },
  { icon: Lightbulb, title: 'Control de LEDs',    desc: 'Toggle ON/OFF desde el navegador. El estado persiste en la base de datos — no se pierde al recargar.' },
  { icon: Flame,     title: 'Eventos de gas',     desc: 'Página dedicada que lista cada alerta: duración, valor máximo, activa o resuelta. Generadas por trigger SQL automático.' },
];

const STACK = [
  {
    category: 'Hardware',
    color: '#6366f1',
    items: ['ESP32 DevKit ×2', 'DHT11', 'MQ-2', 'LDR', 'LED'],
  },
  {
    category: 'Mensajería',
    color: '#f97316',
    items: ['HiveMQ Cloud', 'MQTT / TLS 8883', 'QoS 1'],
  },
  {
    category: 'Backend',
    color: '#10b981',
    items: ['Node.js + TypeScript', 'Railway (siempre activo)', 'mqtt npm package'],
  },
  {
    category: 'Base de datos',
    color: '#3b82f6',
    items: ['Supabase PostgreSQL', 'Realtime subscriptions', 'RPC + triggers SQL'],
  },
  {
    category: 'Frontend',
    color: '#8b5cf6',
    items: ['Next.js 15 + TypeScript', 'Tailwind CSS', 'Recharts', 'Vercel'],
  },
];

const FLOW = [
  { icon: Cpu,      label: 'ESP32 ×2',      sub: 'publica cada 2 s',       color: '#6366f1' },
  { icon: Wifi,     label: 'HiveMQ Cloud',  sub: 'broker MQTT / TLS',      color: '#f97316' },
  { icon: Server,   label: 'Bridge Node.js', sub: 'suscribe + guarda',      color: '#10b981' },
  { icon: Database, label: 'Supabase',      sub: 'PostgreSQL + Realtime',  color: '#3b82f6' },
  { icon: Globe,    label: 'Dashboard',     sub: 'Next.js en Vercel',      color: '#8b5cf6' },
];

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */

export default function PresentacionPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="bg-slate-950 text-white antialiased">

      {/* ── NAV fija ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur border-b border-white/10 shadow-xl' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Wifi size={16} className="text-blue-400" />
            <span className="text-white">Domótica IoT</span>
          </div>
          <Link
            href="/domotica"
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Ver dashboard <ChevronRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECCIÓN 1 — HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">

        {/* Fondo radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_70%,rgba(99,102,241,0.1),transparent)]" />

        {/* Grid decorativo */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 text-center max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Internet de las Cosas · 7° Semestre
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-5 leading-none">
            <span className="text-white">Domótica</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              IoT
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto">
            Sistema de monitoreo y control de 2 habitaciones con sensores físicos,
            arquitectura cloud y dashboard en tiempo real.
          </p>

          {/* Stats rápidas */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { n: '2',   label: 'Habitaciones' },
              { n: '4',   label: 'Sensores' },
              { n: '2s',  label: 'Frecuencia' },
              { n: '5',   label: 'Tecnologías' },
            ].map(({ n, label }) => (
              <div key={label} className="flex flex-col items-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                <span className="text-3xl font-black text-white">{n}</span>
                <span className="text-xs text-slate-400 mt-0.5">{label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/domotica"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
          >
            Abrir dashboard en vivo <ChevronRight size={16} />
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 text-slate-500 animate-bounce">
          <span className="text-xs">Desplaza</span>
          <ArrowDown size={16} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 2 — ARQUITECTURA
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Arquitectura</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Cómo fluyen los datos
          </h2>
          <p className="text-slate-400 mb-16 max-w-xl">
            Cada lectura del ESP32 viaja por 5 capas antes de aparecer en el navegador.
            La comunicación es bidireccional — los comandos LED recorren el mismo camino en sentido inverso.
          </p>

          {/* Pipeline */}
          <div className="flex flex-col sm:flex-row items-center gap-0">
            {FLOW.map(({ icon: Icon, label, sub, color }, i) => (
              <div key={label} className="flex sm:flex-col items-center sm:items-start flex-1 w-full">
                {/* Bloque */}
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-4 sm:p-5 rounded-2xl w-full"
                  style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}22` }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
                {/* Flecha (no en el último) */}
                {i < FLOW.length - 1 && (
                  <div className="flex sm:flex-row items-center justify-center shrink-0 px-1 sm:px-0 py-1 sm:py-2 self-center">
                    <ChevronRight size={16} className="text-slate-600 rotate-90 sm:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Nota bidireccional */}
          <p className="mt-6 text-xs text-slate-500 text-center">
            ↕ Bidireccional — los comandos ON/OFF del LED recorren el camino inverso: Dashboard → Vercel API → MQTT → ESP32
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 3 — HARDWARE
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-slate-900/60">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Hardware</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Componentes físicos</h2>
          <p className="text-slate-400 mb-12 max-w-xl">
            Dos ESP32 idénticos, uno por habitación, cada uno con el mismo set de sensores y un LED controlable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {SENSORES.map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-800/60 border border-white/8 hover:border-white/15 transition-colors">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p className="font-bold text-white">{label}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ESP32 highlight */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-indigo-500/20">
              <Cpu size={22} className="text-indigo-400" />
            </div>
            <div>
              <p className="font-bold text-white">ESP32 DevKit v1 <span className="text-indigo-400 font-normal text-sm">×2 unidades</span></p>
              <p className="text-sm text-slate-400">Microcontrolador con WiFi integrado · publica cada 2 s · se reconecta automáticamente al reiniciarse</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 4 — FUNCIONALIDADES
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Dashboard</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Funcionalidades</h2>
          <p className="text-slate-400 mb-12 max-w-xl">
            El dashboard corre en Vercel y es accesible desde cualquier dispositivo con navegador.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="p-5 rounded-2xl bg-slate-900 border border-white/8 hover:border-blue-500/30 hover:bg-slate-800/80 transition-all group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-blue-500/15 group-hover:bg-blue-500/25 transition-colors">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <p className="font-bold text-white mb-2">{title}</p>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 5 — STACK
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-slate-900/60">
        <div className="max-w-5xl mx-auto">
          <SectionLabel>Tecnologías</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Stack completo</h2>
          <p className="text-slate-400 mb-12 max-w-xl">
            Todas las capas usan servicios cloud gestionados — sin servidores propios que mantener.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STACK.map(({ category, color, items }) => (
              <div key={category} className="p-5 rounded-2xl bg-slate-800/60 border border-white/8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{category}</span>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-white">
                      <ChevronRight size={12} style={{ color }} className="shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECCIÓN 6 — CTA FINAL
      ══════════════════════════════════════════ */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(59,130,246,0.12),transparent)]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold mb-8">
            <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
            Sistema activo en producción
          </div>

          <h2 className="text-4xl sm:text-5xl font-black mb-5">
            Ver el sistema<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              en vivo
            </span>
          </h2>
          <p className="text-slate-400 mb-10 text-lg">
            El dashboard muestra datos reales del ESP32 en tiempo real.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/domotica"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-600/30"
            >
              <Home size={16} /> Abrir dashboard
            </Link>
            <Link
              href="/domotica/graficas"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 font-semibold transition-all"
            >
              <BarChart2 size={16} /> Ver gráficas
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 py-8 px-4 text-center">
        <p className="text-slate-500 text-sm">
          Domótica IoT · ESP32 + HiveMQ + Supabase + Next.js ·{' '}
          <span className="text-slate-400">Internet de las Cosas — 7° Semestre</span>
        </p>
      </footer>

    </div>
  );
}

/* ── Sub-componente label de sección ── */
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/8 border border-white/12 text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
      {children}
    </div>
  );
}
