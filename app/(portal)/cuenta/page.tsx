import type { Metadata } from 'next';
import Link from 'next/link';

import { MovimientosLista } from '@/components/cuenta/MovimientosLista';
import { RetiroForm } from '@/components/cuenta/Formularios';
import { Alert, Badge, Card, EmptyState, PageTitle, Stat } from '@/components/ui/primitives';
import { llamarAutenticado, requerirSesion } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import { formatearFecha, formatearMoneda } from '@/lib/format';
import type { EstadoCuenta, Movimiento, RetiroResumen } from '@/lib/types';

export const metadata: Metadata = { title: 'Mi cuenta' };

const TONO_RETIRO: Record<string, 'azul' | 'verde' | 'amarillo' | 'rojo'> = {
  solicitado: 'amarillo',
  aprobado: 'azul',
  pagado: 'verde',
  rechazado: 'rojo',
};

export default async function CuentaPage() {
  const { me } = await requerirSesion();
  const [estado, movimientos, retiros] = await Promise.all([
    llamarAutenticado<EstadoCuenta>('estado_cuenta'),
    llamarAutenticado<{ movimientos: Movimiento[]; total: number }>('movimientos', { limit: 30 }),
    llamarAutenticado<{ retiros: RetiroResumen[] }>('retiros'),
  ]);
  const saldo = me.cuentas[0];
  const moneda = saldo?.moneda ?? 'PEN';
  const error = [estado, movimientos, retiros].find((r) => !r.success);

  return (
    <div className="space-y-8">
      <PageTitle titulo="Mi cuenta" subtitulo="Tu saldo, tus aportes por proyecto y tus movimientos." />
      {error && !error.success && <Alert tipo="error">{mensajeDeError(error)}</Alert>}

      <p>
        <Link href="/cuenta/depositar" className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          Depositar desde mi billetera
        </Link>
      </p>

      <section aria-label="Saldos" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {me.cuentas.length === 0 ? (
          <Stat etiqueta="Saldo disponible" valor={formatearMoneda(0, moneda)} />
        ) : (
          me.cuentas.map((c) => <Stat key={c.empresa} etiqueta={`Saldo · ${c.empresa}`} valor={formatearMoneda(c.saldo, c.moneda)} />)
        )}
      </section>

      <section aria-labelledby="por-proyecto">
        <h2 id="por-proyecto" className="mb-4 font-display text-xl font-semibold text-white">Estado de cuenta por proyecto</h2>
        {estado.success && estado.proyectos.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Estado de cuenta por proyecto</caption>
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">Proyecto</th>
                  <th scope="col" className="px-4 py-3 text-right">Aportado</th>
                  <th scope="col" className="px-4 py-3 text-right">Capital devuelto</th>
                  <th scope="col" className="px-4 py-3 text-right">Utilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {estado.proyectos.map((p) => (
                  <tr key={p.proyecto_id} className="text-slate-200">
                    <td className="px-4 py-3">{p.proyecto}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatearMoneda(p.aportado, p.moneda)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatearMoneda(p.capital_devuelto, p.moneda)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-300">{formatearMoneda(p.utilidad, p.moneda)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState titulo="Aún no tienes aportes registrados" />
        )}
      </section>

      <section aria-labelledby="movimientos">
        <h2 id="movimientos" className="mb-4 font-display text-xl font-semibold text-white">Movimientos</h2>
        <MovimientosLista movimientos={movimientos.success ? movimientos.movimientos : []} />
      </section>

      <section aria-labelledby="retiros" className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 id="retiros" className="mb-4 font-display text-xl font-semibold text-white">Solicitar un retiro</h2>
          <Card>
            <RetiroForm moneda={moneda} saldoDisponible={saldo?.saldo ?? 0} tieneCuentaDestino={me.tiene_cuenta_destino} />
          </Card>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-white">Mis retiros</h2>
          {retiros.success && retiros.retiros.length > 0 ? (
            <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
              {retiros.retiros.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 bg-slate-900/20 px-4 py-3">
                  <div>
                    <p className="font-mono text-sm text-slate-100">{formatearMoneda(r.monto, r.moneda)}</p>
                    <p className="text-xs text-slate-500">{formatearFecha(r.fecha.slice(0, 10))}</p>
                  </div>
                  <Badge tono={TONO_RETIRO[r.estado] ?? 'gris'}>{r.estado}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState titulo="Aún no has solicitado retiros" />
          )}
        </div>
      </section>
    </div>
  );
}
