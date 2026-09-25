import type { Metadata } from 'next';

import { ProyectoCard } from '@/components/proyectos/ProyectoCard';
import { Alert, EmptyState, PageTitle } from '@/components/ui/primitives';
import { llamarAutenticado } from '@/lib/auth';
import { mensajeDeError } from '@/lib/errores';
import type { ProyectoResumen } from '@/lib/types';

export const metadata: Metadata = { title: 'Proyectos' };

export default async function ProyectosPage() {
  const r = await llamarAutenticado<{ proyectos: ProyectoResumen[] }>('proyectos');
  return (
    <div>
      <PageTitle titulo="Proyectos" subtitulo="Obras de Akallpa abiertas a inversionistas y en ejecución." />
      {!r.success ? (
        <Alert tipo="error">{mensajeDeError(r)}</Alert>
      ) : r.proyectos.length === 0 ? (
        <EmptyState titulo="No hay proyectos publicados por ahora" />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {r.proyectos.map((p) => (
            <ProyectoCard key={p.id} proyecto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
