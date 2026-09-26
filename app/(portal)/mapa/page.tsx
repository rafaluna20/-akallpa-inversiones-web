import type { Metadata } from 'next';

import { MapaProyectos } from '@/components/mapa/MapaProyectos';
import { Alert } from '@/components/ui/primitives';
import { obtenerProyectos } from '@/lib/datos';
import { mensajeDeError } from '@/lib/errores';

export const metadata: Metadata = { title: 'Mapa' };

export default async function MapaPage() {
  const r = await obtenerProyectos();
  if (!r.success) return <Alert tipo="error">{mensajeDeError(r)}</Alert>;
  return <MapaProyectos proyectos={r.proyectos} />;
}
