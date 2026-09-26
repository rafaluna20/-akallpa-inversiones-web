'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaChartLine, FaSearch, FaSignOutAlt, FaUser, FaWallet } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

import { logoutAction } from '@/app/actions/auth';
import { formatearMoneda } from '@/lib/format';

import { iniciales } from './nav';

interface Props {
  nombre: string;
  email: string;
  saldo: number;
  moneda: string;
}

/** Barra superior: logo, búsqueda, saldo con acciones rápidas y menú del usuario. */
export function TopBar({ nombre, email, saldo, moneda }: Props) {
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaMovil, setBusquedaMovil] = useState(false);
  const [consulta, setConsulta] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAbierto(false);
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuAbierto(false);
        setBusquedaMovil(false);
      }
    }
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const q = consulta.trim();
    if (q) {
      router.push(`/proyectos?q=${encodeURIComponent(q)}`);
      setBusquedaMovil(false);
      setConsulta('');
    }
  };

  const saldoFormateado = formatearMoneda(saldo, moneda);
  const saldoCompacto = saldo >= 1000 ? `${(saldo / 1000).toFixed(1)}k` : String(Math.floor(saldo));
  const menu = 'absolute right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl';

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-4 lg:px-8">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" prefetch={false} className="flex shrink-0 items-center gap-3 transition-transform hover:scale-105">
            <span className="font-display text-2xl font-bold text-white">
              Akallpa <span className="text-blue-400">Inversiones</span>
            </span>
          </Link>

          <form onSubmit={buscar} className="group relative hidden max-w-xl flex-1 md:flex" role="search">
            <FaSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-400" />
            <input
              type="text"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Buscar proyectos"
              aria-label="Buscar proyectos"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-base text-white placeholder-slate-600 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {consulta && (
              <button type="button" onClick={() => setConsulta('')} aria-label="Limpiar búsqueda" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <MdClose className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative md:hidden">
            <button onClick={() => setBusquedaMovil((v) => !v)} aria-label="Abrir búsqueda" aria-expanded={busquedaMovil} className="rounded-xl p-3 transition-all hover:bg-white/5 active:scale-95">
              <FaSearch className="h-6 w-6 text-slate-400" />
            </button>
            {busquedaMovil && (
              <div className={`${menu} w-80`}>
                <form onSubmit={buscar} className="p-3" role="search">
                  <input
                    autoFocus
                    value={consulta}
                    onChange={(e) => setConsulta(e.target.value)}
                    placeholder="Buscar proyectos"
                    aria-label="Buscar proyectos"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </form>
              </div>
            )}
          </div>

          <div className="hidden flex-col items-end lg:flex">
            <span className="mb-1 text-base font-medium text-slate-300">Saldo: {saldoFormateado}</span>
            <div className="flex gap-2">
              <Link href="/cuenta/depositar" prefetch={false} className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-2 text-sm font-bold text-green-400 transition-all hover:bg-green-500/20 hover:shadow-lg hover:shadow-green-500/10 active:scale-95">
                Depositar
              </Link>
              <Link href="/cuenta#retiros" prefetch={false} className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-400 transition-all hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/10 active:scale-95">
                Retirar
              </Link>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuAbierto((v) => !v)} aria-label="Menú de usuario" aria-expanded={menuAbierto} className="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/5 active:scale-95">
              <div className="relative">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white ring-2 ring-slate-700 transition-all hover:ring-blue-500">
                  {iniciales(nombre)}
                </span>
                <span className="absolute -bottom-1 -right-1 min-w-[28px] rounded-full border border-slate-900 bg-gradient-to-r from-green-500 to-green-600 px-1.5 py-0.5 text-center text-[9px] font-bold text-white shadow-lg lg:hidden">
                  {saldoCompacto}
                </span>
              </div>
              <span className="hidden max-w-40 truncate text-lg font-medium text-white xl:block">{nombre.split(' ')[0]}</span>
            </button>

            {menuAbierto && (
              <div className={`${menu} w-72`}>
                <div className="border-b border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-4">
                  <p className="truncate text-lg font-semibold text-white">{nombre}</p>
                  <p className="truncate text-xs text-slate-400">{email}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-700/50 pt-3 lg:hidden">
                    <span className="text-xs text-slate-400">Saldo disponible:</span>
                    <span className="text-sm font-bold text-green-400">{saldoFormateado}</span>
                  </div>
                </div>
                <div className="py-2">
                  {[
                    { href: '/cuenta', icono: <FaUser className="h-4 w-4" />, etiqueta: 'Mi cuenta' },
                    { href: '/mis-inversiones', icono: <FaChartLine className="h-4 w-4" />, etiqueta: 'Mis inversiones' },
                    { href: '/cuenta/depositar', icono: <FaWallet className="h-4 w-4" />, etiqueta: 'Depositar' },
                  ].map((it) => (
                    <Link key={it.href} href={it.href} prefetch={false} onClick={() => setMenuAbierto(false)} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-700/50">
                      <span className="text-slate-400 transition-colors group-hover:text-blue-400">{it.icono}</span>
                      <span className="text-sm text-white">{it.etiqueta}</span>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-slate-700 py-2">
                  <form action={logoutAction}>
                    <button type="submit" className="group flex w-full items-center gap-3 px-4 py-3 transition-colors hover:translate-x-1 hover:bg-red-500/10">
                      <FaSignOutAlt className="h-4 w-4 text-slate-400 transition-colors group-hover:text-red-400" />
                      <span className="text-sm text-white transition-colors group-hover:text-red-400">Cerrar sesión</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
