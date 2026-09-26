import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaArrowLeft, FaBuilding } from 'react-icons/fa';

import { AvanceTimeline } from '@/components/proyectos/AvanceTimeline';
import { BarraDatos } from '@/components/proyectos/BarraDatos';
import { CierresLista } from '@/components/proyectos/CierreComponentes';
import { PanelInversion } from '@/components/proyectos/PanelInversion';
import { insigniaDeEstado } from '@/components/proyectos/ProyectoCard';
import { TableroObra } from '@/components/proyectos/TableroObra';
import { TabsProyecto } from '@/components/proyectos/TabsProyecto';
import { Alert, EmptyState } from '@/components/ui/primitives';
import { llamarAutenticado } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import { ETIQUETA_ESTADO_PROYECTO, ETIQUETA_TIPO_PROYECTO, formatearFecha, formatearMonto, formatearPorcentaje } from '@/lib/format';
import type { ProyectoDetalle, Tablero } from '@/lib/types';

export const metadata: Metadata = { title: 'Proyecto' };

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-800/50 p-4">
      <p className="mb-1 text-sm text-gray-400">{etiqueta}</p>
      <p className="text-lg font-semibold text-white">{valor}</p>
    </div>
  );
}

export default async function ProyectoPage({ params }: { params: { id: string } }) {
  if (!/^\d+$/.test(params.id)) notFound();
  const [r, tab] = await Promise.all([
    llamarAutenticado<{ proyecto: ProyectoDetalle }>('proyecto', { id: Number(params.id) }),
    llamarAutenticado<Tablero>('proyecto/tablero', { id: Number(params.id) }),
  ]);
  if (!r.success) {
    if (r.code === 'no_encontrado') notFound();
    return <Alert tipo="error">{mensajeDeError(r)}</Alert>;
  }
  const p = r.proyecto;
  const participa = p.mi_participacion !== null;
  const insignia = insigniaDeEstado(p);

  const pestanas = [
    {
      id: 'tablero',
      etiqueta: 'Tablero de obra',
      contenido: tab.success ? <TableroObra tablero={tab} /> : <Alert tipo="error">{mensajeDeError(tab)}</Alert>,
    },
    {
      id: 'descripcion',
      etiqueta: 'Descripción',
      contenido: p.descripcion ? (
        <p className="whitespace-pre-line text-base leading-relaxed text-gray-300">{p.descripcion}</p>
      ) : (
        <EmptyState titulo="Akallpa aún no publicó la descripción" descripcion="Cuando esté disponible la verás aquí." />
      ),
    },
    {
      id: 'avance',
      etiqueta: 'Avance de obra',
      insignia: p.avances.length,
      contenido: <AvanceTimeline avances={p.avances} />,
    },
    {
      id: 'cierres',
      etiqueta: 'Cierres mensuales',
      insignia: participa ? p.cierres.length : undefined,
      contenido: participa ? (
        <CierresLista proyectoId={p.id} cierres={p.cierres} moneda={p.moneda} />
      ) : (
        <Alert tipo="info">El detalle financiero (costos por rubro y facturas) está disponible para quienes participan en el proyecto.</Alert>
      ),
    },
    {
      id: 'detalles',
      etiqueta: 'Detalles',
      contenido: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Dato etiqueta="Tipo" valor={p.tipo ? ETIQUETA_TIPO_PROYECTO[p.tipo] ?? p.tipo : 'Sin definir'} />
          <Dato etiqueta="Estado" valor={ETIQUETA_ESTADO_PROYECTO[p.estado] ?? p.estado} />
          <Dato etiqueta="Empresa" valor={p.empresa} />
          <Dato etiqueta="Ubicación" valor={p.ubicacion ?? 'Sin definir'} />
          <Dato etiqueta="Comisión del gestor" valor={formatearPorcentaje(p.comision_gestor, 0)} />
          <Dato etiqueta="Capital mínimo para iniciar" valor={p.capital_minimo ? formatearMonto(p.capital_minimo, p.moneda) : 'Sin mínimo'} />
          <Dato etiqueta="Capital objetivo" valor={formatearMonto(p.capital_objetivo, p.moneda)} />
          <Dato etiqueta="Fecha límite de captación" valor={formatearFecha(p.fecha_limite)} />
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <nav className="mb-6" aria-label="Migas de pan">
        <Link href="/proyectos" prefetch={false} className="group inline-flex items-center gap-2 text-blue-400 transition hover:text-blue-300">
          <FaArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" aria-hidden />
          <span className="font-medium">Volver a Proyectos</span>
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="space-y-6">
            <div className="relative h-96 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
              {p.tiene_imagen ? (
                // eslint-disable-next-line @next/next/no-img-element -- la imagen se sirve por un route handler autenticado
                <img src={`/api/proyecto-imagen?id=${p.id}`} alt={`Portada de ${p.nombre}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-600">
                  <FaBuilding size={64} aria-hidden />
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className={`inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-bold shadow backdrop-blur-md ${insignia.clase}`}>{insignia.texto}</span>
                {p.tipo && (
                  <span className="rounded-full border border-blue-500/20 bg-slate-900/80 px-3 py-1 text-xs font-bold uppercase text-blue-300 backdrop-blur-sm">
                    {ETIQUETA_TIPO_PROYECTO[p.tipo] ?? p.tipo}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h1 className="mb-3 font-display text-3xl font-bold leading-tight text-white lg:text-5xl">{p.nombre}</h1>
              <p className="flex items-center gap-2 text-lg text-gray-400">
                <FaBuilding className="text-xl" aria-hidden />
                {p.empresa}
              </p>
            </div>

            <BarraDatos proyecto={p} />
          </section>

          <section className="rounded-[20px] border border-[#4b4b4b] bg-[#13161c] p-6 text-gray-100 shadow-md">
            <TabsProyecto pestanas={pestanas} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Captación">
          <PanelInversion proyecto={p} />
        </aside>
      </div>
    </div>
  );
}
