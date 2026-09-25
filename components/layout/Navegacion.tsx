'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { estaActiva, ITEMS_NAV } from './nav';

/** Barra lateral (escritorio). */
export function BarraLateral() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="flex flex-col gap-1">
      {ITEMS_NAV.map(({ nombre, href, icono: Icono }) => {
        const activa = estaActiva(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={activa ? 'page' : undefined}
            className={clsx(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
              activa ? 'bg-blue-500/15 text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icono className="h-5 w-5" aria-hidden />
            {nombre}
          </Link>
        );
      })}
    </nav>
  );
}

/** Barra inferior (móvil), como la de Inversiones Pro. */
export function BarraInferior() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal móvil"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-900/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="flex items-center justify-around px-4 py-2">
        {ITEMS_NAV.map(({ nombre, href, icono: Icono }) => {
          const activa = estaActiva(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={activa ? 'page' : undefined}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors',
                  activa ? 'text-blue-400' : 'text-slate-400 hover:text-white'
                )}
              >
                <Icono className="h-6 w-6" aria-hidden />
                <span className="text-xs font-medium">{nombre}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
