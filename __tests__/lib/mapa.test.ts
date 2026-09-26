import { calcularEncuadre, CENTRO_PERU, coincideConFiltro, coordenadasValidas, enlaceDeMapa, separarPorUbicacion } from '@/lib/mapa';
import type { ProyectoResumen } from '@/lib/types';

const proyecto = (id: number, coordenadas: ProyectoResumen['coordenadas']): ProyectoResumen =>
  ({ id, nombre: `P${id}`, estado: 'captando', coordenadas } as ProyectoResumen);

describe('coordenadasValidas', () => {
  test('acepta posiciones reales, incluido el ecuador y el meridiano 0', () => {
    expect(coordenadasValidas({ lat: -12.04, lng: -77.04 })).toBe(true);
    expect(coordenadasValidas({ lat: 0, lng: -77 })).toBe(true);
  });

  test('rechaza nulos, fuera de rango y valores no numéricos', () => {
    expect(coordenadasValidas(null)).toBe(false);
    expect(coordenadasValidas(undefined)).toBe(false);
    expect(coordenadasValidas({ lat: 95, lng: 10 })).toBe(false);
    expect(coordenadasValidas({ lat: 10, lng: -181 })).toBe(false);
    expect(coordenadasValidas({ lat: NaN, lng: 10 })).toBe(false);
    expect(coordenadasValidas({ lat: 10, lng: Infinity })).toBe(false);
  });
});

describe('separarPorUbicacion', () => {
  test('los proyectos sin posición (o con una inválida) van aparte, no se pierden', () => {
    const r = separarPorUbicacion([proyecto(1, { lat: -12, lng: -77 }), proyecto(2, null), proyecto(3, { lat: 999, lng: 0 })]);
    expect(r.ubicados.map((p) => p.id)).toEqual([1]);
    expect(r.sinUbicar.map((p) => p.id)).toEqual([2, 3]);
  });
});

describe('coincideConFiltro', () => {
  test('todos deja pasar todo y "en obra" agrupa ejecución y liquidación', () => {
    for (const e of ['captando', 'en_ejecucion', 'liquidando', 'liquidado'] as const) expect(coincideConFiltro(e, 'todos')).toBe(true);
    expect(coincideConFiltro('en_ejecucion', 'en_obra')).toBe(true);
    expect(coincideConFiltro('liquidando', 'en_obra')).toBe(true);
    expect(coincideConFiltro('captando', 'en_obra')).toBe(false);
    expect(coincideConFiltro('liquidado', 'liquidado')).toBe(true);
    expect(coincideConFiltro('captando', 'liquidado')).toBe(false);
  });
});

describe('calcularEncuadre', () => {
  test('sin puntos centra en Perú', () => {
    expect(calcularEncuadre([])).toEqual({ centro: CENTRO_PERU, limites: null });
  });

  test('un solo punto (o varios idénticos) se centra sin límites, para no acercar al infinito', () => {
    expect(calcularEncuadre([{ lat: -12, lng: -77 }]).limites).toBeNull();
    expect(calcularEncuadre([{ lat: -12, lng: -77 }, { lat: -12, lng: -77 }]).limites).toBeNull();
  });

  test('varios puntos dan las esquinas sur-oeste y nor-este', () => {
    const r = calcularEncuadre([{ lat: -12, lng: -77 }, { lat: -11, lng: -76 }, { lat: -13, lng: -78 }]);
    expect(r.limites).toEqual([[-13, -78], [-11, -76]]);
    expect(r.centro).toEqual({ lat: -12, lng: -77 });
  });
});

describe('enlaceDeMapa', () => {
  test('arma la búsqueda por latitud y longitud', () => {
    expect(enlaceDeMapa({ lat: -12.5, lng: -77.25 })).toBe('https://www.google.com/maps/search/?api=1&query=-12.5,-77.25');
  });
});
