import type { Metadata } from 'next';
import Link from 'next/link';

import { ContratosLista } from '@/components/patrimonio/ContratosLista';
import { NotaPatrimonio, PatrimonioResumen } from '@/components/patrimonio/PatrimonioResumen';
import { Alert, EmptyState } from '@/components/ui/primitives';
import { requerirSesion } from '@/lib/auth';
import { obtenerPatrimonio } from '@/lib/datos';
import { mensajeDeError } from '@/lib/errores';

export const metadata: Metadata = { title: 'Patrimonio' };

/** Inicio: dónde está el dinero de la persona (saldo libre + capital en proyectos), su evolución y sus contratos. */
export default async function DashboardPage() {
  const { me } = await requerirSesion();
  const datos = await obtenerPatrimonio();

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-6 text-lg text-slate-400">
        Hola, <span className="font-semibold text-white">{me.partner.nombre.split(' ')[0]}</span>. Así está tu dinero con Akallpa.
      </p>

      {!datos.success ? (
        <Alert tipo="error">{mensajeDeError(datos)}</Alert>
      ) : datos.contratos.length === 0 && datos.patrimonio === 0 ? (
        <EmptyState titulo="Aún no tienes movimientos" descripcion="Deposita saldo y participa en tu primer proyecto para ver aquí tu patrimonio." />
      ) : (
        <>
          <PatrimonioResumen datos={datos} />
          <div className="mt-10">
            <ContratosLista contratos={datos.contratos} moneda={datos.moneda} />
          </div>
          <NotaPatrimonio />
        </>
      )}

      {datos.success && datos.contratos.length === 0 && datos.patrimonio > 0 && (
        <p className="mt-6 text-center text-slate-400">
          Ya tienes saldo: <Link href="/oportunidades" className="font-semibold text-blue-400 hover:text-blue-300">elige tu primer proyecto</Link>.
        </p>
      )}
    </div>
  );
}
