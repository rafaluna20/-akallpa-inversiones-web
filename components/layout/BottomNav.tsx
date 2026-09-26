'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBuilding, FaHome, FaPlus, FaWallet } from 'react-icons/fa';

import { estaActiva } from './nav';

const ITEMS = [
  { name: 'Inicio', href: '/', icon: FaHome },
  { name: 'Proyectos', href: '/proyectos', icon: FaBuilding },
  { name: 'Mi cuenta', href: '/cuenta', icon: FaWallet },
  { name: 'Depositar', href: '/cuenta/depositar', icon: FaPlus },
];

/** Barra inferior de móvil. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal móvil" className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-900/95 backdrop-blur-xl lg:hidden">
      <ul className="flex items-center justify-around px-4 py-3">
        {ITEMS.map(({ name, href, icon: Icono }) => {
          const activa = estaActiva(pathname, href);
          return (
            <li key={name}>
              <Link href={href} prefetch={false} aria-current={activa ? 'page' : undefined} className={clsx('flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-300', activa ? 'text-blue-400' : 'text-slate-400 hover:text-white')}>
                <Icono className="h-6 w-6" aria-hidden />
                <span className="text-xs font-medium">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
