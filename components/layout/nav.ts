import type { IconType } from 'react-icons';
import { FaChartLine, FaFileInvoice, FaHome, FaMapMarkedAlt, FaPlus, FaStar, FaWallet } from 'react-icons/fa';

export type ColorInsignia = 'green' | 'blue' | 'red' | 'yellow' | 'purple';

export interface ItemNav {
  name: string;
  href: string;
  icon: IconType;
  badge?: string | number;
  badgeColor?: ColorInsignia;
}

export interface GrupoNav {
  title: string;
  items: ItemNav[];
}

export interface ContadoresNav {
  misProyectos: number;
  oportunidades: number;
}

/** Grupos de la barra lateral, con la misma estructura que Inversiones Pro. */
export function gruposDeNavegacion({ misProyectos, oportunidades }: ContadoresNav): GrupoNav[] {
  return [
    {
      title: 'INVERSIONES',
      items: [
        { name: 'Dashboard', href: '/', icon: FaHome },
        { name: 'Mis Inversiones', href: '/mis-inversiones', icon: FaChartLine, badge: misProyectos || undefined, badgeColor: 'green' },
        { name: 'Oportunidades', href: '/oportunidades', icon: FaStar, badge: oportunidades || undefined, badgeColor: 'red' },
        { name: 'Mapa', href: '/mapa', icon: FaMapMarkedAlt },
      ],
    },
    {
      title: 'FINANZAS',
      items: [
        { name: 'Mi cuenta', href: '/cuenta', icon: FaWallet },
        { name: 'Depositar', href: '/cuenta/depositar', icon: FaPlus },
        { name: 'Movimientos', href: '/cuenta#movimientos', icon: FaFileInvoice },
      ],
    },
  ];
}

export const CLASES_INSIGNIA: Record<ColorInsignia | 'default', string> = {
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

/** ¿Está activa la ruta? La raíz solo coincide exacta; "Mi cuenta" no se enciende dentro de "Depositar". */
export function estaActiva(pathname: string, href: string): boolean {
  if (href.includes('#')) return false; // los enlaces a una sección nunca se marcan como activos
  if (href === '/') return pathname === '/';
  if (href === '/cuenta') return pathname === '/cuenta';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Iniciales para el avatar: "Ana Torres Quispe" → "AT". */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?';
}
