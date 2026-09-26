import { composicion, conSigno, etiquetaMes, filtrarContratos, geometriaEvolucion, tonoResultado } from '@/lib/patrimonio';
import type { Contrato, PuntoPatrimonio } from '@/lib/types';

const punto = (fecha: string, patrimonio: number, puesto: number): PuntoPatrimonio => ({ fecha, patrimonio, puesto });

describe('geometriaEvolucion', () => {
  test('con menos de dos puntos no hay evolución', () => {
    expect(geometriaEvolucion([])).toBeNull();
    expect(geometriaEvolucion([punto('2026-09-26', 100, 100)])).toBeNull();
  });

  test('los puntos quedan dentro del área y avanzan de izquierda a derecha', () => {
    const g = geometriaEvolucion([punto('2026-07-31', 1000, 1000), punto('2026-08-31', 1200, 1000), punto('2026-09-26', 1500, 1200)])!;
    for (const serie of [g.patrimonio, g.puesto]) {
      const xs = serie.map((p) => p.x);
      expect([...xs].sort((a, b) => a - b)).toEqual(xs);
      for (const p of serie) {
        expect(p.x).toBeGreaterThanOrEqual(g.margen.izq);
        expect(p.x).toBeLessThanOrEqual(g.ancho - g.margen.der);
        expect(p.y).toBeGreaterThanOrEqual(g.margen.arr - 0.001);
        expect(p.y).toBeLessThanOrEqual(g.alto - g.margen.abajo + 0.001);
      }
    }
  });

  test('un valor más alto se dibuja más arriba (y menor)', () => {
    const g = geometriaEvolucion([punto('2026-08-31', 1000, 1000), punto('2026-09-26', 2000, 1000)])!;
    expect(g.patrimonio[1].y).toBeLessThan(g.patrimonio[0].y);
    expect(g.puesto[0].y).toBe(g.puesto[1].y);
  });

  test('todo igual (línea plana) no divide entre cero', () => {
    const g = geometriaEvolucion([punto('2026-08-31', 500, 500), punto('2026-09-26', 500, 500)])!;
    for (const p of [...g.patrimonio, ...g.puesto]) expect(Number.isFinite(p.y)).toBe(true);
    expect(g.ejeY.length).toBeGreaterThanOrEqual(2);
  });

  test('el eje Y cubre todos los valores con pasos redondos', () => {
    const g = geometriaEvolucion([punto('2026-08-31', 1130, 1000), punto('2026-09-26', 4870, 1000)])!;
    const valores = g.ejeY.map((l) => l.valor);
    expect(Math.min(...valores)).toBeLessThanOrEqual(1000);
    expect(Math.max(...valores)).toBeGreaterThanOrEqual(4870);
    const pasos = valores.slice(1).map((v, i) => v - valores[i]);
    expect(new Set(pasos).size).toBe(1);
  });

  test('las etiquetas del eje X incluyen siempre el primer y el último mes', () => {
    const muchos = Array.from({ length: 24 }, (_, i) => punto(`2025-${String((i % 12) + 1).padStart(2, '0')}-28`, 1000 + i, 1000));
    const g = geometriaEvolucion(muchos)!;
    expect(g.ejeX[0].fecha).toBe(muchos[0].fecha);
    expect(g.ejeX[g.ejeX.length - 1].fecha).toBe(muchos[23].fecha);
    expect(g.ejeX.length).toBeLessThanOrEqual(9);
  });
});

describe('composicion', () => {
  test('reparte en porcentajes que suman 100', () => {
    expect(composicion(5051.47, 7286.42)).toEqual({ libre: 41, invertido: 59 });
    expect(composicion(1, 2)).toEqual({ libre: 33, invertido: 67 });
  });

  test('sin dinero no hay porcentajes', () => {
    expect(composicion(0, 0)).toEqual({ libre: 0, invertido: 0 });
  });

  test('todo libre o todo invertido', () => {
    expect(composicion(100, 0)).toEqual({ libre: 100, invertido: 0 });
    expect(composicion(0, 100)).toEqual({ libre: 0, invertido: 100 });
  });
});

describe('contratos', () => {
  const c = (id: number, en_curso: boolean) => ({ proyecto_id: id, en_curso }) as Contrato;
  const todos = [c(1, true), c(2, false), c(3, true)];

  test('filtra por pestaña', () => {
    expect(filtrarContratos(todos, 'en_curso').map((x) => x.proyecto_id)).toEqual([1, 3]);
    expect(filtrarContratos(todos, 'finalizados').map((x) => x.proyecto_id)).toEqual([2]);
    expect(filtrarContratos(todos, 'todos')).toHaveLength(3);
  });
});

describe('signos y tonos', () => {
  const s = (n: number) => `S/ ${n.toFixed(2)}`;

  test('el signo se ve siempre: una pérdida nunca se confunde con una ganancia', () => {
    expect(conSigno(45000, s)).toBe('+S/ 45000.00');
    expect(conSigno(-5000, s)).toBe('−S/ 5000.00');
    expect(conSigno(0, s)).toBe('S/ 0.00');
    expect(conSigno(0.001, s)).toBe('S/ 0.00');
  });

  test('tono según el signo, con tolerancia de centavos', () => {
    expect(tonoResultado(10)).toBe('positivo');
    expect(tonoResultado(-10)).toBe('negativo');
    expect(tonoResultado(0)).toBe('neutro');
    expect(tonoResultado(0.004)).toBe('neutro');
  });
});

describe('etiquetaMes', () => {
  test('mes corto y año de dos cifras', () => {
    expect(etiquetaMes('2026-09-26')).toBe('sep 26');
    expect(etiquetaMes('2025-01-31')).toBe('ene 25');
  });
});
