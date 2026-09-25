import { LogOut } from 'lucide-react';
import type { ReactNode } from 'react';

import { logoutAction } from '@/app/actions/auth';
import { formatearMoneda } from '@/lib/format';
import type { Cuenta } from '@/lib/types';

import { BarraInferior, BarraLateral } from './Navegacion';

interface Props {
  nombre: string;
  cuentas: Cuenta[];
  children: ReactNode;
}

function BotonSalir() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Cerrar sesión
      </button>
    </form>
  );
}

/** Estructura del portal: barra lateral en escritorio, cabecera + barra inferior en móvil. */
export function AppShell({ nombre, cuentas, children }: Props) {
  const saldo = cuentas[0];
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <span className="font-display text-lg font-bold text-white">Akallpa</span>
        <span className="text-sm text-slate-300">{nombre}</span>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between border-r border-white/10 p-5 lg:flex">
          <div>
            <p className="mb-8 font-display text-2xl font-bold text-white">
              Akallpa <span className="text-blue-400">Inversiones</span>
            </p>
            <BarraLateral />
          </div>
          <div className="space-y-3">
            {saldo && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Saldo disponible</p>
                <p className="mt-1 font-mono text-xl font-bold text-white">{formatearMoneda(saldo.saldo, saldo.moneda)}</p>
              </div>
            )}
            <p className="truncate px-1 text-sm text-slate-300">{nombre}</p>
            <BotonSalir />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 lg:px-10 lg:pb-10 lg:pt-10">
          {children}
          <div className="mt-10 border-t border-white/5 pt-4 lg:hidden">
            <BotonSalir />
          </div>
        </main>
      </div>

      <BarraInferior />
    </div>
  );
}
