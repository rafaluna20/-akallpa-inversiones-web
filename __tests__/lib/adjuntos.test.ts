/**
 * @jest-environment node
 */
import { ES_ENTERO_POSITIVO, respuestaDeArchivo, respuestaError } from '@/lib/adjuntos';

const b64 = (texto: string) => Buffer.from(texto).toString('base64');

describe('respuestaDeArchivo', () => {
  test('un PDF se muestra en línea con cabeceras que impiden ejecutarlo', async () => {
    const r = respuestaDeArchivo('factura F001-1.pdf', 'application/pdf', b64('%PDF'));
    expect(r.headers.get('Content-Type')).toBe('application/pdf');
    expect(r.headers.get('Content-Disposition')).toBe('inline; filename="factura_F001-1.pdf"');
    expect(r.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(r.headers.get('Cache-Control')).toBe('private, no-store');
    expect(r.headers.get('Content-Security-Policy')).toContain('sandbox');
    expect(Buffer.from(await r.arrayBuffer()).toString()).toBe('%PDF');
  });

  test.each(['text/html', 'image/svg+xml', 'application/javascript', 'application/x-msdownload'])(
    '%s nunca se interpreta en el navegador: se descarga como binario',
    (tipo) => {
      const r = respuestaDeArchivo('x.bin', tipo, b64('<script>alert(1)</script>'));
      expect(r.headers.get('Content-Type')).toBe('application/octet-stream');
      expect(r.headers.get('Content-Disposition')).toMatch(/^attachment;/);
    }
  );

  test('el nombre se sanea (sin comillas ni saltos de línea que inyecten cabeceras)', () => {
    const r = respuestaDeArchivo('a"; filename=evil\r\nSet-Cookie: x=1.pdf', 'application/pdf', b64('x'));
    const disposicion = r.headers.get('Content-Disposition') ?? '';
    expect(disposicion).not.toMatch(/[\r\n]/);
    expect(disposicion.match(/"/g)).toHaveLength(2);
    expect(r.headers.get('Set-Cookie')).toBeNull();
  });
});

describe('respuestaError y validación de parámetros', () => {
  test('respuestaError devuelve JSON sin caché', async () => {
    const r = respuestaError(404, 'No existe.');
    expect(r.status).toBe(404);
    expect(await r.json()).toEqual({ error: 'No existe.' });
    expect(r.headers.get('Cache-Control')).toBe('no-store');
  });

  test('solo enteros positivos de hasta 12 dígitos', () => {
    ['1', '42', '999999999999'].forEach((v) => expect(v).toMatch(ES_ENTERO_POSITIVO));
    ['', '-1', '1.5', '1e3', 'abc', '1 or 1=1', '../etc', '1234567890123'].forEach((v) => expect(v).not.toMatch(ES_ENTERO_POSITIVO));
  });
});
