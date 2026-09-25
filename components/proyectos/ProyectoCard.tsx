import Link from 'next/link';

import { Badge, ProgressBar, tonoDeEstado } from '@/components/ui/primitives';
import { ETIQUETA_ESTADO_PROYECTO, formatearFecha, formatearMoneda, formatearPorcentaje } from '@/lib/format';
import type { ProyectoResumen } from '@/lib/types';

export function ProyectoCard({ proyecto }: { proyecto: ProyectoResumen }) {
  const { mi_participacion: mia } = proyecto;
  return (
    <Link
      href={`/proyectos/${proyecto.id}`}
      prefetch={false}
      className="group block rounded-[28px] border border-white/10 bg-slate-900/40 p-6 shadow-xl backdrop-blur-xl transition-colors hover:border-blue-500/40"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-xl font-semibold text-white group-hover:text-blue-300">{proyecto.nombre}</h3>
          <p className="truncate text-sm text-slate-500">{proyecto.empresa}</p>
        </div>
        <Badge tono={tonoDeEstado(proyecto.estado)}>{ETIQUETA_ESTADO_PROYECTO[proyecto.estado] ?? proyecto.estado}</Badge>
      </div>

      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>Capital recaudado</span>
        <span>{formatearPorcentaje(proyecto.porcentaje_recaudado)}</span>
      </div>
      <ProgressBar valor={proyecto.porcentaje_recaudado} etiqueta={`Capital recaudado de ${proyecto.nombre}`} />
      <p className="mt-2 font-mono text-sm text-slate-300">
        {formatearMoneda(proyecto.capital_aportado, proyecto.moneda)}{' '}
        <span className="text-slate-500">de {formatearMoneda(proyecto.capital_objetivo, proyecto.moneda)}</span>
      </p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-400">Avance de obra: {formatearPorcentaje(proyecto.avance_pct, 0)}</span>
        {proyecto.estado === 'captando' && proyecto.fecha_limite && (
          <span className="text-slate-500">Hasta {formatearFecha(proyecto.fecha_limite)}</span>
        )}
      </div>

      {mia && (
        <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          Tu aporte: <span className="font-mono font-semibold">{formatearMoneda(mia.aportado, proyecto.moneda)}</span> ·{' '}
          {formatearPorcentaje(mia.porcentaje, 2)} del capital
        </p>
      )}
    </Link>
  );
}
