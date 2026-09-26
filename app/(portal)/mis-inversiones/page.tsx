import type { Metadata } from 'next';

import { ExploradorProyectos } from '@/components/proyectos/ExploradorProyectos';
import { Alert, EmptyState } from '@/components/ui/primitives';
import { obtenerEstadoCuenta, obtenerProyectos } from '@/lib/datos';
import { mensajeDeError } from '@/lib/errores';
import { formatearMonto } from '@/lib/format';

export const metadata: Metadata = { title: 'Mis inversiones' };

export default async function MisInversionesPage() {
  const [estado, proyectos] = await Promise.all([obtenerEstadoCuenta(), obtenerProyectos()]);
  if (!proyectos.success) return <Alert tipo="error">{mensajeDeError(proyectos)}</Alert>;

  const mios = proyectos.proyectos.filter((p) => p.mi_participacion);
  const filas = estado.success ? estado.proyectos : [];
  const moneda = mios[0]?.moneda ?? 'PEN';
  const aportado = filas.reduce((s, p) => s + p.aportado, 0);
  const utilidad = filas.reduce((s, p) => s + p.utilidad, 0);
  const devuelto = filas.reduce((s, p) => s + p.capital_devuelto, 0);

  if (mios.length === 0) {
    return (
      <div>
        <h2 className="mb-6 font-display text-2xl font-bold text-white md:text-3xl">Mis inversiones</h2>
        <EmptyState titulo="Todavía no participas en ningún proyecto" descripcion="Revisa las oportunidades abiertas y haz tu primer aporte." />
      </div>
    );
  }

  return (
    <div>
      <section aria-label="Resumen de mis inversiones" className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { etiqueta: 'Aportado', valor: formatearMonto(aportado, moneda), clase: 'border-blue-500/20 from-blue-500/10 to-blue-600/10 text-blue-400' },
          { etiqueta: 'Utilidad recibida', valor: formatearMonto(utilidad, moneda), clase: 'border-emerald-500/20 from-emerald-500/10 to-emerald-600/10 text-emerald-400' },
          { etiqueta: 'Capital devuelto', valor: formatearMonto(devuelto, moneda), clase: 'border-purple-500/20 from-purple-500/10 to-purple-600/10 text-purple-400' },
        ].map((t) => (
          <div key={t.etiqueta} className={`rounded-2xl border bg-gradient-to-br p-6 ${t.clase}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.etiqueta}</p>
            <p className="mt-2 font-display text-3xl font-bold">{t.valor}</p>
          </div>
        ))}
      </section>
      <ExploradorProyectos proyectos={mios} titulo="Mis inversiones" />
    </div>
  );
}
