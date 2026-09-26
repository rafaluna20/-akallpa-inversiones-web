import type { Metadata } from 'next';

import { ExploradorProyectos } from '@/components/proyectos/ExploradorProyectos';
import { Alert } from '@/components/ui/primitives';
import { requerirSesion } from '@/lib/auth';
import { obtenerEstadoCuenta, obtenerProyectos } from '@/lib/datos';
import { mensajeDeError } from '@/lib/errores';
import { formatearMonto } from '@/lib/format';

export const metadata: Metadata = { title: 'Dashboard' };

function Tile({ valor, etiqueta, color }: { valor: string; etiqueta: string; color: 'blue' | 'purple' | 'pink' }) {
  const estilos = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 text-blue-500',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20 text-purple-500',
    pink: 'from-pink-500/10 to-pink-600/10 border-pink-500/20 text-pink-500',
  }[color];
  return (
    <div role="listitem" className={`rounded-2xl border bg-gradient-to-br p-8 transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 ${estilos}`}>
      <div className="mb-3 font-display text-5xl font-bold">{valor}</div>
      <div className="text-lg text-slate-300">{etiqueta}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const { me } = await requerirSesion();
  const [estado, proyectos] = await Promise.all([obtenerEstadoCuenta(), obtenerProyectos()]);

  const saldo = me.cuentas[0];
  const moneda = saldo?.moneda ?? 'PEN';
  const filas = estado.success ? estado.proyectos : [];
  const enProyectos = filas.filter((p) => p.estado !== 'liquidado' && p.estado !== 'cancelado').reduce((s, p) => s + p.aportado, 0);
  const utilidad = filas.reduce((s, p) => s + p.utilidad, 0);
  const error = [estado, proyectos].find((r) => !r.success);

  return (
    <div className="min-h-screen">
      <p className="mb-6 text-lg text-slate-400">
        Hola, <span className="font-semibold text-white">{me.partner.nombre.split(' ')[0]}</span>. Este es el resumen de tus inversiones con Akallpa.
      </p>
      {error && !error.success && (
        <div className="mb-6">
          <Alert tipo="error">{mensajeDeError(error)}</Alert>
        </div>
      )}

      <section className="-mx-4 mb-12 border-y border-white/5 bg-slate-900/50 py-12 backdrop-blur-sm lg:-mx-8" aria-label="Resumen">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3" role="list">
            <Tile valor={formatearMonto(saldo?.saldo ?? 0, moneda)} etiqueta="Saldo disponible" color="blue" />
            <Tile valor={formatearMonto(enProyectos, moneda)} etiqueta="Capital en proyectos" color="purple" />
            <Tile valor={formatearMonto(utilidad, moneda)} etiqueta="Utilidad recibida" color="pink" />
          </div>
        </div>
      </section>

      {proyectos.success && <ExploradorProyectos proyectos={proyectos.proyectos} titulo="Todos los proyectos" />}
    </div>
  );
}
