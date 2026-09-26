import type { EstadoProyecto, ProyectoResumen } from './types';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export type ProyectoUbicado = ProyectoResumen & { coordenadas: Coordenadas };

/** Centro de Perú, para cuando aún no hay ningún proyecto ubicado. */
export const CENTRO_PERU: Coordenadas = { lat: -9.19, lng: -75.0152 };

/** Color del pin según la etapa del proyecto (el mismo criterio que las insignias de las tarjetas). */
export const COLOR_PIN: Record<EstadoProyecto, string> = {
  captando: '#2563eb',
  en_ejecucion: '#10b981',
  liquidando: '#f59e0b',
  liquidado: '#64748b',
};

export const COLOR_PIN_SELECCIONADO = '#f43f5e';

/** Coordenadas utilizables: números finitos dentro de rango. El servidor ya filtra, pero el mapa no debe romperse si algo llega mal. */
export function coordenadasValidas(c: ProyectoResumen['coordenadas'] | undefined): c is Coordenadas {
  return !!c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && Math.abs(c.lat) <= 90 && Math.abs(c.lng) <= 180;
}

export function separarPorUbicacion(proyectos: ProyectoResumen[]): { ubicados: ProyectoUbicado[]; sinUbicar: ProyectoResumen[] } {
  const ubicados: ProyectoUbicado[] = [];
  const sinUbicar: ProyectoResumen[] = [];
  for (const p of proyectos) {
    if (coordenadasValidas(p.coordenadas)) ubicados.push(p as ProyectoUbicado);
    else sinUbicar.push(p);
  }
  return { ubicados, sinUbicar };
}

export type FiltroMapa = 'todos' | 'captando' | 'en_obra' | 'liquidado';

export const FILTROS_MAPA: { id: FiltroMapa; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'captando', etiqueta: 'Captando' },
  { id: 'en_obra', etiqueta: 'En obra' },
  { id: 'liquidado', etiqueta: 'Liquidados' },
];

/** "En obra" agrupa ejecución y liquidación en curso: para el inversionista ambas son "ya no se puede aportar". */
export function coincideConFiltro(estado: EstadoProyecto, filtro: FiltroMapa): boolean {
  if (filtro === 'todos') return true;
  if (filtro === 'en_obra') return estado === 'en_ejecucion' || estado === 'liquidando';
  return estado === filtro;
}

export interface Encuadre {
  centro: Coordenadas;
  /** Esquinas [sur-oeste, nor-este] cuando hay 2 o más puntos distintos; `null` si basta centrar con un zoom fijo. */
  limites: [[number, number], [number, number]] | null;
}

export function calcularEncuadre(puntos: Coordenadas[]): Encuadre {
  if (puntos.length === 0) return { centro: CENTRO_PERU, limites: null };
  const lats = puntos.map((p) => p.lat);
  const lngs = puntos.map((p) => p.lng);
  const [sur, norte] = [Math.min(...lats), Math.max(...lats)];
  const [oeste, este] = [Math.min(...lngs), Math.max(...lngs)];
  const centro = { lat: (sur + norte) / 2, lng: (oeste + este) / 2 };
  if (sur === norte && oeste === este) return { centro, limites: null };
  return { centro, limites: [[sur, oeste], [norte, este]] };
}

/** Enlace para abrir la posición en una app de mapas del teléfono (Google Maps acepta lat,lng). */
export function enlaceDeMapa(c: Coordenadas): string {
  return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
}
