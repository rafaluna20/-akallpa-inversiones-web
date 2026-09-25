import { ES_ENTERO_POSITIVO, respuestaDeArchivo, respuestaError } from '@/lib/adjuntos';
import { llamar } from '@/lib/odoo';
import { leerToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface Archivo {
  nombre: string;
  mimetype: string;
  datos: string;
}

/** Foto de un avance de obra publicado. */
export async function GET(request: Request) {
  const token = leerToken();
  if (!token) return respuestaError(401, 'No autorizado.');

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!ES_ENTERO_POSITIVO.test(id)) return respuestaError(400, 'Solicitud inválida.');

  const r = await llamar<Archivo>('adjunto', { id: Number(id) }, token);
  if (!r.success) {
    if (r.code === 'no_autorizado') return respuestaError(401, 'No autorizado.');
    if (r.code === 'no_encontrado') return respuestaError(404, 'Archivo no encontrado.');
    return respuestaError(502, 'El servicio no está disponible.');
  }
  return respuestaDeArchivo(r.nombre, r.mimetype, r.datos);
}
