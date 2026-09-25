import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AporteForm } from '@/components/cuenta/Formularios';
import { Alert, Card, PageTitle } from '@/components/ui/primitives';
import { llamarAutenticado, requerirSesion } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import type { ProyectoDetalle } from '@/lib/types';

export const metadata: Metadata = { title: 'Aportar' };

export default async function AportarPage({ params }: { params: { id: string } }) {
  if (!/^\d+$/.test(params.id)) notFound();
  const { me } = await requerirSesion();
  const r = await llamarAutenticado<{ proyecto: ProyectoDetalle }>('proyecto', { id: Number(params.id) });
  if (!r.success) {
    if (r.code === 'no_encontrado') notFound();
    return <Alert tipo="error">{mensajeDeError(r)}</Alert>;
  }
  const p = r.proyecto;
  const cuenta = me.cuentas.find((c) => c.empresa === p.empresa) ?? me.cuentas[0];
  const faltante = Math.max(0, p.capital_objetivo - p.capital_aportado);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link href={`/proyectos/${p.id}`} prefetch={false} className="text-sm text-slate-400 hover:text-white">← {p.nombre}</Link>
      <PageTitle titulo="Aportar al proyecto" subtitulo={p.nombre} />
      {p.estado !== 'captando' ? (
        <Alert tipo="error">Este proyecto ya no está captando aportes.</Alert>
      ) : (
        <Card>
          <AporteForm proyectoId={p.id} moneda={p.moneda} saldoDisponible={cuenta?.saldo ?? 0} faltante={faltante} />
          <p className="mt-5 border-t border-white/5 pt-4 text-xs text-slate-500">
            Tu aporte se descuenta de tu saldo disponible cuando tesorería lo confirma. Si aún no tienes saldo, primero deposita
            en la cuenta indicada por Akallpa y avísales el número de operación.
          </p>
        </Card>
      )}
    </div>
  );
}
