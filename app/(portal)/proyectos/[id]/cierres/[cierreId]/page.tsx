import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { FacturasTabla, RubrosBarras } from '@/components/proyectos/CierreComponentes';
import { Alert, Card, PageTitle, Stat } from '@/components/ui/primitives';
import { llamarAutenticado } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import { formatearFecha, formatearMoneda, formatearPorcentaje } from '@/lib/format';
import type { CierreDetalle } from '@/lib/types';

export const metadata: Metadata = { title: 'Cierre mensual' };

export default async function CierrePage({ params }: { params: { id: string; cierreId: string } }) {
  if (!/^\d+$/.test(params.id) || !/^\d+$/.test(params.cierreId)) notFound();
  const r = await llamarAutenticado<{ cierre: CierreDetalle }>('cierre', { id: Number(params.cierreId) });
  if (!r.success) {
    if (r.code === 'no_encontrado') notFound();
    return <Alert tipo="error">{mensajeDeError(r)}</Alert>;
  }
  const c = r.cierre;

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/proyectos/${params.id}`} prefetch={false} className="text-sm text-slate-400 hover:text-white">← {c.proyecto}</Link>
        <div className="mt-3">
          <PageTitle titulo={`Cierre al ${formatearFecha(c.periodo_fin)}`} subtitulo={c.proyecto} />
        </div>
      </div>

      <section aria-label="Resumen del cierre" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat etiqueta="Ventas" valor={formatearMoneda(c.total_ventas, c.moneda)} tono={c.total_ventas > 0 ? 'verde' : undefined} />
        <Stat etiqueta="Costos" valor={formatearMoneda(c.total_costos, c.moneda)} />
        <Stat etiqueta="Resultado" valor={formatearMoneda(c.resultado, c.moneda)} tono={c.resultado >= 0 ? 'verde' : 'rojo'} />
        <Stat etiqueta="Avance de obra" valor={formatearPorcentaje(c.avance_pct, 0)} />
      </section>

      {c.notas && (
        <Card className="p-5">
          <h2 className="mb-1 font-display text-lg font-semibold text-white">Comentario de Akallpa</h2>
          <p className="whitespace-pre-line text-sm text-slate-300">{c.notas}</p>
        </Card>
      )}

      <section aria-labelledby="rubros">
        <h2 id="rubros" className="mb-4 font-display text-xl font-semibold text-white">Costos por rubro</h2>
        <Card>
          <RubrosBarras rubros={c.rubros} total={c.total_costos} moneda={c.moneda} />
        </Card>
      </section>

      <section aria-labelledby="facturas">
        <h2 id="facturas" className="mb-2 font-display text-xl font-semibold text-white">Detalle de facturas</h2>
        <p className="mb-4 text-sm text-slate-500">
          Se muestra la parte de cada factura que corresponde a este proyecto. El comprobante solo está disponible cuando toda la factura es del proyecto.
        </p>
        <FacturasTabla facturas={c.facturas} cierreId={c.id} moneda={c.moneda} />
      </section>
    </div>
  );
}
