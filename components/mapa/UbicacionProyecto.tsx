'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaExternalLinkAlt, FaMapMarkerAlt } from 'react-icons/fa';

import { EmptyState } from '@/components/ui/primitives';
import { coordenadasValidas, enlaceDeMapa, type ProyectoUbicado } from '@/lib/mapa';
import type { ProyectoResumen } from '@/lib/types';

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-400">Cargando mapa…</div>,
});

const sinAccion = () => undefined;

/** Pestaña «Ubicación» del detalle del proyecto: un mapa con su pin y accesos para abrirlo en otra app o ver todos los proyectos. */
export function UbicacionProyecto({ proyecto }: { proyecto: ProyectoResumen }) {
  if (!coordenadasValidas(proyecto.coordenadas)) {
    return (
      <EmptyState
        titulo="Akallpa aún no publicó la ubicación exacta"
        descripcion={proyecto.ubicacion ? `Zona: ${proyecto.ubicacion}. Cuando esté disponible la verás en el mapa.` : 'Cuando esté disponible la verás en el mapa.'}
      />
    );
  }
  const ubicado = proyecto as ProyectoUbicado;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-gray-300">
          <FaMapMarkerAlt className="text-emerald-400" aria-hidden />
          {proyecto.ubicacion ?? 'Ubicación del proyecto'}
        </p>
        <div className="flex gap-4 text-sm">
          <a href={enlaceDeMapa(ubicado.coordenadas)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
            Abrir en Google Maps <FaExternalLinkAlt size={11} aria-hidden />
          </a>
          <Link href="/mapa" prefetch={false} className="text-slate-300 hover:text-white">
            Ver todos los proyectos
          </Link>
        </div>
      </div>
      <div className="h-80 overflow-hidden rounded-xl border border-slate-700/60 sm:h-96">
        <MapaLeaflet proyectos={[ubicado]} seleccionadoId={null} onSeleccionar={sinAccion} />
      </div>
    </div>
  );
}
