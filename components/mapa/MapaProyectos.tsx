'use client';

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FaExternalLinkAlt, FaMapMarkerAlt } from 'react-icons/fa';

import { EmptyState } from '@/components/ui/primitives';
import { ETIQUETA_ESTADO_PROYECTO, ETIQUETA_TIPO_PROYECTO, formatearPorcentaje } from '@/lib/format';
import { coincideConFiltro, COLOR_PIN, enlaceDeMapa, FILTROS_MAPA, separarPorUbicacion, type FiltroMapa } from '@/lib/mapa';
import type { ProyectoResumen } from '@/lib/types';

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-400">Cargando mapa…</div>,
});

/** Mapa de proyectos, como el de Inversiones Pro: lista a un lado, pines al otro, ambos sincronizados. */
export function MapaProyectos({ proyectos }: { proyectos: ProyectoResumen[] }) {
  const [filtro, setFiltro] = useState<FiltroMapa>('todos');
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

  const visibles = useMemo(() => proyectos.filter((p) => coincideConFiltro(p.estado, filtro)), [proyectos, filtro]);
  const { ubicados, sinUbicar } = useMemo(() => separarPorUbicacion(visibles), [visibles]);

  const cambiarFiltro = (f: FiltroMapa) => {
    setFiltro(f);
    setSeleccionadoId(null);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-4">
        <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-white">
          <FaMapMarkerAlt className="text-blue-400" aria-hidden /> Mapa de proyectos
        </h1>
        <p className="mt-1 text-gray-400">Dónde se construye cada proyecto de Akallpa.</p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por etapa">
        {FILTROS_MAPA.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => cambiarFiltro(f.id)}
            aria-pressed={filtro === f.id}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition',
              filtro === f.id ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
            )}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {proyectos.length === 0 ? (
        <EmptyState titulo="Aún no hay proyectos publicados" descripcion="Cuando Akallpa publique un proyecto lo verás aquí." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <aside className="order-2 max-h-[70vh] space-y-2 overflow-y-auto pr-1 lg:order-1" aria-label="Proyectos">
            {visibles.length === 0 && <p className="rounded-xl border border-slate-700/60 bg-slate-900 p-4 text-sm text-slate-400">No hay proyectos en esta etapa.</p>}
            {ubicados.map((p) => (
              <div
                key={p.id}
                className={clsx('rounded-xl border p-3 transition', p.id === seleccionadoId ? 'border-rose-500/60 bg-rose-500/10' : 'border-slate-700/60 bg-slate-900 hover:border-slate-500')}
              >
                <button type="button" onClick={() => setSeleccionadoId(p.id === seleccionadoId ? null : p.id)} aria-pressed={p.id === seleccionadoId} className="flex w-full items-start gap-2 text-left">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: COLOR_PIN[p.estado] }} aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{p.nombre}</span>
                    <span className="block text-xs text-slate-400">
                      {ETIQUETA_ESTADO_PROYECTO[p.estado] ?? p.estado}
                      {p.tipo ? ` · ${ETIQUETA_TIPO_PROYECTO[p.tipo] ?? p.tipo}` : ''} · {formatearPorcentaje(p.porcentaje_recaudado, 0)}
                    </span>
                    {p.ubicacion && <span className="block truncate text-xs text-slate-500">{p.ubicacion}</span>}
                  </span>
                </button>
                {p.id === seleccionadoId && (
                  <div className="mt-2 flex gap-3 pl-4 text-xs">
                    <Link href={`/proyectos/${p.id}`} prefetch={false} className="font-semibold text-blue-400 hover:text-blue-300">
                      Ver proyecto
                    </Link>
                    <a href={enlaceDeMapa(p.coordenadas)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
                      Abrir en Google Maps <FaExternalLinkAlt size={10} aria-hidden />
                    </a>
                  </div>
                )}
              </div>
            ))}

            {sinUbicar.length > 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ubicación aún no publicada</p>
                <ul className="space-y-1">
                  {sinUbicar.map((p) => (
                    <li key={p.id}>
                      <Link href={`/proyectos/${p.id}`} prefetch={false} className="text-sm text-slate-300 hover:text-white">
                        {p.nombre}
                        {p.ubicacion ? <span className="text-slate-500"> · {p.ubicacion}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <div className="order-1 h-[60vh] overflow-hidden rounded-2xl border border-slate-700/60 lg:order-2 lg:h-[70vh]">
            <MapaLeaflet proyectos={ubicados} seleccionadoId={seleccionadoId} onSeleccionar={setSeleccionadoId} />
          </div>
        </div>
      )}
    </div>
  );
}
