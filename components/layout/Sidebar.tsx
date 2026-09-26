'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChartLine, FaChevronLeft, FaChevronRight, FaPlus, FaShieldAlt, FaUser } from 'react-icons/fa';

import { formatearMoneda } from '@/lib/format';

import { CLASES_INSIGNIA, estaActiva, gruposDeNavegacion, type ContadoresNav } from './nav';
import { useSidebar } from './SidebarContext';

interface Props extends ContadoresNav {
  nombre: string;
  email: string;
  saldo: number;
  enProyectos: number;
  moneda: string;
  kyc: 'pendiente' | 'verificado' | 'rechazado';
}

const ETIQUETA_KYC = { verificado: 'Verificada', pendiente: 'Pendiente', rechazado: 'Rechazada' } as const;
const COLOR_KYC = { verificado: 'text-green-400', pendiente: 'text-yellow-400', rechazado: 'text-red-400' } as const;

/** Barra lateral de escritorio: tarjeta del inversionista, accesos rápidos y navegación agrupada. */
export function Sidebar({ nombre, email, saldo, enProyectos, moneda, kyc, misProyectos, oportunidades }: Props) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const grupos = gruposDeNavegacion({ misProyectos, oportunidades });
  const compacto = (n: number) => formatearMoneda(n, moneda).replace(/\.00$/, '');

  return (
    <aside
      style={{ width: isCollapsed ? '80px' : '256px' }}
      className="sticky top-[calc(5rem+2px)] z-30 hidden h-[calc(100vh-5rem-2px)] shrink-0 flex-col overflow-hidden border-r border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all duration-300 lg:flex"
    >
      <button
        onClick={toggleSidebar}
        className="absolute right-2 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-800 shadow-lg transition-all hover:bg-slate-700 active:scale-90"
        aria-label={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
      >
        {isCollapsed ? <FaChevronRight className="h-3 w-3 text-slate-400" /> : <FaChevronLeft className="h-3 w-3 text-slate-400" />}
      </button>

      <div className="border-b border-white/5 p-6">
        {!isCollapsed ? (
          <p className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-display text-2xl font-bold text-transparent">Akallpa Inversiones</p>
        ) : (
          <div className="text-center text-3xl" aria-hidden>🏗️</div>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4 pt-4">
          <div className="rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-blue-500/30">
                  <FaUser className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-green-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{nombre}</p>
                <p className="truncate text-xs text-slate-400">{email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/70 p-2 backdrop-blur-sm">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-400">Saldo</p>
                <p className="text-sm font-bold text-green-400">{compacto(saldo)}</p>
              </div>
              <div className="rounded-lg border border-slate-700/50 bg-slate-800/70 p-2 backdrop-blur-sm">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-slate-400">En proyectos</p>
                <p className="text-sm font-bold text-blue-400">{compacto(enProyectos)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
                <FaShieldAlt className="h-3 w-3" /> Identidad
              </span>
              <span className={clsx('text-xs font-semibold', COLOR_KYC[kyc])}>{ETIQUETA_KYC[kyc]}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <Link
              href="/cuenta/depositar"
              prefetch={false}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-[0.98]"
            >
              <FaPlus className="h-4 w-4" />
              <span>Depositar</span>
            </Link>
            <Link
              href="/oportunidades"
              prefetch={false}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-[0.98]"
            >
              <FaChartLine className="h-3.5 w-3.5" />
              <span>Invertir Ahora</span>
            </Link>
          </div>
        ) : (
          <Link href="/cuenta/depositar" prefetch={false} title="Depositar" className="flex aspect-square w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg transition-transform hover:scale-110 active:scale-90">
            <FaPlus className="h-6 w-6 text-white" />
          </Link>
        )}
      </div>

      <nav aria-label="Principal" className="scrollbar-hide flex-1 space-y-6 overflow-y-auto px-4">
        {grupos.map((grupo) => (
          <div key={grupo.title}>
            {!isCollapsed && <h3 className="mb-2 px-2 font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500">{grupo.title}</h3>}
            <div className="space-y-1">
              {grupo.items.map((item) => {
                const Icono = item.icon;
                const activa = estaActiva(pathname, item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    aria-current={activa ? 'page' : undefined}
                    title={isCollapsed ? item.name : undefined}
                    className={clsx(
                      'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                      isCollapsed && 'justify-center',
                      activa
                        ? 'border border-blue-500/30 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                        : 'text-slate-400 hover:translate-x-1 hover:bg-slate-800/50 hover:text-white hover:shadow-lg'
                    )}
                  >
                    <Icono className={clsx('h-5 w-5', !activa && 'transition-transform group-hover:scale-110')} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-medium">{item.name}</span>
                        {item.badge !== undefined && (
                          <span className={clsx('rounded-full border px-2 py-0.5 text-[10px] font-bold', CLASES_INSIGNIA[item.badgeColor ?? 'default'])}>{item.badge}</span>
                        )}
                      </>
                    )}
                    {isCollapsed && item.badge !== undefined && <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-red-500" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-white/5 p-4">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>Sistemas operando</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1 text-[10px] text-slate-600">
              <span>v1.0.0</span>
              <span>© 2026</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" title="Sistemas operando" />
          </div>
        )}
      </div>
    </aside>
  );
}
