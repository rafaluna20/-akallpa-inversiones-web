/**
 * @jest-environment node
 */
import { GET as adjunto } from '@/app/api/adjunto/route';
import { GET as comprobante } from '@/app/api/comprobante/route';
import { GET as imagenProyecto } from '@/app/api/proyecto-imagen/route';
import { llamar } from '@/lib/odoo';
import { leerToken } from '@/lib/session';

jest.mock('@/lib/odoo');
jest.mock('@/lib/session');

const llamarMock = llamar as jest.MockedFunction<typeof llamar>;
const tokenMock = leerToken as jest.Mock;
const pdf = { success: true, nombre: 'f.pdf', mimetype: 'application/pdf', datos: Buffer.from('%PDF-1.4').toString('base64') };

beforeEach(() => {
  jest.clearAllMocks();
  tokenMock.mockReturnValue('JWT');
});

describe('GET /api/comprobante', () => {
  test('sin sesión → 401 y no consulta a Odoo', async () => {
    tokenMock.mockReturnValue(undefined);
    expect((await comprobante(new Request('http://x/api/comprobante?cierre=1&move=2'))).status).toBe(401);
    expect(llamarMock).not.toHaveBeenCalled();
  });

  test.each(['', '?cierre=1', '?move=2', '?cierre=a&move=2', '?cierre=1&move=1;drop', '?cierre=-1&move=2', '?cierre=1&move=1e5'])(
    'parámetros inválidos %p → 400 sin llamar a Odoo',
    async (qs) => {
      expect((await comprobante(new Request(`http://x/api/comprobante${qs}`))).status).toBe(400);
      expect(llamarMock).not.toHaveBeenCalled();
    }
  );

  test('entrega el PDF y reenvía el token del inversionista', async () => {
    llamarMock.mockResolvedValue(pdf as never);
    const r = await comprobante(new Request('http://x/api/comprobante?cierre=3&move=9'));
    expect(llamarMock).toHaveBeenCalledWith('comprobante', { cierre_id: 3, move_id: 9 }, 'JWT');
    expect(r.status).toBe(200);
    expect(r.headers.get('Content-Type')).toBe('application/pdf');
    expect(Buffer.from(await r.arrayBuffer()).toString()).toBe('%PDF-1.4');
  });

  test.each([
    ['no_autorizado', 401],
    ['no_encontrado', 404],
    ['servicio', 502],
    ['interno', 502],
  ])('código %s → HTTP %i, sin filtrar detalles', async (code, estado) => {
    llamarMock.mockResolvedValue({ success: false, error: 'detalle interno', code });
    const r = await comprobante(new Request('http://x/api/comprobante?cierre=3&move=9'));
    expect(r.status).toBe(estado);
    expect(JSON.stringify(await r.json())).not.toContain('detalle interno');
  });
});

describe('GET /api/adjunto', () => {
  test('exige sesión y un id numérico', async () => {
    tokenMock.mockReturnValue(undefined);
    expect((await adjunto(new Request('http://x/api/adjunto?id=1'))).status).toBe(401);
    tokenMock.mockReturnValue('JWT');
    expect((await adjunto(new Request('http://x/api/adjunto?id=abc'))).status).toBe(400);
    expect((await adjunto(new Request('http://x/api/adjunto'))).status).toBe(400);
  });

  test('entrega la foto', async () => {
    llamarMock.mockResolvedValue({ success: true, nombre: 'a.png', mimetype: 'image/png', datos: Buffer.from('png').toString('base64') } as never);
    const r = await adjunto(new Request('http://x/api/adjunto?id=5'));
    expect(llamarMock).toHaveBeenCalledWith('adjunto', { id: 5 }, 'JWT');
    expect(r.headers.get('Content-Type')).toBe('image/png');
  });

  test('archivo ajeno o inexistente → 404', async () => {
    llamarMock.mockResolvedValue({ success: false, error: 'x', code: 'no_encontrado' });
    expect((await adjunto(new Request('http://x/api/adjunto?id=5'))).status).toBe(404);
  });
});

describe('GET /api/proyecto-imagen', () => {
  test('exige sesión y un id numérico sin llamar a Odoo', async () => {
    tokenMock.mockReturnValue(undefined);
    expect((await imagenProyecto(new Request('http://x/api/proyecto-imagen?id=1'))).status).toBe(401);
    tokenMock.mockReturnValue('JWT');
    for (const qs of ['', '?id=abc', '?id=-1', '?id=1;drop']) {
      expect((await imagenProyecto(new Request(`http://x/api/proyecto-imagen${qs}`))).status).toBe(400);
    }
    expect(llamarMock).not.toHaveBeenCalled();
  });

  test('entrega la portada con el token del inversionista y cabeceras seguras', async () => {
    llamarMock.mockResolvedValue({ success: true, mimetype: 'image/png', datos: Buffer.from('png').toString('base64') } as never);
    const r = await imagenProyecto(new Request('http://x/api/proyecto-imagen?id=7'));
    expect(llamarMock).toHaveBeenCalledWith('proyecto/imagen', { id: 7 }, 'JWT');
    expect(r.headers.get('Content-Type')).toBe('image/png');
    expect(r.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  test('un proyecto no publicado o sin imagen responde 404; los errores técnicos, 502', async () => {
    llamarMock.mockResolvedValueOnce({ success: false, error: 'x', code: 'no_encontrado' });
    expect((await imagenProyecto(new Request('http://x/api/proyecto-imagen?id=7'))).status).toBe(404);
    llamarMock.mockResolvedValueOnce({ success: false, error: 'detalle interno', code: 'interno' });
    const r = await imagenProyecto(new Request('http://x/api/proyecto-imagen?id=7'));
    expect(r.status).toBe(502);
    expect(JSON.stringify(await r.json())).not.toContain('detalle interno');
  });
});

