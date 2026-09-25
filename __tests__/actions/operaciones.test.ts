/**
 * @jest-environment node
 */
import { actualizarDepositosAction, crearAporteAction, crearRetiroAction } from '@/app/actions/operaciones';
import { llamarAutenticado } from '@/lib/auth';

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/lib/auth', () => ({ llamarAutenticado: jest.fn() }));

const llamarMock = llamarAutenticado as jest.MockedFunction<typeof llamarAutenticado>;
const LLAVE = '0b0c6c7a-1d2e-4f3a-9b8c-112233445566';

function formulario(datos: Record<string, string>) {
  const f = new FormData();
  Object.entries(datos).forEach(([k, v]) => f.set(k, v));
  return f;
}
beforeEach(() => jest.clearAllMocks());

describe('crearAporteAction', () => {
  const datos = { proyectoId: '7', monto: '1 200,50', llave: LLAVE };

  test('envía a Odoo el monto ya validado (número), el proyecto y la llave de idempotencia', async () => {
    llamarMock.mockResolvedValue({ success: true, repetido: false } as never);
    const r = await crearAporteAction({}, formulario(datos));
    expect(llamarMock).toHaveBeenCalledWith('aporte/crear', { proyecto_id: 7, monto: 1200.5, llave: LLAVE });
    expect(r.ok).toBe(true);
    expect(r.mensaje).toContain('Solicitud enviada');
  });

  test('una solicitud repetida se informa como ya registrada', async () => {
    llamarMock.mockResolvedValue({ success: true, repetido: true } as never);
    expect((await crearAporteAction({}, formulario(datos))).mensaje).toContain('ya estaba registrada');
  });

  test.each([
    [{ monto: '0' }],
    [{ monto: '-5' }],
    [{ monto: 'abc' }],
    [{ monto: '1.234' }],
    [{ llave: 'x' }],
    [{ proyectoId: 'abc' }],
  ])('entradas inválidas %j no llegan a Odoo', async (cambio) => {
    const r = await crearAporteAction({}, formulario({ ...datos, ...cambio }));
    expect(r.error).toBeTruthy();
    expect(r.ok).toBeUndefined();
    expect(llamarMock).not.toHaveBeenCalled();
  });

  test('los errores de negocio se muestran tal cual; los técnicos se traducen', async () => {
    llamarMock.mockResolvedValueOnce({ success: false, error: 'El aporte supera lo que falta por captar.', code: 'negocio' });
    expect((await crearAporteAction({}, formulario(datos))).error).toBe('El aporte supera lo que falta por captar.');
    llamarMock.mockResolvedValueOnce({ success: false, error: 'x', code: 'saldo' });
    expect((await crearAporteAction({}, formulario(datos))).error).toContain('saldo suficiente');
    llamarMock.mockResolvedValueOnce({ success: false, error: 'detalle interno', code: 'interno' });
    const r = await crearAporteAction({}, formulario(datos));
    expect(r.error).not.toContain('detalle interno');
  });
});

describe('crearRetiroAction', () => {
  test('valida y envía el retiro', async () => {
    llamarMock.mockResolvedValue({ success: true, repetido: false } as never);
    const r = await crearRetiroAction({}, formulario({ monto: '300', llave: LLAVE }));
    expect(llamarMock).toHaveBeenCalledWith('retiro/crear', { monto: 300, llave: LLAVE });
    expect(r.ok).toBe(true);
  });

  test('no acepta un destino enviado por el cliente: solo monto y llave llegan a Odoo', async () => {
    llamarMock.mockResolvedValue({ success: true, repetido: false } as never);
    await crearRetiroAction({}, formulario({ monto: '300', llave: LLAVE, cuenta_destino: 'HACKER' }));
    expect(Object.keys(llamarMock.mock.calls[0][1] as object).sort()).toEqual(['llave', 'monto']);
  });

  test('monto inválido no llega a Odoo', async () => {
    const r = await crearRetiroAction({}, formulario({ monto: '0', llave: LLAVE }));
    expect(r.error).toBeTruthy();
    expect(llamarMock).not.toHaveBeenCalled();
  });
});

describe('actualizarDepositosAction', () => {
  test('pide a Odoo actualizar los depósitos y avisa cuánto se acreditó', async () => {
    llamarMock.mockResolvedValue({ success: true, acreditado: 500, saldo: 1500, moneda: 'PEN' } as never);
    const r = await actualizarDepositosAction({}, new FormData());
    expect(llamarMock).toHaveBeenCalledWith('deposito/actualizar', {});
    expect(r.ok).toBe(true);
    expect(r.mensaje).toMatch(/acreditaron/);
    expect(r.mensaje).toMatch(/500/);
  });

  test('si todavía no llegó el depósito, lo dice sin marcarlo como error', async () => {
    llamarMock.mockResolvedValue({ success: true, acreditado: 0, saldo: 1000, moneda: 'PEN' } as never);
    const r = await actualizarDepositosAction({}, new FormData());
    expect(r.ok).toBe(true);
    expect(r.mensaje).toMatch(/Todavía no vemos/);
  });

  test('los errores del banco se traducen y no filtran detalles', async () => {
    llamarMock.mockResolvedValueOnce({ success: false, error: 'detalle interno', code: 'servicio' });
    const a = await actualizarDepositosAction({}, new FormData());
    expect(a.ok).toBeUndefined();
    expect(a.error).not.toContain('detalle interno');
    llamarMock.mockResolvedValueOnce({ success: false, error: 'x', code: 'limite' });
    expect((await actualizarDepositosAction({}, new FormData())).error).toMatch(/Demasiados intentos/);
  });
});
