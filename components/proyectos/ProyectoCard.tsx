import clsx from 'clsx';
import Link from 'next/link';
import { FaBuilding, FaCalendarAlt, FaChartLine, FaLock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

import { estadoDeCaptacion } from '@/lib/captacion';
import { acotarPorcentaje, ETIQUETA_TIPO_PROYECTO, formatearFecha, formatearMonto, formatearPorcentaje } from '@/lib/format';
import type { ProyectoResumen } from '@/lib/types';

/** Insignia principal del estado, como en Inversiones Pro (EN CURSO / FINANCIADO / LIQUIDADO). */
export function insigniaDeEstado(p: Pick<ProyectoResumen, 'estado' | 'porcentaje_recaudado' | 'plazo_vencido'>): { texto: string; clase: string } {
  if (p.estado === 'liquidado') return { texto: '✓ LIQUIDADO', clase: 'bg-slate-700/90 text-slate-300' };
  if (p.estado === 'liquidando') return { texto: '⏳ LIQUIDANDO', clase: 'bg-amber-500/90 text-white' };
  if (p.estado === 'captando') {
    if (p.porcentaje_recaudado >= 100) return { texto: '⚡ FINANCIADO', clase: 'bg-amber-500/90 text-white' };
    if (p.plazo_vencido) return { texto: '⏳ PLAZO VENCIDO', clase: 'bg-red-600/90 text-white' };
    return { texto: '● CAPTANDO', clase: 'bg-blue-600/90 text-white' };
  }
  return { texto: '● EN CURSO', clase: 'bg-blue-600/90 text-white' };
}

function colorDeBarra(p: ProyectoResumen): string {
  if (p.estado === 'liquidado') return 'from-slate-500 to-slate-400';
  if (p.porcentaje_recaudado >= 100) return 'from-amber-500 to-orange-400';
  if (p.porcentaje_recaudado >= 70) return 'from-emerald-500 to-teal-400';
  return 'from-blue-600 to-indigo-500';
}

/** Tarjeta de un proyecto: portada, estado, indicadores, barra de captación y acción. */
export function ProyectoCard({ proyecto, variant = 'default' }: { proyecto: ProyectoResumen; variant?: 'default' | 'lista' }) {
  const p = proyecto;
  const pct = Math.round(acotarPorcentaje(p.porcentaje_recaudado));
  const liquidado = p.estado === 'liquidado';
  const puedeInvertir = estadoDeCaptacion(p).puedeInvertir;
  const insignia = insigniaDeEstado(p);
  const detalle = `/proyectos/${p.id}`;
  const mia = p.mi_participacion;

  return (
    <article
      className={clsx(
        'group relative flex h-full overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-slate-500/70 hover:shadow-xl hover:shadow-slate-900/30',
        variant === 'lista' ? 'flex-col md:flex-row' : 'flex-col'
      )}
    >
      <div className={clsx('relative shrink-0 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900', variant === 'lista' ? 'h-48 md:h-auto md:w-72' : 'h-48')}>
        {p.tiene_imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/api/proyecto-imagen?id=${p.id}`} alt={`Portada de ${p.nombre}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-600">
            <FaBuilding size={40} aria-hidden />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
          <span className={clsx('inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold shadow backdrop-blur-md', insignia.clase)}>{insignia.texto}</span>
          <div className="flex flex-wrap gap-1.5">
            {mia && <span className="rounded-full border border-emerald-500/30 bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold text-emerald-400 backdrop-blur-sm">MI APORTE</span>}
            {p.tipo && (
              <span className="rounded-full border border-blue-500/20 bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-300 backdrop-blur-sm">
                {ETIQUETA_TIPO_PROYECTO[p.tipo] ?? p.tipo}
              </span>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-70" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-white transition-colors duration-200 group-hover:text-blue-400">
            {/* Enlace extendido: toda la tarjeta es clicable, y los botones del pie quedan por encima. */}
            <Link href={detalle} prefetch={false} className="after:absolute after:inset-0 after:z-0 after:content-['']">
              {p.nombre}
            </Link>
          </h3>
          <span className="mt-1 block text-xs font-medium text-slate-400">{p.empresa}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-2.5 text-center">
            <div className="mb-0.5 flex items-center justify-center gap-1">
              <FaChartLine className="text-emerald-400" size={10} aria-hidden />
              <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">ROI est.</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">{p.roi_estimado ? `~${p.roi_estimado}%` : '—'}</span>
          </div>
          <div className="rounded-xl border border-blue-500/15 bg-blue-500/10 p-2.5 text-center">
            <div className="mb-0.5 flex items-center justify-center gap-1">
              <FaUsers className="text-blue-400" size={10} aria-hidden />
              <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Socios</span>
            </div>
            <span className="text-sm font-bold text-blue-400">{p.socios}</span>
          </div>
          <div className="rounded-xl border border-purple-500/15 bg-purple-500/10 p-2.5 text-center">
            {p.avance_pct > 0 ? (
              <>
                <div className="mb-0.5 flex items-center justify-center gap-1">
                  <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Obra</span>
                </div>
                <span className="text-sm font-bold text-purple-400">{Math.round(p.avance_pct)}%</span>
              </>
            ) : p.estado === 'captando' && p.fecha_limite ? (
              <>
                <div className="mb-0.5 flex items-center justify-center gap-1">
                  <FaCalendarAlt className="text-purple-400" size={10} aria-hidden />
                  <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Cierre</span>
                </div>
                <span className="text-[11px] font-bold text-purple-400">{formatearFecha(p.fecha_limite)}</span>
              </>
            ) : (
              <>
                <div className="mb-0.5 flex items-center justify-center gap-1">
                  <FaLock className="text-purple-400" size={10} aria-hidden />
                  <span className="text-[9px] font-medium uppercase tracking-wide text-slate-500">Comisión</span>
                </div>
                <span className="text-sm font-bold text-purple-400">{p.comision_gestor}%</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">Capital recaudado</span>
            <span className={clsx('font-bold tabular-nums', pct >= 100 ? 'text-amber-400' : 'text-blue-400')}>{formatearPorcentaje(pct, 0)}</span>
          </div>
          <div
            role="progressbar"
            aria-label={`Capital recaudado de ${p.nombre}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="relative h-2 overflow-hidden rounded-full bg-slate-800"
          >
            <div style={{ width: `${pct}%` }} className={clsx('relative h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out', colorDeBarra(p))}>
              {!liquidado && pct > 5 && <div className="absolute inset-y-0 right-0 w-4 animate-pulse bg-white/30 blur-sm" />}
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <span className="font-bold tabular-nums text-white">{formatearMonto(p.capital_aportado, p.moneda)}</span>
              <span className="ml-1 text-slate-500">recaudado</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">Meta: </span>
              <span className="font-semibold tabular-nums text-slate-300">{formatearMonto(p.capital_objetivo, p.moneda)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
            {p.ubicacion ? (
              <>
                <FaMapMarkerAlt size={12} aria-hidden />
                <span className="truncate">{p.ubicacion}</span>
              </>
            ) : mia ? (
              <span className="truncate text-emerald-300">Tu aporte: {formatearMonto(mia.aportado, p.moneda)}</span>
            ) : null}
          </div>
          <div className="relative z-10 flex items-center gap-3">
            {p.ticket_minimo ? (
              <div className="hidden text-right sm:block">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Ticket mín.</div>
                <div className="text-sm font-bold tabular-nums text-white">{formatearMonto(p.ticket_minimo, p.moneda)}</div>
              </div>
            ) : null}
            {puedeInvertir ? (
              <Link href={`${detalle}/aportar`} prefetch={false} className="shrink-0 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 active:scale-95">
                Invertir
              </Link>
            ) : (
              <Link href={detalle} prefetch={false} className={clsx('shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95', liquidado ? 'bg-slate-700 text-slate-400' : 'bg-slate-800 text-white hover:bg-slate-700')}>
                {liquidado ? 'Finalizado' : 'Ver detalle'}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
