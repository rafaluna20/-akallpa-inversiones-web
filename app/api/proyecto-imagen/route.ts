import { ES_ENTERO_POSITIVO, respuestaDeArchivo, respuestaError } from '@/lib/adjuntos';
import { llamar } from '@/lib/odoo';
import { leerToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface Imagen {
  mimetype: string;
  datos: string;
}

/** Imagen de portada de un proyecto publicado. Exige sesión y pasa por el servidor: nunca se llama a Odoo desde el navegador. */
export async function GET(request: Request) {
  const token = leerToken();
  if (!token) return respuestaError(401, 'No autorizado.');

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!ES_ENTERO_POSITIVO.test(id)) return respuestaError(400, 'Solicitud inválida.');

  const r = await llamar<Imagen>('proyecto/imagen', { id: Number(id) }, token);
  if (!r.success) {
    if (r.code === 'no_autorizado') return respuestaError(401, 'No autorizado.');
    if (r.code === 'no_encontrado') return respuestaError(404, 'Imagen no encontrada.');
    return respuestaError(502, 'El servicio no está disponible.');
  }
  return respuestaDeArchivo(`proyecto-${id}`, r.mimetype, r.datos);
}
