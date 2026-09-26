import type { ReactNode } from 'react';

import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from './SidebarContext';
import { TopBar } from './TopBar';

interface Props {
  nombre: string;
  email: string;
  saldo: number;
  enProyectos: number;
  moneda: string;
  kyc: 'pendiente' | 'verificado' | 'rechazado';
  misProyectos: number;
  oportunidades: number;
  children: ReactNode;
}

/**
 * Estructura del portal, igual a la de Inversiones Pro: barra superior fija, barra lateral pegajosa a su
 * izquierda y el contenido; en móvil, barra inferior.
 */
export function AppShell({ children, ...datos }: Props) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col bg-slate-950 text-gray-100 lg:gap-6">
        <TopBar nombre={datos.nombre} email={datos.email} saldo={datos.saldo} moneda={datos.moneda} />
        <div className="h-0.5" />
        <div className="flex flex-1 pt-[calc(5rem+2px)]">
          <Sidebar {...datos} />
          <div className="hidden w-[5px] shrink-0 lg:block" />
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-x-hidden p-4 pb-28 lg:p-8">{children}</div>
          </main>
        </div>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
