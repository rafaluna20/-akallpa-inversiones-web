/** Presentación del Patrimonio: geometría del gráfico, filtros de contratos y composición (lógica pura, sin React). */
import type { Contrato, PuntoPatrimonio } from './types';

export interface PuntoXY {
  x: number;
  y: number;
}

export interface GeometriaPatrimonio {
  ancho: number;
  alto: number;
  margen: { izq: number; der: number; arr: number; abajo: number };
  patrimonio: PuntoXY[];
  puesto: PuntoXY[];
  /** Líneas guía horizontales con su valor. */
  ejeY: { y: number; valor: number }[];
  /** Etiquetas del eje X (primer, último y algunos intermedios). */
  ejeX: { x: number; fecha: string }[];
}

const ANCHO = 640;
const ALTO = 220;
const MARGEN = { izq: 8, der: 8, arr: 14, abajo: 24 };

/** Un "buen" salto para el eje (1, 2, 5 × 10^n) que deje entre 3 y 5 líneas guía. */
function pasoAgradable(rango: number): number {
  if (rango <= 0) return 1;
  const bruto = rango / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const f = bruto / potencia;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * potencia;
}

/**
 * Geometría del gráfico de evolución. Devuelve `null` si hay menos de 2 puntos (una sola cifra no es una evolución).
 * La escala arranca en el valor más bajo (no en 0) para que los cambios se vean, pero el eje muestra sus valores.
 */
export function geometriaEvolucion(puntos: PuntoPatrimonio[]): GeometriaPatrimonio | null {
  if (puntos.length < 2) return null;
  const valores = puntos.flatMap((p) => [p.patrimonio, p.puesto]);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const paso = pasoAgradable(maximo - minimo);
  const piso = Math.floor(minimo / paso) * paso;
  let techo = Math.ceil(maximo / paso) * paso;
  if (techo === piso) techo = piso + paso;

  const areaH = ALTO - MARGEN.arr - MARGEN.abajo;
  const n = puntos.length;
  const x = (i: number) => MARGEN.izq + (i * (ANCHO - MARGEN.izq - MARGEN.der)) / (n - 1);
  const y = (v: number) => MARGEN.arr + (1 - (v - piso) / (techo - piso)) * areaH;

  const ejeY: GeometriaPatrimonio['ejeY'] = [];
  for (let v = piso; v <= techo + paso / 1000; v += paso) ejeY.push({ y: y(v), valor: v });

  const cada = Math.max(1, Math.ceil(n / 6));
  const ejeX = puntos
    .map((p, i) => ({ x: x(i), fecha: p.fecha, i }))
    .filter(({ i }) => i === 0 || i === n - 1 || (i % cada === 0 && n - 1 - i >= cada / 2))
    .map(({ x: px, fecha }) => ({ x: px, fecha }));

  return {
    ancho: ANCHO,
    alto: ALTO,
    margen: MARGEN,
    patrimonio: puntos.map((p, i) => ({ x: x(i), y: y(p.patrimonio) })),
    puesto: puntos.map((p, i) => ({ x: x(i), y: y(p.puesto) })),
    ejeY,
    ejeX,
  };
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** "2026-09-26" → "sep 26". */
export function etiquetaMes(iso: string): string {
  const [anio, mes] = iso.split('-');
  const nombre = MESES[Number(mes) - 1] ?? '';
  return `${nombre} ${anio.slice(2)}`;
}

/** Cómo se reparte el patrimonio entre dinero libre e invertido (en %, suman 100; 0/0 si no hay nada). */
export function composicion(saldoLibre: number, capitalEnCurso: number): { libre: number; invertido: number } {
  const total = saldoLibre + capitalEnCurso;
  if (total <= 0) return { libre: 0, invertido: 0 };
  const libre = Math.round((saldoLibre / total) * 100);
  return { libre, invertido: 100 - libre };
}

export type FiltroContratos = 'en_curso' | 'finalizados' | 'todos';

export const FILTROS_CONTRATOS: { id: FiltroContratos; etiqueta: string }[] = [
  { id: 'en_curso', etiqueta: 'En curso' },
  { id: 'finalizados', etiqueta: 'Finalizados' },
  { id: 'todos', etiqueta: 'Todos' },
];

export function filtrarContratos(contratos: Contrato[], filtro: FiltroContratos): Contrato[] {
  if (filtro === 'todos') return contratos;
  return contratos.filter((c) => (filtro === 'en_curso' ? c.en_curso : !c.en_curso));
}

export type TonoResultado = 'positivo' | 'negativo' | 'neutro';

export function tonoResultado(valor: number): TonoResultado {
  if (valor > 0.004) return 'positivo';
  if (valor < -0.004) return 'negativo';
  return 'neutro';
}

/** "+S/ 45,000.00" / "−S/ 5,000.00" / "S/ 0.00": el signo se ve siempre, para no confundir pérdida con ganancia. */
export function conSigno(valor: number, formatear: (n: number) => string): string {
  const tono = tonoResultado(valor);
  if (tono === 'neutro') return formatear(0);
  return `${tono === 'positivo' ? '+' : '−'}${formatear(Math.abs(valor))}`;
}
