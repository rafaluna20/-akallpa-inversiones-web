/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { config, middleware } from '@/middleware';

const pedir = (ruta: string, cookie?: string) =>
  middleware(new NextRequest(`http://localhost${ruta}`, cookie ? { headers: { cookie } } : undefined));

describe('middleware de sesión', () => {
  test.each(['/', '/proyectos', '/proyectos/5/cierres/2', '/cuenta'])('sin cookie %s redirige al login', (ruta) => {
    const r = pedir(ruta);
    expect(r.status).toBe(307);
    expect(new URL(r.headers.get('location') as string).pathname).toBe('/login');
  });

  test('el login es público', () => {
    const r = pedir('/login');
    expect(r.status).toBe(200);
    expect(r.headers.get('location')).toBeNull();
  });

  test('con cookie deja pasar', () => {
    expect(pedir('/proyectos', 'inv_token=abc').headers.get('location')).toBeNull();
  });

  test('una cookie vacía no cuenta como sesión', () => {
    expect(pedir('/', 'inv_token=').status).toBe(307);
  });

  test('las rutas /api/ sin sesión responden 401 en JSON (no redirigen)', async () => {
    const r = pedir('/api/comprobante?cierre=1&move=2');
    expect(r.status).toBe(401);
    expect(await r.json()).toEqual({ error: 'No autorizado.' });
  });

  test('otra cookie cualquiera no sirve', () => {
    expect(pedir('/', 'session=abc').status).toBe(307);
  });

  test('el matcher excluye los recursos estáticos de Next', () => {
    const patron = new RegExp(`^${config.matcher[0]}$`);
    expect(patron.test('/proyectos')).toBe(true);
    expect(patron.test('/_next/static/chunks/a.js')).toBe(false);
    expect(patron.test('/favicon.ico')).toBe(false);
  });
});
