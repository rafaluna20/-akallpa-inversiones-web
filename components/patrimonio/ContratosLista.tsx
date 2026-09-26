'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

import { Badge, EmptyState, ProgressBar, tonoDeEstado } from '@/components/ui/primitives';
import { ETIQUETA_ESTADO_PROYECTO, ETIQUETA_TIPO_PROYECTO, formatearMoneda, formatearPorcentaje } from '@/lib/format';
import { conSigno, filtrarContratos, FILTROS_CONTRATOS, tonoResultado, type FiltroContratos } from '@/lib/patrimonio';
import type { Contrato } from '@/lib/types';

const COLOR_TONO = { positivo: 'text-emerald-400', negativo: 'text-red-400', neutro: 'text-slate-200' } as const;

function Dato({ etiqueta, children, clase }: { etiqueta: string; children: React.ReactNode; clase?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className={clsx('mt-0.5 font-mono text-base font-semibold text-white', clase)}>{children}</dd>
    </div>
  );
}

/** Un contrato: lo que la persona puso en un proyecto, lo que ha recibido y cómo va la obra. */
export function ContratoCard({ contrato: c, moneda }: { contrato: Contrato; moneda: string }) {
  const dinero = (n: number) => formatearMoneda(n, moneda);
  const pendiente = Math.max(0, c.comprometido - c.aportado);
  const titulo = c.visible ? (
    <Link href={`/proyectos/${c.proyecto_id}`} prefetch={false} className="hover:text-blue-300">{c.nombre}</Link>
  ) : (
    c.nombre
  );

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-white/20">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug text-white">{titulo}</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {[c.tipo ? ETIQUETA_TIPO_PROYECTO[c.tipo] ?? c.tipo : null, c.ubicacion].filter(Boolean).join(' · ') || 'Proyecto de Akallpa'}
          </p>
        </div>
        <Badge tono={tonoDeEstado(c.estado)}>{ETIQUETA_ESTADO_PROYECTO[c.estado] ?? c.estado}</Badge>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {c.en_curso ? <Dato etiqueta="Capital en curso">{dinero(c.capital)}</Dato> : <Dato etiqueta="Aportado">{dinero(c.aportado)}</Dato>}
        <Dato etiqueta="Utilidad recibida" clase={COLOR_TONO[tonoResultado(c.utilidad_recibida)]}>{conSigno(c.utilidad_recibida, dinero)}</Dato>
        {c.en_curso ? (
          <Dato etiqueta="Tu participación">{formatearPorcentaje(c.porcentaje, 2)}</Dato>
        ) : (
          <Dato etiqueta="Resultado final" clase={COLOR_TONO[tonoResultado(c.resultado)]}>{conSigno(c.resultado, dinero)}</Dato>
        )}
      </dl>

      {c.en_curso && c.estado !== 'captando' && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Avance de obra</span><span>{Math.round(c.avance_pct)}%</span></div>
          <ProgressBar valor={c.avance_pct} etiqueta={`Avance de obra de ${c.nombre}`} />
        </div>
      )}

      {pendiente > 0 && c.en_curso && (
        <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Tienes {dinero(pendiente)} por confirmar: cuenta como capital cuando tesorería confirme el aporte.
        </p>
      )}

      {c.ganancia_estimada !== null && c.roi_estimado !== null && (
        <p className="mt-3 text-xs text-slate-500">
          Estimación del gestor: {dinero(c.ganancia_estimada)} ({formatearPorcentaje(c.roi_estimado, 1)}). Es una proyección, no una promesa ni una ganancia recibida.
        </p>
      )}
    </article>
  );
}

/** «Mis contratos» con las pestañas En curso / Finalizados / Todos. */
export function ContratosLista({ contratos, moneda }: { contratos: Contrato[]; moneda: string }) {
  const [filtro, setFiltro] = useState<FiltroContratos>('en_curso');
  const visibles = filtrarContratos(contratos, filtro);

  return (
    <section aria-labelledby="mis-contratos">
      <h2 id="mis-contratos" className="mb-4 font-display text-2xl font-bold text-white">Mis contratos</h2>
      <div role="tablist" aria-label="Filtrar contratos" className="mb-5 inline-flex rounded-2xl border border-white/10 bg-slate-900/60 p-1">
        {FILTROS_CONTRATOS.map((f) => (
          <button
            key={f.id}
            role="tab"
            type="button"
            aria-selected={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={clsx('rounded-xl px-5 py-2 text-sm font-semibold transition', filtro === f.id ? 'bg-white text-slate-900 shadow' : 'text-slate-400 hover:text-white')}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>
      {visibles.length === 0 ? (
        <EmptyState
          titulo={filtro === 'finalizados' ? 'Todavía no tienes contratos finalizados' : filtro === 'en_curso' ? 'No tienes contratos en curso' : 'Todavía no participas en ningún proyecto'}
          descripcion="Cuando participes en un proyecto lo verás aquí."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibles.map((c) => <ContratoCard key={c.proyecto_id} contrato={c} moneda={moneda} />)}
        </div>
      )}
    </section>
  );
}
