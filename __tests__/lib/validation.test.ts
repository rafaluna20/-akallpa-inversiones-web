import { aporteSchema, loginSchema, parsearMonto, retiroSchema } from '@/lib/validation';

const LLAVE = '0b0c6c7a-1d2e-4f3a-9b8c-112233445566';

describe('parsearMonto', () => {
  test.each([
    ['1200', 1200],
    ['1200.5', 1200.5],
    ['1200,50', 1200.5],
    ['1 200,50', 1200.5],
    ['0.01', 0.01],
  ])('acepta %s', (texto, esperado) => expect(parsearMonto(texto)).toBe(esperado));

  test.each(['', 'abc', '12.345', '-5', '1e3', '0x10', '12,3,4', ' ', '1.', '.5'])(
    'rechaza %p', (texto) => expect(parsearMonto(texto)).toBeNaN());

  test('rechaza lo que no es texto', () => {
    expect(parsearMonto(null)).toBeNaN();
    expect(parsearMonto(undefined)).toBeNaN();
    expect(parsearMonto(100)).toBeNaN();
  });
});

describe('aporteSchema', () => {
  const valido = { proyectoId: '7', monto: '150,25', llave: LLAVE };
  test('acepta datos válidos y convierte tipos', () => {
    expect(aporteSchema.parse(valido)).toEqual({ proyectoId: 7, monto: 150.25, llave: LLAVE });
  });
  test.each([
    [{ monto: '0' }, 'mayor a 0'],
    [{ monto: '0,00' }, 'mayor a 0'],
    [{ monto: 'abc' }, 'monto válido'],
    [{ monto: '10000000,01' }, 'demasiado alto'],
    [{ proyectoId: '-1' }, 'Proyecto'],
    [{ proyectoId: 'x' }, ''],
    [{ llave: 'corta' }, 'Solicitud inválida'],
    [{ llave: 'con espacios y símbolos!!' }, 'Solicitud inválida'],
    [{ llave: 'x'.repeat(65) }, 'Solicitud inválida'],
  ])('rechaza %j', (cambio, mensaje) => {
    const r = aporteSchema.safeParse({ ...valido, ...cambio });
    expect(r.success).toBe(false);
    if (!r.success && mensaje) expect(r.error.issues[0].message).toContain(mensaje);
  });
  test('un campo ausente da un mensaje claro', () => {
    const r = aporteSchema.safeParse({ proyectoId: '7', llave: LLAVE });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe('Ingresa un monto.');
  });
});

describe('retiroSchema', () => {
  test('exige monto válido y llave', () => {
    expect(retiroSchema.safeParse({ monto: '50', llave: LLAVE }).success).toBe(true);
    expect(retiroSchema.safeParse({ monto: '50', llave: '' }).success).toBe(false);
    expect(retiroSchema.safeParse({ monto: '-50', llave: LLAVE }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  test('quita espacios del correo y exige contraseña', () => {
    expect(loginSchema.parse({ login: '  a@b.com ', password: 'x' }).login).toBe('a@b.com');
    expect(loginSchema.safeParse({ login: '', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ login: 'a@b.com', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ login: 'a@b.com', password: 'x'.repeat(300) }).success).toBe(false);
  });
});
