import type { Metadata } from 'next';
import Link from 'next/link';

import { ProyectoCard } from '@/components/proyectos/ProyectoCard';
import { Alert, Badge, Card, EmptyState, PageTitle, Stat, tonoDeEstado } from '@/components/ui/primitives';
import { llamarAutenticado, requerirSesion } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import { ETIQUETA_ESTADO_PROYECTO, formatearMoneda, formatearPorcentaje } from '@/lib/format';
import type { EstadoCuenta, Participacion, ProyectoResumen } from '@/lib/types';

export const metadata: Metadata = { title: 'Panel' };

export default async function PanelPage() {
  const { me } = await requerirSesion();
  const [estado, participaciones, proyectos] = await Promise.all([
    llamarAutenticado<EstadoCuenta>('estado_cuenta'),
    llamarAutenticado<{ participaciones: Participacion[] }>('participaciones'),
    llamarAutenticado<{ proyectos: ProyectoResumen[] }>('proyectos'),
  ]);

  const error = [estado, participaciones, proyectos].find((r) => !r.success);
  const saldo = me.cuentas[0];
  const moneda = saldo?.moneda ?? 'PEN';

  const filas = estado.success ? estado.proyectos : [];
  const enCurso = filas.filter((p) => p.estado !== 'liquidado' && p.estado !== 'cancelado');
  const totalAportado = enCurso.reduce((s, p) => s + p.aportado, 0);
  const utilidad = filas.reduce((s, p) => s + p.utilidad, 0);
  const devuelto = filas.reduce((s, p) => s + p.capital_devuelto, 0);

  const misProyectosIds = new Set((participaciones.success ? participaciones.participaciones : []).map((p) => p.proyecto_id));
  const oportunidades = (proyectos.success ? proyectos.proyectos : []).filter((p) => p.estado === 'captando' && !misProyectosIds.has(p.id));

  return (
    <div className="space-y-8">
      <PageTitle titulo={`Hola, ${me.partner.nombre.split(' ')[0]}`} subtitulo="Este es el resumen de tus inversiones con Akallpa." />

      {error && !error.success && <Alert tipo="error">{mensajeDeError(error)}</Alert>}

      <section aria-label="Resumen" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat etiqueta="Saldo disponible" valor={formatearMoneda(saldo?.saldo ?? 0, moneda)} />
        <Stat etiqueta="Capital en proyectos" valor={formatearMoneda(totalAportado, moneda)} />
        <Stat etiqueta="Utilidad recibida" valor={formatearMoneda(utilidad, moneda)} tono={utilidad > 0 ? 'verde' : undefined} />
        <Stat etiqueta="Capital devuelto" valor={formatearMoneda(devuelto, moneda)} />
      </section>

      <section aria-labelledby="mis-proyectos">
        <h2 id="mis-proyectos" className="mb-4 font-display text-xl font-semibold text-white">Mis proyectos</h2>
        {participaciones.success && participaciones.participaciones.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {participaciones.participaciones.map((p) => (
              <Card key={p.proyecto_id} className="p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Link href={`/proyectos/${p.proyecto_id}`} prefetch={false} className="font-display text-lg font-semibold text-white hover:text-blue-300">
                    {p.proyecto}
                  </Link>
                  <Badge tono={tonoDeEstado(p.estado_proyecto)}>{ETIQUETA_ESTADO_PROYECTO[p.estado_proyecto] ?? p.estado_proyecto}</Badge>
                </div>
                <p className="font-mono text-2xl font-bold text-white">{formatearMoneda(p.aportado, p.moneda)}</p>
                <p className="mt-1 text-sm text-slate-400">{formatearPorcentaje(p.porcentaje, 2)} del capital del proyecto</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState titulo="Todavía no participas en ningún proyecto" descripcion="Revisa las oportunidades abiertas más abajo." />
        )}
      </section>

      <section aria-labelledby="oportunidades">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="oportunidades" className="font-display text-xl font-semibold text-white">Oportunidades abiertas</h2>
          <Link href="/proyectos" prefetch={false} className="text-sm text-blue-400 hover:underline">Ver todos</Link>
        </div>
        {oportunidades.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {oportunidades.slice(0, 4).map((p) => (
              <ProyectoCard key={p.id} proyecto={p} />
            ))}
          </div>
        ) : (
          <EmptyState titulo="No hay proyectos abiertos por ahora" />
        )}
      </section>
    </div>
  );
}
