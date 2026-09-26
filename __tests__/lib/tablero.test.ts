import { estiloDeEstado, seriesDeEvolucion, yDeIndiceUno } from '@/lib/tablero';
import type { InformeResumen } from '@/lib/types';

const informe = (id: number, avance: number, cpi: number | null, spi: number | null, fecha = `2026-0${id}-28`): InformeResumen => ({
  id, nombre: `Informe ${id}`, fecha, estado: 'on_track', estado_texto: 'En camino', avance,
  cpi: cpi === null ? null : { valor: cpi, ok: cpi >= 1, texto: '' },
  spi: spi === null ? null : { valor: spi, ok: spi >= 1, texto: '' },
});

describe('estiloDeEstado', () => {
  test('cada estado tiene su color y uno desconocido cae en neutro', () => {
    expect(estiloDeEstado('on_track').clase).toContain('emerald');
    expect(estiloDeEstado('at_risk').clase).toContain('amber');
    expect(estiloDeEstado('off_track').clase).toContain('red');
    expect(estiloDeEstado('on_hold').clase).toContain('slate');
    expect(estiloDeEstado('done').clase).toContain('blue');
    expect(estiloDeEstado(null).clase).toContain('white/10');
    expect(estiloDeEstado('raro').punto).toBe('bg-slate-500');
  });
});

describe('seriesDeEvolucion', () => {
  test('con menos de dos informes no hay evolución', () => {
    expect(seriesDeEvolucion([])).toBeNull();
    expect(seriesDeEvolucion([informe(1, 10, null, null)])).toBeNull();
  });

  test('solo avance cuando no hay índices (quien no participa o aún sin valorizaciones)', () => {
    const g = seriesDeEvolucion([informe(1, 10, null, null), informe(2, 40, null, null)]);
    expect(g?.series.map((s) => s.id)).toEqual(['avance']);
    expect(g?.series[0].ultimo).toBe('40%');
  });

  test('con índices agrega CPI y SPI y usa un eje mínimo de 2.0', () => {
    const g = seriesDeEvolucion([informe(1, 10, 0.8, 1.1), informe(2, 40, 1.2, 0.9), informe(3, 60, 1.0, 1.0)]);
    expect(g?.series.map((s) => s.id)).toEqual(['avance', 'cpi', 'spi']);
    expect(g?.maxIndice).toBe(2);
    expect(g?.series[1].ultimo).toBe('1.00');
  });

  test('un índice muy alto amplía el eje', () => {
    expect(seriesDeEvolucion([informe(1, 10, 3.5, 1), informe(2, 20, 2, 1)])?.maxIndice).toBe(3.5);
  });

  test('los puntos quedan dentro del área y avanzan de izquierda a derecha', () => {
    const g = seriesDeEvolucion([informe(1, 0, 1, 1), informe(2, 100, 1, 1), informe(3, 50, 1, 1)])!;
    for (const s of g.series) {
      const xs = s.puntos.map((p) => p.x);
      expect([...xs].sort((a, b) => a - b)).toEqual(xs);
      for (const p of s.puntos) {
        expect(p.x).toBeGreaterThanOrEqual(g.margen.izq);
        expect(p.x).toBeLessThanOrEqual(g.ancho - g.margen.der);
        expect(p.y).toBeGreaterThanOrEqual(g.margen.arr);
        expect(p.y).toBeLessThanOrEqual(g.alto - g.margen.abajo);
      }
    }
  });

  test('valores fuera de rango se recortan en vez de salirse del gráfico', () => {
    const g = seriesDeEvolucion([informe(1, -20, 1, 1), informe(2, 250, 1, 1)])!;
    const ys = g.series[0].puntos.map((p) => p.y);
    expect(ys[0]).toBe(g.alto - g.margen.abajo);
    expect(ys[1]).toBe(g.margen.arr);
  });

  test('un informe sin índice no rompe la serie de los demás', () => {
    const g = seriesDeEvolucion([informe(1, 10, null, null), informe(2, 20, 1.1, 1.0), informe(3, 30, 1.2, 1.0)])!;
    expect(g.series.find((s) => s.id === 'cpi')?.puntos).toHaveLength(2);
  });
});

describe('yDeIndiceUno', () => {
  test('la línea de 1.0 queda a media altura si el eje llega a 2', () => {
    const g = seriesDeEvolucion([informe(1, 10, 1, 1), informe(2, 20, 1, 1)])!;
    const y = yDeIndiceUno(2);
    expect(y).toBeGreaterThan(g.margen.arr);
    expect(y).toBeLessThan(g.alto - g.margen.abajo);
    expect(y).toBeCloseTo((g.margen.arr + g.alto - g.margen.abajo) / 2, 5);
  });
});
