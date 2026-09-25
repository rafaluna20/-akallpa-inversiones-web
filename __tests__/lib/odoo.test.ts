/**
 * @jest-environment node
 */
import { ERROR_SERVICIO, llamar } from '@/lib/odoo';

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  process.env.ODOO_URL = 'http://odoo.test/';
  process.env.ODOO_DB = 'mi_bd';
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => jest.restoreAllMocks());

const respuesta = (cuerpo: unknown, ok = true, estado = 200) => ({ ok, status: estado, json: async () => cuerpo });

describe('llamar (cliente de la API de Odoo)', () => {
  test('envía JSON-RPC con el token y la base de datos, y devuelve el resultado', async () => {
    fetchMock.mockResolvedValue(respuesta({ jsonrpc: '2.0', result: { success: true, dato: 1 } }));

    const r = await llamar<{ dato: number }>('me', { a: 1 }, 'TOKEN');

    expect(r).toEqual({ success: true, dato: 1 });
    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe('http://odoo.test/api/inv/me?db=mi_bd'); // sin doble barra
    expect(opciones.headers.Authorization).toBe('Bearer TOKEN');
    expect(JSON.parse(opciones.body)).toEqual({ jsonrpc: '2.0', method: 'call', params: { a: 1 } });
    expect(opciones.cache).toBe('no-store');
  });

  test('sin token no manda cabecera Authorization', async () => {
    fetchMock.mockResolvedValue(respuesta({ result: { success: true } }));
    await llamar('auth/login', {});
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test('un error de negocio de la API pasa tal cual', async () => {
    const error = { success: false, error: 'Saldo insuficiente.', code: 'saldo' };
    fetchMock.mockResolvedValue(respuesta({ result: error }));
    expect(await llamar('aporte/crear', {}, 't')).toEqual(error);
  });

  test('un error JSON-RPC de Odoo NO se filtra al usuario', async () => {
    fetchMock.mockResolvedValue(
      respuesta({ error: { message: 'Traceback (most recent call last) secreto', data: { message: 'detalle interno' } } })
    );
    const r = await llamar('me', {}, 't');
    expect(r).toEqual(ERROR_SERVICIO);
    expect(JSON.stringify(r)).not.toMatch(/Traceback|secreto|interno/);
  });

  test.each([
    ['respuesta sin result', {}],
    ['result que no es objeto', { result: 'hola' }],
    ['result sin success', { result: { dato: 1 } }],
    ['success que no es booleano', { result: { success: 'si' } }],
  ])('formato inesperado (%s) → error de servicio', async (_nombre, cuerpo) => {
    fetchMock.mockResolvedValue(respuesta(cuerpo));
    expect(await llamar('me', {}, 't')).toEqual(ERROR_SERVICIO);
  });

  test('una respuesta que no es JSON (por ejemplo una página de error 502) → error de servicio', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError('no json');
      },
    });
    expect(await llamar('me', {}, 't')).toEqual(ERROR_SERVICIO);
  });

  test('error de red → error de servicio', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));
    expect(await llamar('me', {}, 't')).toEqual(ERROR_SERVICIO);
  });

  test('tiempo de espera agotado → error de servicio', async () => {
    fetchMock.mockImplementation(
      (_url: string, opciones: { signal: AbortSignal }) =>
        new Promise((_resolver, rechazar) => {
          opciones.signal.addEventListener('abort', () => rechazar(Object.assign(new Error('abortado'), { name: 'AbortError' })));
        })
    );
    jest.useFakeTimers();
    const pendiente = llamar('me', {}, 't');
    await jest.advanceTimersByTimeAsync(16_000);
    expect(await pendiente).toEqual(ERROR_SERVICIO);
    jest.useRealTimers();
  });

  test('sin configuración no intenta llamar', async () => {
    delete process.env.ODOO_URL;
    expect(await llamar('me', {}, 't')).toEqual(ERROR_SERVICIO);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('la base de datos se codifica en la URL', async () => {
    process.env.ODOO_DB = 'a b&c';
    fetchMock.mockResolvedValue(respuesta({ result: { success: true } }));
    await llamar('me', {}, 't');
    expect(fetchMock.mock.calls[0][0]).toBe('http://odoo.test/api/inv/me?db=a%20b%26c');
  });
});
