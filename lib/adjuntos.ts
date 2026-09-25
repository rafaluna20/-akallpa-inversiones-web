/** Respuesta binaria de un archivo que Odoo entrega en base64 (comprobantes y fotos de avance). */

const TIPOS_SEGUROS = /^(application\/pdf|image\/(png|jpeg|webp|gif))$/;

function nombreSeguro(nombre: string): string {
  return nombre.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 100) || 'archivo';
}

export function respuestaDeArchivo(nombre: string, mimetype: string, base64: string): Response {
  const seguro = TIPOS_SEGUROS.test(mimetype);
  const bytes = Buffer.from(base64, 'base64');
  return new Response(bytes, {
    status: 200,
    headers: {
      // Un tipo desconocido se descarga como binario genérico: nunca se interpreta en el navegador.
      'Content-Type': seguro ? mimetype : 'application/octet-stream',
      'Content-Disposition': `${seguro ? 'inline' : 'attachment'}; filename="${nombreSeguro(nombre)}"`,
      'Content-Length': String(bytes.length),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    },
  });
}

export function respuestaError(estado: 400 | 401 | 404 | 502, mensaje: string): Response {
  return Response.json({ error: mensaje }, { status: estado, headers: { 'Cache-Control': 'no-store' } });
}

export const ES_ENTERO_POSITIVO = /^\d{1,12}$/;
