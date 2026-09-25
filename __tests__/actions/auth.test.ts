/**
 * @jest-environment node
 */
import { loginAction, logoutAction } from '@/app/actions/auth';
import { llamar } from '@/lib/odoo';
import { borrarToken, guardarToken, leerToken } from '@/lib/session';

jest.mock('next/navigation', () => ({
  redirect: jest.fn((destino: string) => {
    throw new Error(`NEXT_REDIRECT:${destino}`);
  }),
}));
jest.mock('@/lib/odoo');
jest.mock('@/lib/session');

const llamarMock = llamar as jest.MockedFunction<typeof llamar>;

function formulario(datos: Record<string, string>) {
  const f = new FormData();
  Object.entries(datos).forEach(([k, v]) => f.set(k, v));
  return f;
}

beforeEach(() => jest.clearAllMocks());

describe('loginAction', () => {
  test('con credenciales válidas guarda el token en la cookie y redirige al panel', async () => {
    llamarMock.mockResolvedValue({ success: true, token: 'JWT', expires_in: 7200 } as never);
    await expect(loginAction({}, formulario({ login: ' a@b.com ', password: 'secreta' }))).rejects.toThrow('NEXT_REDIRECT:/');
    expect(llamarMock).toHaveBeenCalledWith('auth/login', { login: 'a@b.com', password: 'secreta' });
    expect(guardarToken).toHaveBeenCalledWith('JWT', 7200);
  });

  test('con credenciales incorrectas devuelve el mensaje y NO guarda nada', async () => {
    llamarMock.mockResolvedValue({ success: false, error: 'Usuario o contraseña incorrectos.', code: 'credenciales' });
    const r = await loginAction({}, formulario({ login: 'a@b.com', password: 'mala' }));
    expect(r).toEqual({ error: 'Correo o contraseña incorrectos.' });
    expect(guardarToken).not.toHaveBeenCalled();
  });

  test.each([
    ['limite', 'Demasiados intentos'],
    ['servicio', 'servicio no está disponible'],
  ])('traduce el código %s', async (code, texto) => {
    llamarMock.mockResolvedValue({ success: false, error: 'x', code });
    const r = await loginAction({}, formulario({ login: 'a@b.com', password: 'p' }));
    expect(r.error).toContain(texto);
  });

  test.each([
    [{ login: '', password: 'x' }, 'correo'],
    [{ login: 'a@b.com', password: '' }, 'contraseña'],
    [{}, ''],
  ])('valida la entrada antes de llamar a Odoo: %j', async (datos, palabra) => {
    const r = await loginAction({}, formulario(datos));
    expect(r.error).toBeTruthy();
    if (palabra) expect(r.error?.toLowerCase()).toContain(palabra);
    expect(llamarMock).not.toHaveBeenCalled();
  });
});

describe('logoutAction', () => {
  test('invalida el token en Odoo, borra la cookie y redirige al login', async () => {
    (leerToken as jest.Mock).mockReturnValue('JWT');
    llamarMock.mockResolvedValue({ success: true } as never);
    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(llamarMock).toHaveBeenCalledWith('auth/logout', {}, 'JWT');
    expect(borrarToken).toHaveBeenCalled();
  });

  test('sin token igual borra la cookie y redirige', async () => {
    (leerToken as jest.Mock).mockReturnValue(undefined);
    await expect(logoutAction()).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(llamarMock).not.toHaveBeenCalled();
    expect(borrarToken).toHaveBeenCalled();
  });
});
