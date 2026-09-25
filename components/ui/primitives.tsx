import clsx from 'clsx';
import type { ReactNode } from 'react';

import { acotarPorcentaje } from '@/lib/format';

/** Tarjeta base: el "cristal" oscuro de Inversiones Pro. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={clsx(
        'rounded-[28px] border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl',
        className
      )}
    >
      {children}
    </section>
  );
}

type Tono = 'azul' | 'verde' | 'amarillo' | 'rojo' | 'gris' | 'violeta';

const TONOS: Record<Tono, string> = {
  azul: 'border-blue-500/30 bg-blue-500/15 text-blue-300',
  verde: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  amarillo: 'border-yellow-500/30 bg-yellow-500/15 text-yellow-300',
  rojo: 'border-red-500/30 bg-red-500/15 text-red-300',
  gris: 'border-white/10 bg-white/5 text-slate-300',
  violeta: 'border-purple-500/30 bg-purple-500/15 text-purple-300',
};

export function Badge({ tono = 'gris', children }: { tono?: Tono; children: ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', TONOS[tono])}>
      {children}
    </span>
  );
}

/** Tono de la insignia según el estado del proyecto. */
export function tonoDeEstado(estado: string): Tono {
  switch (estado) {
    case 'captando':
      return 'azul';
    case 'en_ejecucion':
      return 'verde';
    case 'liquidando':
      return 'amarillo';
    case 'liquidado':
      return 'gris';
    default:
      return 'gris';
  }
}

export function ProgressBar({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  const pct = acotarPorcentaje(valor);
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Stat({ etiqueta, valor, ayuda, tono }: { etiqueta: string; valor: ReactNode; ayuda?: string; tono?: 'verde' | 'rojo' }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{etiqueta}</p>
      <p
        className={clsx(
          'mt-1 font-mono text-xl font-bold',
          tono === 'verde' && 'text-emerald-300',
          tono === 'rojo' && 'text-red-300',
          !tono && 'text-white'
        )}
      >
        {valor}
      </p>
      {ayuda && <p className="mt-1 text-xs text-slate-500">{ayuda}</p>}
    </div>
  );
}

export function EmptyState({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
      <p className="font-medium text-slate-300">{titulo}</p>
      {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
    </div>
  );
}

const ESTILO_ALERTA = {
  error: 'border-red-500/30 bg-red-500/10 text-red-200',
  exito: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
} as const;

export function Alert({ tipo, children }: { tipo: keyof typeof ESTILO_ALERTA; children: ReactNode }) {
  return (
    <div role={tipo === 'error' ? 'alert' : 'status'} className={clsx('rounded-xl border px-4 py-3 text-sm', ESTILO_ALERTA[tipo])}>
      {children}
    </div>
  );
}

export function PageTitle({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-3xl font-bold text-white">{titulo}</h1>
      {subtitulo && <p className="mt-1 text-slate-400">{subtitulo}</p>}
    </header>
  );
}
