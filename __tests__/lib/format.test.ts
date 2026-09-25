import { acotarPorcentaje, formatearFecha, formatearMoneda, formatearPorcentaje } from '@/lib/format';

describe('formatearMoneda', () => {
  test('formatea soles con dos decimales', () => {
    expect(formatearMoneda(1234.5)).toMatch(/1[\s., ]?234[.,]50/);
    expect(formatearMoneda(0)).toMatch(/0[.,]00/);
  });
  test('un valor no numérico se muestra como cero (nunca "NaN")', () => {
    expect(formatearMoneda(NaN)).not.toMatch(/NaN/);
    expect(formatearMoneda(Infinity)).not.toMatch(/Infinity/);
  });
  test('una moneda inválida no rompe la pantalla', () => {
    expect(formatearMoneda(10, 'no-es-moneda')).toContain('10.00');
  });
});

describe('formatearFecha', () => {
  test('no corre la fecha un día por la zona horaria', () => {
    expect(formatearFecha('2026-01-01')).toMatch(/^01 ene 2026$/);
    expect(formatearFecha('2026-12-31')).toMatch(/^31 dic 2026$/);
  });
  test('valores vacíos o raros', () => {
    expect(formatearFecha(null)).toBe('—');
    expect(formatearFecha(undefined)).toBe('—');
    expect(formatearFecha('texto')).toBe('texto');
  });
  test('acepta fecha y hora', () => {
    expect(formatearFecha('2026-09-25 15:30:00')).toMatch(/^25 set 2026$/); // en es-PE septiembre se abrevia "set"
  });
});

describe('porcentajes', () => {
  test('acotarPorcentaje limita a 0-100', () => {
    expect(acotarPorcentaje(-5)).toBe(0);
    expect(acotarPorcentaje(150)).toBe(100);
    expect(acotarPorcentaje(42.5)).toBe(42.5);
    expect(acotarPorcentaje(NaN)).toBe(0);
  });
  test('formatearPorcentaje', () => {
    expect(formatearPorcentaje(12.345)).toBe('12.3%');
    expect(formatearPorcentaje(12.345, 2)).toBe('12.35%');
    expect(formatearPorcentaje(NaN)).toBe('0.0%');
  });
});
