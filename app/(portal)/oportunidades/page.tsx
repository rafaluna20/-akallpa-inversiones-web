import type { Metadata } from 'next';

import { ExploradorProyectos } from '@/components/proyectos/ExploradorProyectos';
import { Alert } from '@/components/ui/primitives';
import { obtenerProyectos } from '@/lib/datos';
import { mensajeDeError } from '@/lib/errores';

export const metadata: Metadata = { title: 'Oportunidades' };

/** Proyectos que están captando aportes ahora. */
export default async function OportunidadesPage() {
  const r = await obtenerProyectos();
  if (!r.success) return <Alert tipo="error">{mensajeDeError(r)}</Alert>;
  return <ExploradorProyectos proyectos={r.proyectos} titulo="Oportunidades" estadoFijo="captando" />;
}
