import type { Metadata } from 'next';
import Link from 'next/link';

import { ActualizarDepositosForm } from '@/components/cuenta/Formularios';
import { Alert, Card, EmptyState, PageTitle } from '@/components/ui/primitives';
import { llamarAutenticado, requerirSesion } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import { formatearFecha, formatearMoneda } from '@/lib/format';
import type { DepositoInfo, Movimiento } from '@/lib/types';

export const metadata: Metadata = { title: 'Depositar' };

export default async function DepositarPage() {
  await requerirSesion();
  const [info, movimientos] = await Promise.all([
    llamarAutenticado<DepositoInfo>('deposito/info'),
    llamarAutenticado<{ movimientos: Movimiento[]; total: number }>('movimientos', { limit: 100 }),
  ]);
  const depositos = movimientos.success ? movimientos.movimientos.filter((m) => m.tipo === 'deposito').slice(0, 10) : [];

  return (
    <div className="space-y-8">
      <PageTitle titulo="Depositar" subtitulo="Agrega fondos a tu cuenta desde tu billetera digital." />
      {!info.success && <Alert tipo="error">{mensajeDeError(info)}</Alert>}

      {info.success && !info.activo && (
        <Alert tipo="info">Los depósitos desde la billetera aún no están habilitados. Contacta a Akallpa.</Alert>
      )}

      {info.success && info.activo && (
        <>
          {!info.billetera_vinculada && (
            <Alert tipo="error">
              Tu billetera aún no está vinculada a tu cuenta de inversionista. Contacta a Akallpa para vincularla:
              sin eso no podemos reconocer tus depósitos.
            </Alert>
          )}

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Cómo depositar</h2>
            <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-300">
              <li>
                Abre tu billetera digital
                {info.app_url ? (
                  <>
                    {' '}
                    (<a href={info.app_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                      abrir la billetera
                    </a>
                    )
                  </>
                ) : null}{' '}
                {info.billetera_vinculada && (
                  <>
                    e ingresa con la cuenta <span className="font-mono text-white">{info.billetera_vinculada}</span>
                  </>
                )}
                .
              </li>
              <li>
                Pulsa <strong className="text-white">Depositar</strong>, elige <strong className="text-white">{info.plataforma}</strong>,
                escribe el monto y confirma con tu clave.
              </li>
              <li>Vuelve aquí y pulsa el botón de abajo. Tu saldo se actualiza en segundos.</li>
            </ol>
            <p className="mt-4 text-xs text-slate-500">
              También se actualiza solo cada pocos minutos. Nunca compartas tu clave con nadie, ni siquiera con Akallpa.
            </p>
            <div className="mt-6">
              <ActualizarDepositosForm />
            </div>
          </Card>
        </>
      )}

      <section aria-labelledby="ultimos">
        <h2 id="ultimos" className="mb-4 font-display text-xl font-semibold text-white">Tus últimos depósitos</h2>
        {depositos.length > 0 ? (
          <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
            {depositos.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 bg-slate-900/20 px-4 py-3">
                <span className="text-xs text-slate-500">{formatearFecha(d.fecha.slice(0, 10))}</span>
                <span className="font-mono text-sm text-emerald-300">+{formatearMoneda(d.importe, d.moneda)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState titulo="Aún no tienes depósitos" />
        )}
      </section>

      <p className="text-sm">
        <Link href="/cuenta" className="text-blue-400 underline">Volver a Mi cuenta</Link>
      </p>
    </div>
  );
}
