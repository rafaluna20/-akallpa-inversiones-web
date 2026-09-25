import clsx from 'clsx';

import { EmptyState } from '@/components/ui/primitives';
import { ETIQUETA_TIPO_MOVIMIENTO, formatearFecha, formatearMoneda } from '@/lib/format';
import type { Movimiento } from '@/lib/types';

export function MovimientosLista({ movimientos }: { movimientos: Movimiento[] }) {
  if (movimientos.length === 0) {
    return <EmptyState titulo="Aún no tienes movimientos" descripcion="Tus depósitos, aportes y pagos aparecerán aquí." />;
  }
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
      {movimientos.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-4 bg-slate-900/20 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">{ETIQUETA_TIPO_MOVIMIENTO[m.tipo] ?? m.tipo}</p>
            <p className="truncate text-xs text-slate-500">
              {formatearFecha(m.fecha.slice(0, 10))}
              {m.proyecto ? ` · ${m.proyecto}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className={clsx('font-mono text-sm font-semibold', m.importe >= 0 ? 'text-emerald-300' : 'text-red-300')}>
              {m.importe >= 0 ? '+' : ''}
              {formatearMoneda(m.importe, m.moneda)}
            </p>
            <p className="font-mono text-xs text-slate-500">Saldo {formatearMoneda(m.saldo_posterior, m.moneda)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
