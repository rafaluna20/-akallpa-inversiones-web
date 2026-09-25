import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AvanceTimeline } from '@/components/proyectos/AvanceTimeline';
import { CierresLista } from '@/components/proyectos/CierreComponentes';
import { Alert, Badge, Card, PageTitle, ProgressBar, Stat, tonoDeEstado } from '@/components/ui/primitives';
import { llamarAutenticado } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import { ETIQUETA_ESTADO_PROYECTO, formatearFecha, formatearMoneda, formatearPorcentaje } from '@/lib/format';
import type { ProyectoDetalle } from '@/lib/types';

export const metadata: Metadata = { title: 'Proyecto' };

export default async function ProyectoPage({ params }: { params: { id: string } }) {
  if (!/^\d+$/.test(params.id)) notFound();
  const r = await llamarAutenticado<{ proyecto: ProyectoDetalle }>('proyecto', { id: Number(params.id) });
  if (!r.success) {
    if (r.code === 'no_encontrado') notFound();
    return <Alert tipo="error">{mensajeDeError(r)}</Alert>;
  }
  const p = r.proyecto;
  const participa = p.mi_participacion !== null;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/proyectos" prefetch={false} className="text-sm text-slate-400 hover:text-white">← Proyectos</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <PageTitle titulo={p.nombre} subtitulo={p.empresa} />
          <Badge tono={tonoDeEstado(p.estado)}>{ETIQUETA_ESTADO_PROYECTO[p.estado] ?? p.estado}</Badge>
        </div>
      </div>

      <section aria-label="Capital" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat etiqueta="Capital objetivo" valor={formatearMoneda(p.capital_objetivo, p.moneda)} />
        <Stat etiqueta="Capital aportado" valor={formatearMoneda(p.capital_aportado, p.moneda)} ayuda={formatearPorcentaje(p.porcentaje_recaudado) + ' recaudado'} />
        <Stat etiqueta="Avance de obra" valor={formatearPorcentaje(p.avance_pct, 0)} />
        <Stat etiqueta="Fecha límite" valor={formatearFecha(p.fecha_limite)} />
      </section>
      <ProgressBar valor={p.porcentaje_recaudado} etiqueta="Capital recaudado del proyecto" />

      {p.mi_participacion && (
        <Card className="border-emerald-500/20 p-5">
          <h2 className="mb-1 font-display text-lg font-semibold text-white">Tu participación</h2>
          <p className="font-mono text-2xl font-bold text-emerald-300">{formatearMoneda(p.mi_participacion.aportado, p.moneda)}</p>
          <p className="text-sm text-slate-400">{formatearPorcentaje(p.mi_participacion.porcentaje, 2)} del capital aportado</p>
        </Card>
      )}

      {p.estado === 'captando' && (
        <Link
          href={`/proyectos/${p.id}/aportar`}
          prefetch={false}
          className="inline-block rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700"
        >
          Aportar a este proyecto
        </Link>
      )}

      <section aria-labelledby="avance">
        <h2 id="avance" className="mb-4 font-display text-xl font-semibold text-white">Avance de obra</h2>
        <AvanceTimeline avances={p.avances} />
      </section>

      <section aria-labelledby="cierres">
        <h2 id="cierres" className="mb-4 font-display text-xl font-semibold text-white">Cierres mensuales</h2>
        {participa ? (
          <CierresLista proyectoId={p.id} cierres={p.cierres} moneda={p.moneda} />
        ) : (
          <Alert tipo="info">El detalle financiero (costos por rubro y facturas) está disponible para quienes participan en el proyecto.</Alert>
        )}
      </section>
    </div>
  );
}
