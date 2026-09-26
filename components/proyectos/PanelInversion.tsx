import clsx from 'clsx';
import Link from 'next/link';
import { FaCheckCircle, FaClock, FaLock, FaTrophy, FaUsers } from 'react-icons/fa';
import { FaCircleDollarToSlot, FaShieldHalved } from 'react-icons/fa6';

import { estadoDeCaptacion } from '@/lib/captacion';
import { acotarPorcentaje, formatearMonto } from '@/lib/format';
import type { ProyectoDetalle } from '@/lib/types';

const ESTILO = {
  abierto: { caja: 'border-blue-500/30 from-blue-600/10 via-purple-600/10 to-blue-600/10 shadow-blue-600/10', monto: 'from-blue-400 to-purple-400', pct: 'text-blue-400', barra: 'from-blue-500 via-purple-500 to-blue-500', icono: 'from-blue-500 to-purple-500' },
  completo: { caja: 'border-yellow-500/40 from-yellow-500/15 via-amber-500/10 to-orange-500/15 shadow-yellow-500/10', monto: 'from-yellow-400 to-amber-400', pct: 'text-yellow-400', barra: 'from-yellow-500 via-amber-400 to-orange-400', icono: 'from-yellow-500 to-amber-500' },
  vencido: { caja: 'border-red-500/30 from-red-600/10 via-rose-600/10 to-red-600/10 shadow-red-600/10', monto: 'from-red-400 to-rose-400', pct: 'text-red-400', barra: 'from-red-500 via-rose-500 to-red-500', icono: 'from-red-500 to-rose-500' },
  cerrado: { caja: 'border-slate-600/40 from-slate-600/10 via-slate-700/10 to-slate-600/10 shadow-slate-900/20', monto: 'from-slate-300 to-slate-400', pct: 'text-slate-300', barra: 'from-slate-500 to-slate-400', icono: 'from-slate-500 to-slate-600' },
} as const;

/**
 * Panel lateral de captación (equivalente a la InvestmentCard de Inversiones Pro), con montos reales en vez de
 * "cubos". No lista quiénes son los socios: solo cuántos son.
 */
export function PanelInversion({ proyecto }: { proyecto: ProyectoDetalle }) {
  const p = proyecto;
  const e = estadoDeCaptacion(p);
  const est = ESTILO[e.tono];
  const pct = Math.round(acotarPorcentaje(p.porcentaje_recaudado));
  const mia = p.mi_participacion;

  return (
    <div className={clsx('rounded-2xl border bg-gradient-to-br p-6 shadow-2xl transition-all duration-500 lg:p-8', est.caja)}>
      {e.completo && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-3">
          <FaTrophy className="text-2xl text-yellow-300" aria-hidden />
          <div>
            <p className="text-sm font-bold text-yellow-300">¡Meta alcanzada!</p>
            <p className="text-xs text-yellow-400/80">Este proyecto está 100% financiado</p>
          </div>
        </div>
      )}
      {e.vencido && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-500/40 bg-gradient-to-r from-red-500/20 to-rose-500/20 p-3">
          <FaClock className="text-2xl text-red-300" aria-hidden />
          <div>
            <p className="text-sm font-bold text-red-300">Tiempo agotado</p>
            <p className="text-xs text-red-400/80">El plazo de recaudación ha expirado</p>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <div className={clsx('rounded-xl bg-gradient-to-br p-3', est.icono)}>
          <FaCircleDollarToSlot className="text-3xl text-white" aria-hidden />
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wide text-gray-400">{e.titulo}</h2>
          <p className="text-xs text-gray-500">{e.subtitulo}</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className={clsx('bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl', est.monto)}>
              {formatearMonto(p.capital_aportado, p.moneda)}
            </p>
            <p className="text-sm text-gray-500">de {formatearMonto(p.capital_objetivo, p.moneda)} meta</p>
          </div>
          <div className="text-right">
            <p className={clsx('text-4xl font-bold lg:text-5xl', est.pct)}>{pct}%</p>
            <p className="text-xs text-gray-500">financiado</p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Capital recaudado del proyecto"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="relative h-3 w-full overflow-hidden rounded-full bg-slate-950/50"
        >
          <div style={{ width: `${pct}%` }} className={clsx('absolute left-0 top-0 h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out', est.barra)} />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <FaCircleDollarToSlot className="text-blue-400" aria-hidden />
            <span className="text-xs text-gray-400">Falta captar</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatearMonto(e.falta, p.moneda)}</p>
          <p className="text-xs text-gray-500">para completar la meta</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-slate-900/50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <FaUsers className="text-purple-400" aria-hidden />
            <span className="text-xs text-gray-400">Socios</span>
          </div>
          <p className="text-2xl font-bold text-white">{p.socios}</p>
          <p className="text-xs text-gray-500">participando</p>
        </div>
      </div>

      {e.puedeInvertir && p.ticket_minimo ? (
        <div className="mb-6 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Inversión desde</span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">{formatearMonto(p.ticket_minimo, p.moneda)}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Monto mínimo por inversionista</p>
        </div>
      ) : null}

      {p.roi_estimado ? (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">ROI estimado</span>
            <span className="text-2xl font-bold text-emerald-400">~{p.roi_estimado}%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Estimación del gestor; no garantiza rendimientos. Puedes perder parte o todo tu capital.</p>
        </div>
      ) : null}

      {e.puedeInvertir ? (
        <Link
          href={`/proyectos/${p.id}/aportar`}
          prefetch={false}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]"
        >
          <FaCircleDollarToSlot className="text-2xl" aria-hidden />
          {mia ? 'Aportar más' : 'Invertir ahora'}
        </Link>
      ) : (
        e.cierre && (
          <div className={clsx('w-full rounded-xl border px-4 py-4 text-center', e.tono === 'vencido' ? 'border-red-500/30 bg-red-500/10' : e.tono === 'completo' ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-slate-600/30 bg-slate-700/40')}>
            <p className={clsx('font-semibold', e.tono === 'vencido' ? 'text-red-300' : e.tono === 'completo' ? 'text-yellow-300' : 'text-slate-300')}>
              <FaLock className="mr-2 inline" aria-hidden />
              {e.cierre.titulo}
            </p>
            <p className="mt-1 text-xs text-gray-400">{e.cierre.detalle}</p>
          </div>
        )
      )}

      {mia && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4" aria-label="Tu participación">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <FaCheckCircle aria-hidden /> Ya participas en este proyecto
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{formatearMonto(mia.aportado, p.moneda)}</p>
          <p className="text-xs text-gray-400">{mia.porcentaje.toFixed(2)}% del capital aportado</p>
        </div>
      )}

      {/* Hechos comprobables, no promesas: cada uno corresponde a algo que el sistema realmente hace. */}
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-white/5 pt-6 text-xs text-gray-500">
        <li className="flex items-center gap-1"><FaShieldHalved className="text-green-400" aria-hidden /> Conexión cifrada</li>
        <li className="flex items-center gap-1"><FaCheckCircle className="text-blue-400" aria-hidden /> Tesorería confirma cada aporte</li>
        <li className="flex items-center gap-1"><FaCheckCircle className="text-purple-400" aria-hidden /> Cierres con facturas</li>
      </ul>
    </div>
  );
}
