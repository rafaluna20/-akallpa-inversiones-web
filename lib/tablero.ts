/** Presentación del Tablero de obra: colores por estado y puntos del gráfico de evolución (lógica pura, sin React). */
import type { InformeResumen } from './types';

export const ESTILO_ESTADO: Record<string, { clase: string; punto: string }> = {
  on_track: { clase: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300', punto: 'bg-emerald-400' },
  at_risk: { clase: 'border-amber-500/30 bg-amber-500/15 text-amber-300', punto: 'bg-amber-400' },
  off_track: { clase: 'border-red-500/30 bg-red-500/15 text-red-300', punto: 'bg-red-400' },
  on_hold: { clase: 'border-slate-500/30 bg-slate-500/15 text-slate-300', punto: 'bg-slate-400' },
  done: { clase: 'border-blue-500/30 bg-blue-500/15 text-blue-300', punto: 'bg-blue-400' },
};

export function estiloDeEstado(estado: string | null): { clase: string; punto: string } {
  return ESTILO_ESTADO[estado ?? ''] ?? { clase: 'border-white/10 bg-white/5 text-slate-300', punto: 'bg-slate-500' };
}

export interface PuntoGrafico {
  x: number;
  y: number;
}

export interface SerieGrafico {
  id: 'avance' | 'cpi' | 'spi';
  etiqueta: string;
  color: string;
  puntos: PuntoGrafico[];
  /** Último valor, ya formateado para la leyenda. */
  ultimo: string;
}

const ANCHO = 600;
const ALTO = 220;
const MARGEN = { izq: 36, der: 12, arr: 12, abajo: 26 };

/**
 * Series para el gráfico de evolución. El avance va en % (0-100, eje izquierdo); CPI y SPI son índices (1.0 = en meta):
 * se dibujan sobre una escala 0 – máx(2, mayor índice) para que la línea de "1.0" sea comparable entre proyectos.
 * Devuelve `null` si hay menos de 2 informes (no hay evolución que mostrar).
 */
export function seriesDeEvolucion(historial: InformeResumen[]): { series: SerieGrafico[]; ancho: number; alto: number; margen: typeof MARGEN; maxIndice: number } | null {
  if (historial.length < 2) return null;
  const n = historial.length;
  const x = (i: number) => MARGEN.izq + (i * (ANCHO - MARGEN.izq - MARGEN.der)) / (n - 1);
  const yPct = (v: number) => MARGEN.arr + (1 - Math.min(Math.max(v, 0), 100) / 100) * (ALTO - MARGEN.arr - MARGEN.abajo);
  const indices = historial.flatMap((h) => [h.cpi?.valor, h.spi?.valor]).filter((v): v is number => typeof v === 'number');
  const maxIndice = Math.max(2, ...indices);
  const yIdx = (v: number) => MARGEN.arr + (1 - Math.min(Math.max(v, 0), maxIndice) / maxIndice) * (ALTO - MARGEN.arr - MARGEN.abajo);

  const series: SerieGrafico[] = [
    {
      id: 'avance', etiqueta: 'Avance (%)', color: '#60a5fa',
      puntos: historial.map((h, i) => ({ x: x(i), y: yPct(h.avance) })),
      ultimo: `${Math.round(historial[n - 1].avance)}%`,
    },
  ];
  for (const [id, etiqueta, color] of [['cpi', 'CPI', '#34d399'], ['spi', 'SPI', '#c084fc']] as const) {
    const con = historial.map((h, i) => ({ v: h[id]?.valor, i })).filter((p): p is { v: number; i: number } => typeof p.v === 'number');
    if (con.length >= 2) {
      series.push({ id, etiqueta, color, puntos: con.map((p) => ({ x: x(p.i), y: yIdx(p.v) })), ultimo: con[con.length - 1].v.toFixed(2) });
    }
  }
  return { series, ancho: ANCHO, alto: ALTO, margen: MARGEN, maxIndice };
}

/** "1.00" → línea de referencia en el eje de índices. */
export function yDeIndiceUno(maxIndice: number): number {
  return MARGEN.arr + (1 - 1 / maxIndice) * (ALTO - MARGEN.arr - MARGEN.abajo);
}
