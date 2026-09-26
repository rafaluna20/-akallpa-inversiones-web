import Link from 'next/link';
import { FaArrowDown, FaPlus } from 'react-icons/fa';

import { formatearMoneda } from '@/lib/format';
import { composicion, conSigno, tonoResultado } from '@/lib/patrimonio';
import type { Patrimonio } from '@/lib/types';

import { GraficoPatrimonio } from './GraficoPatrimonio';

function Tarjeta({ etiqueta, valor, ayuda, tono }: { etiqueta: string; valor: string; ayuda?: string; tono?: 'positivo' | 'negativo' | 'neutro' }) {
  const color = tono === 'positivo' ? 'text-emerald-400' : tono === 'negativo' ? 'text-red-400' : 'text-white';
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${color}`}>{valor}</p>
      {ayuda && <p className="mt-0.5 text-xs text-slate-500">{ayuda}</p>}
    </div>
  );
}

/** Cabecera del inicio: patrimonio total, evolución, cifras clave y cómo se reparte el dinero. */
export function PatrimonioResumen({ datos: d }: { datos: Patrimonio }) {
  const dinero = (n: number) => formatearMoneda(n, d.moneda);
  const reparto = composicion(d.saldo_libre, d.capital_en_curso);
  const tonoMes = tonoResultado(d.utilidad_mes);

  return (
    <div className="space-y-6">
      <section aria-label="Patrimonio" className="overflow-hidden rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-purple-900/70 via-purple-950/60 to-slate-900 p-6 shadow-2xl md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-purple-200/80">Patrimonio</p>
        <p className="mt-1 text-xs text-purple-200/60">Saldo disponible + capital en proyectos, a costo</p>
        <p className="mt-3 font-display text-5xl font-bold text-white md:text-6xl" aria-label={`Patrimonio total ${dinero(d.patrimonio)}`}>{dinero(d.patrimonio)}</p>
        <p className={`mt-3 inline-flex rounded-full border px-4 py-1.5 text-sm font-medium ${tonoMes === 'positivo' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-300'}`}>
          {tonoMes === 'positivo' ? `${conSigno(d.utilidad_mes, dinero)} de utilidad recibida este mes` : 'Sin utilidad recibida este mes'}
        </p>

        <GraficoPatrimonio puntos={d.evolucion} moneda={d.moneda} />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/cuenta/depositar" prefetch={false} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/20">
            <FaArrowDown aria-hidden /> Depositar
          </Link>
          <Link href="/oportunidades" prefetch={false} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-purple-900 shadow-lg transition hover:bg-purple-50">
            <FaPlus aria-hidden /> Nueva inversión
          </Link>
        </div>
      </section>

      <section aria-label="Cifras clave" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tarjeta etiqueta="Capital en curso" valor={dinero(d.capital_en_curso)} ayuda="Aportado a proyectos que siguen abiertos" />
        <Tarjeta etiqueta="Saldo disponible" valor={dinero(d.saldo_libre)} ayuda="Sin invertir: puedes retirarlo o aportarlo" />
        <Tarjeta etiqueta="Utilidad recibida" valor={conSigno(d.utilidad_recibida, dinero)} tono={tonoResultado(d.utilidad_recibida)} ayuda={d.resultado_realizado !== d.utilidad_recibida ? `Resultado en proyectos cerrados: ${conSigno(d.resultado_realizado, dinero)}` : 'Solo lo que ya se te pagó'} />
        <Tarjeta etiqueta="Proyectos activos" valor={String(d.proyectos_activos)} ayuda={`Histórico: ${d.proyectos_historicos}`} />
      </section>

      {d.saldo_libre + d.capital_en_curso > 0 && (
        <section aria-label="Cómo se reparte tu dinero" className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Invertido {reparto.invertido}%</span>
            <span>Disponible {reparto.libre}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-800" role="img" aria-label={`${reparto.invertido}% invertido y ${reparto.libre}% disponible`}>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${reparto.invertido}%` }} />
            <div className="bg-emerald-500/70" style={{ width: `${reparto.libre}%` }} />
          </div>
        </section>
      )}

      {d.otras_monedas && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Tienes cuentas en otra moneda: aquí solo se muestra {d.moneda}.
        </p>
      )}
    </div>
  );
}

/** Aclaraciones que evitan leer de más las cifras. */
export function NotaPatrimonio() {
  return (
    <p className="mt-10 text-xs leading-relaxed text-slate-500">
      Las cifras están a costo: el capital invertido vale lo que aportaste, sin revalorizaciones. La utilidad se cuenta cuando se liquida el proyecto y
      se te paga; puede ser positiva o negativa. Las estimaciones que publica el gestor son proyecciones, no promesas.
    </p>
  );
}
