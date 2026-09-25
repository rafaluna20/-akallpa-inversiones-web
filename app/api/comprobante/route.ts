import { ES_ENTERO_POSITIVO, respuestaDeArchivo, respuestaError } from '@/lib/adjuntos';
import { llamar } from '@/lib/odoo';
import { leerToken } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface Archivo {
  nombre: string;
  mimetype: string;
  datos: string;
}

/** Comprobante (PDF) de una factura de un cierre publicado. Odoo verifica que el inversionista participe y que la factura sea 100 % del proyecto. */
export async function GET(request: Request) {
  const token = leerToken();
  if (!token) return respuestaError(401, 'No autorizado.');

  const { searchParams } = new URL(request.url);
  const cierre = searchParams.get('cierre') ?? '';
  const move = searchParams.get('move') ?? '';
  if (!ES_ENTERO_POSITIVO.test(cierre) || !ES_ENTERO_POSITIVO.test(move)) return respuestaError(400, 'Solicitud inválida.');

  const r = await llamar<Archivo>('comprobante', { cierre_id: Number(cierre), move_id: Number(move) }, token);
  if (!r.success) {
    if (r.code === 'no_autorizado') return respuestaError(401, 'No autorizado.');
    if (r.code === 'no_encontrado') return respuestaError(404, 'Comprobante no disponible.');
    return respuestaError(502, 'El servicio no está disponible.');
  }
  return respuestaDeArchivo(r.nombre, r.mimetype, r.datos);
}
