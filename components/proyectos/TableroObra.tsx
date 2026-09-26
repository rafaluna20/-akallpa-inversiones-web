import clsx from 'clsx';
import { FaCheckCircle, FaLock, FaTimesCircle } from 'react-icons/fa';

import { EmptyState } from '@/components/ui/primitives';
import { formatearFecha, formatearMonto } from '@/lib/format';
import { estiloDeEstado, seriesDeEvolucion, yDeIndiceUno } from '@/lib/tablero';
import type { Evm, InformeObra, InformeResumen, Tablero } from '@/lib/types';

const CAJA = 'rounded-2xl border border-white/5 bg-slate-900/40 p-5';

function EstadoYAvance({ informe }: { informe: InformeObra }) {
  const est = estiloDeEstado(informe.estado);
  const avance = Math.round(Math.min(100, Math.max(0, informe.avance)));
  const t = informe.tareas;
  return (
    <section aria-label="Estado de la obra" className={CAJA}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Último informe de obra</p>
          <h3 className="font-sans text-lg font-semibold text-white">{informe.nombre}</h3>
          <p className="text-xs text-slate-500">{formatearFecha(informe.fecha)}</p>
        </div>
        <span className={clsx('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold', est.clase)}>
          <span className={clsx('h-2 w-2 rounded-full', est.punto)} aria-hidden />
          {informe.estado_texto}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-slate-400">Avance de obra</span>
            <span className="text-3xl font-bold text-white">{avance}%</span>
          </div>
          <div role="progressbar" aria-label="Avance de obra" aria-valuemin={0} aria-valuemax={100} aria-valuenow={avance} className="h-3 overflow-hidden rounded-full bg-slate-950/60">
            <div style={{ width: `${avance}%` }} className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm text-slate-400">Tareas cerradas</span>
            <span className="text-3xl font-bold text-white">
              {t.cerradas}
              <span className="text-lg font-normal text-slate-500"> / {t.total}</span>
            </span>
          </div>
          <div role="progressbar" aria-label="Tareas cerradas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(t.porcentaje)} className="h-3 overflow-hidden rounded-full bg-slate-950/60">
            <div style={{ width: `${Math.min(100, t.porcentaje)}%` }} className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
        </div>
      </div>

      {informe.descripcion && <p className="mt-5 whitespace-pre-line border-t border-white/5 pt-4 text-sm leading-relaxed text-slate-300">{informe.descripcion}</p>}
    </section>
  );
}

function Semaforo({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-sm font-medium', ok ? 'text-emerald-400' : 'text-red-400')}>
      {ok ? <FaCheckCircle aria-hidden /> : <FaTimesCircle aria-hidden />}
      {texto}
    </span>
  );
}

function SaludEvm({ evm, moneda }: { evm: Evm; moneda: string }) {
  const filas: { etiqueta: string; valor: string; estado?: { ok: boolean; texto: string } }[] = [
    { etiqueta: 'Presupuesto base (BAC)', valor: formatearMonto(evm.bac, moneda) },
    { etiqueta: 'Valor planificado (PV)', valor: formatearMonto(evm.pv, moneda) },
    { etiqueta: 'Valor ganado (EV)', valor: formatearMonto(evm.ev, moneda) },
    { etiqueta: 'Costo real (AC)', valor: formatearMonto(evm.ac, moneda) },
    ...(evm.cpi ? [{ etiqueta: 'CPI · eficiencia de costo', valor: evm.cpi.valor.toFixed(2), estado: evm.cpi }] : []),
    ...(evm.spi ? [{ etiqueta: 'SPI · eficiencia de cronograma', valor: evm.spi.valor.toFixed(2), estado: evm.spi }] : []),
  ];
  return (
    <section aria-labelledby="evm" className={CAJA}>
      <h3 id="evm" className="mb-4 font-sans text-lg font-semibold text-white">Salud del proyecto (EVM)</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] text-left text-sm">
          <caption className="sr-only">Indicadores de valor ganado del proyecto</caption>
          <thead className="text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="pb-2">Métrica</th>
              <th scope="col" className="pb-2 text-right">Valor</th>
              <th scope="col" className="pb-2 text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filas.map((f) => (
              <tr key={f.etiqueta} className="text-slate-200">
                <th scope="row" className="py-2.5 font-medium">{f.etiqueta}</th>
                <td className="py-2.5 text-right font-mono">{f.valor}</td>
                <td className="py-2.5 text-right">{f.estado ? <Semaforo ok={f.estado.ok} texto={f.estado.texto} /> : <span className="text-slate-600">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {evm.sin_datos ? (
        <p className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
          Los índices de costo y cronograma aparecerán cuando haya valorizaciones aprobadas: hasta entonces no hay nada medido con qué compararlos.
        </p>
      ) : (
        <p className="mt-4 text-xs text-slate-500">
          CPI mayor a 1.0: ahorro en costos; menor a 1.0: sobrecosto. SPI mayor a 1.0: adelantado; menor a 1.0: retrasado.
        </p>
      )}
    </section>
  );
}

function Resultado({ r, moneda }: { r: NonNullable<Tablero['resultado']>; moneda: string }) {
  const tiles = [
    { etiqueta: 'Ventas', valor: r.ventas, clase: 'text-blue-300' },
    { etiqueta: 'Costos', valor: r.costos, clase: 'text-slate-200' },
    { etiqueta: 'Resultado', valor: r.margen, clase: r.margen >= 0 ? 'text-emerald-300' : 'text-red-300' },
  ];
  return (
    <section aria-labelledby="resultado" className={CAJA}>
      <h3 id="resultado" className="mb-4 font-sans text-lg font-semibold text-white">Resultado acumulado</h3>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.etiqueta} className="rounded-xl border border-white/5 bg-slate-900/50 p-3 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">{t.etiqueta}</p>
            <p className={clsx('mt-1 font-mono text-lg font-bold', t.clase)}>{formatearMonto(t.valor, moneda)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MayoresGastos({ gastos, moneda }: { gastos: Tablero['mayores_gastos']; moneda: string }) {
  if (gastos.length === 0) return null;
  return (
    <section aria-labelledby="gastos" className={CAJA}>
      <h3 id="gastos" className="mb-4 font-sans text-lg font-semibold text-white">Mayores gastos</h3>
      <ol className="divide-y divide-white/5">
        {gastos.map((g, i) => (
          <li key={`${g.fecha}-${i}`} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-200">{g.descripcion || 'Gasto de obra'}</p>
              <p className="text-xs text-slate-500">{formatearFecha(g.fecha)}</p>
            </div>
            <span className="font-mono text-sm font-semibold text-red-300">{formatearMonto(g.monto, moneda)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Evolución de los informes publicados: avance, CPI y SPI. Incluye una tabla accesible equivalente. */
export function GraficoEvolucion({ historial }: { historial: InformeResumen[] }) {
  const g = seriesDeEvolucion(historial);
  if (!g) return null;
  const { series, ancho, alto, margen, maxIndice } = g;
  const x0 = margen.izq;
  const x1 = ancho - margen.der;
  const yBase = alto - margen.abajo;
  const tieneIndices = series.some((s) => s.id !== 'avance');
  return (
    <section aria-labelledby="evolucion" className={CAJA}>
      <h3 id="evolucion" className="mb-3 font-sans text-lg font-semibold text-white">Evolución</h3>
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Evolución del avance de obra y de los índices CPI y SPI en los informes publicados" className="w-full">
        {[0, 25, 50, 75, 100].map((p) => {
          const y = margen.arr + (1 - p / 100) * (yBase - margen.arr);
          return (
            <g key={p}>
              <line x1={x0} x2={x1} y1={y} y2={y} stroke="#1e293b" strokeWidth="1" />
              <text x={x0 - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b">{p}%</text>
            </g>
          );
        })}
        {tieneIndices && <line x1={x0} x2={x1} y1={yDeIndiceUno(maxIndice)} y2={yDeIndiceUno(maxIndice)} stroke="#475569" strokeWidth="1" strokeDasharray="4 4" />}
        {series.map((s) => (
          <g key={s.id}>
            <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" points={s.puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} />
            {s.puntos.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={s.color} />)}
          </g>
        ))}
        {historial.map((h, i) => (
          <text key={h.id} x={x0 + (i * (x1 - x0)) / (historial.length - 1)} y={alto - 8} textAnchor="middle" fontSize="9" fill="#64748b">
            {(h.fecha ?? '').slice(5, 10).split('-').reverse().join('/')}
          </text>
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
        {series.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span className="h-2 w-4 rounded" style={{ background: s.color }} aria-hidden />
            {s.etiqueta}: <strong className="text-slate-200">{s.ultimo}</strong>
          </li>
        ))}
        {tieneIndices && <li className="text-slate-500">La línea punteada marca el índice 1.0 (en meta).</li>}
      </ul>
      <table className="sr-only">
        <caption>Datos de la evolución</caption>
        <thead><tr><th>Informe</th><th>Fecha</th><th>Avance</th><th>CPI</th><th>SPI</th></tr></thead>
        <tbody>
          {historial.map((h) => (
            <tr key={h.id}><td>{h.nombre}</td><td>{h.fecha}</td><td>{h.avance}%</td><td>{h.cpi?.valor ?? '—'}</td><td>{h.spi?.valor ?? '—'}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/** Tablero de obra: estado y avance del último informe publicado; los montos, solo para quienes participan. */
export function TableroObra({ tablero }: { tablero: Tablero }) {
  const u = tablero.ultimo;
  if (!u) {
    return <EmptyState titulo="Aún no hay informes de obra publicados" descripcion="Cuando Akallpa publique un informe verás aquí el estado, el avance y las tareas de la obra." />;
  }
  return (
    <div className="space-y-6">
      <EstadoYAvance informe={u} />
      <GraficoEvolucion historial={tablero.historial} />
      {tablero.participa ? (
        <>
          {u.evm && <SaludEvm evm={u.evm} moneda={tablero.moneda} />}
          {tablero.resultado && <Resultado r={tablero.resultado} moneda={tablero.moneda} />}
          <MayoresGastos gastos={tablero.mayores_gastos} moneda={tablero.moneda} />
        </>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-slate-900/30 p-5 text-sm text-slate-400">
          <FaLock className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
          <p>El presupuesto, los costos, los índices EVM y los mayores gastos están disponibles para quienes participan en el proyecto.</p>
        </div>
      )}
    </div>
  );
}
