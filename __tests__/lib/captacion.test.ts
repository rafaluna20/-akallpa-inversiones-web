import { estadoDeCaptacion } from '@/lib/captacion';
import type { ProyectoResumen } from '@/lib/types';

const base = { estado: 'captando', porcentaje_recaudado: 40, plazo_vencido: false, capital_objetivo: 100000, capital_aportado: 40000 } as Pick<
  ProyectoResumen,
  'estado' | 'porcentaje_recaudado' | 'plazo_vencido' | 'capital_objetivo' | 'capital_aportado'
>;

describe('estadoDeCaptacion', () => {
  test('captando, con plazo y sin completar: se puede invertir', () => {
    const e = estadoDeCaptacion(base);
    expect(e.puedeInvertir).toBe(true);
    expect(e.tono).toBe('abierto');
    expect(e.falta).toBe(60000);
    expect(e.cierre).toBeNull();
  });

  test('meta alcanzada: cupos agotados aunque el plazo esté vigente', () => {
    const e = estadoDeCaptacion({ ...base, porcentaje_recaudado: 100, capital_aportado: 100000 });
    expect(e.puedeInvertir).toBe(false);
    expect(e.completo).toBe(true);
    expect(e.tono).toBe('completo');
    expect(e.cierre?.titulo).toBe('Cupos agotados');
    expect(e.falta).toBe(0);
  });

  test('plazo vencido sin completar: no se puede invertir', () => {
    const e = estadoDeCaptacion({ ...base, plazo_vencido: true });
    expect(e.puedeInvertir).toBe(false);
    expect(e.vencido).toBe(true);
    expect(e.tono).toBe('vencido');
    expect(e.cierre?.titulo).toBe('Plazo vencido');
  });

  test('completo y vencido a la vez se considera completo (la meta se logró a tiempo)', () => {
    const e = estadoDeCaptacion({ ...base, porcentaje_recaudado: 100, capital_aportado: 100000, plazo_vencido: true });
    expect(e.completo).toBe(true);
    expect(e.vencido).toBe(false);
  });

  test.each([
    ['en_ejecucion', 'En ejecución'],
    ['liquidando', 'En liquidación'],
    ['liquidado', 'Proyecto finalizado'],
  ])('estado %s: no admite aportes y lo explica', (estado, titulo) => {
    const e = estadoDeCaptacion({ ...base, estado: estado as ProyectoResumen['estado'] });
    expect(e.puedeInvertir).toBe(false);
    expect(e.tono).toBe('cerrado');
    expect(e.cierre?.titulo).toBe(titulo);
  });

  test('un estado desconocido se trata como cerrado, nunca como abierto', () => {
    const e = estadoDeCaptacion({ ...base, estado: 'algo_raro' as ProyectoResumen['estado'] });
    expect(e.puedeInvertir).toBe(false);
  });

  test('lo que falta nunca es negativo (sobrefinanciado por redondeos)', () => {
    expect(estadoDeCaptacion({ ...base, capital_aportado: 100001 }).falta).toBe(0);
  });
});
