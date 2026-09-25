import Link from 'next/link';

import { EmptyState, ProgressBar, Badge } from '@/components/ui/primitives';
import { formatearFecha, formatearMoneda, formatearPorcentaje } from '@/lib/format';
import type { CierreResumen, FacturaLinea } from '@/lib/types';

export function CierresLista({ proyectoId, cierres, moneda }: { proyectoId: number; cierres: CierreResumen[]; moneda: string }) {
  if (cierres.length === 0) {
    return (
      <EmptyState
        titulo="Todavía no hay cierres mensuales publicados"
        descripcion="El cierre mensual muestra los costos por rubro, las ventas y el detalle de facturas del proyecto."
      />
    );
  }
  return (
    <ul className="space-y-3">
      {cierres.map((c) => (
        <li key={c.id}>
          <Link
            href={`/proyectos/${proyectoId}/cierres/${c.id}`}
            prefetch={false}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-900/30 p-4 transition-colors hover:border-blue-500/40"
          >
            <div>
              <p className="font-semibold text-white">Cierre al {formatearFecha(c.periodo_fin)}</p>
              <p className="text-xs text-slate-500">Avance de obra {formatearPorcentaje(c.avance_pct, 0)}</p>
            </div>
            <div className="text-right font-mono text-sm">
              <p className="text-slate-400">Ventas {formatearMoneda(c.total_ventas, moneda)}</p>
              <p className="text-slate-400">Costos {formatearMoneda(c.total_costos, moneda)}</p>
              <p className={c.resultado >= 0 ? 'font-semibold text-emerald-300' : 'font-semibold text-red-300'}>
                Resultado {formatearMoneda(c.resultado, moneda)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Costos por rubro: barras proporcionales al costo total. */
export function RubrosBarras({ rubros, total, moneda }: { rubros: { nombre: string; monto: number }[]; total: number; moneda: string }) {
  if (rubros.length === 0) return <EmptyState titulo="Sin costos registrados en este cierre" />;
  return (
    <ul className="space-y-4">
      {rubros.map((r) => {
        const pct = total > 0 ? (r.monto / total) * 100 : 0;
        return (
          <li key={r.nombre}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-slate-200">{r.nombre}</span>
              <span className="font-mono text-slate-300">
                {formatearMoneda(r.monto, moneda)} <span className="text-slate-500">({formatearPorcentaje(pct, 0)})</span>
              </span>
            </div>
            <ProgressBar valor={pct} etiqueta={`Peso del rubro ${r.nombre}`} />
          </li>
        );
      })}
    </ul>
  );
}

/** Detalle de facturas. El comprobante solo se ofrece cuando toda la factura pertenece al proyecto. */
export function FacturasTabla({ facturas, cierreId, moneda }: { facturas: FacturaLinea[]; cierreId: number; moneda: string }) {
  if (facturas.length === 0) return <EmptyState titulo="No hay facturas en este cierre" />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Detalle de facturas del cierre</caption>
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Fecha</th>
            <th scope="col" className="px-4 py-3">Documento</th>
            <th scope="col" className="px-4 py-3">Proveedor / cliente</th>
            <th scope="col" className="px-4 py-3">Concepto</th>
            <th scope="col" className="px-4 py-3">Rubro</th>
            <th scope="col" className="px-4 py-3 text-right">Monto</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">Comprobante</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {facturas.map((f, i) => (
            <tr key={`${f.documento}-${i}`} className="text-slate-200">
              <td className="whitespace-nowrap px-4 py-3">{formatearFecha(f.fecha)}</td>
              <td className="px-4 py-3">
                {f.documento || '—'} <Badge tono={f.tipo === 'venta' ? 'verde' : 'gris'}>{f.tipo === 'venta' ? 'Venta' : f.tipo === 'compra' ? 'Compra' : 'Otro'}</Badge>
              </td>
              <td className="px-4 py-3">{f.tercero || '—'}</td>
              <td className="px-4 py-3 text-slate-300">{f.concepto || '—'}</td>
              <td className="px-4 py-3 text-slate-300">{f.rubro ?? '—'}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-mono">{formatearMoneda(f.monto, moneda)}</td>
              <td className="px-4 py-3 text-right">
                {f.comprobante && f.move_id != null ? (
                  <a
                    href={`/api/comprobante?cierre=${cierreId}&move=${f.move_id}`}
                    className="text-blue-400 underline-offset-2 hover:underline"
                    aria-label={`Ver comprobante ${f.documento}`}
                  >
                    Ver
                  </a>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
