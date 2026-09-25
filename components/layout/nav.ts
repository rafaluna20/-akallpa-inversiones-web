import { LayoutDashboard, Building2, Wallet, type LucideIcon } from 'lucide-react';

export interface ItemNav {
  nombre: string;
  href: string;
  icono: LucideIcon;
}

export const ITEMS_NAV: ItemNav[] = [
  { nombre: 'Panel', href: '/', icono: LayoutDashboard },
  { nombre: 'Proyectos', href: '/proyectos', icono: Building2 },
  { nombre: 'Mi cuenta', href: '/cuenta', icono: Wallet },
];

/** ¿Está activa la ruta? La raíz solo coincide exacta; las demás también por prefijo. */
export function estaActiva(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
