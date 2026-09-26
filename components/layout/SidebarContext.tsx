'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface Valor {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Contexto = createContext<Valor>({ isCollapsed: false, toggleSidebar: () => {} });

/** Estado de la barra lateral (expandida o colapsada), compartido entre la barra y el contenido. */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setCollapsed] = useState(false);
  const valor = useMemo(() => ({ isCollapsed, toggleSidebar: () => setCollapsed((c) => !c) }), [isCollapsed]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSidebar(): Valor {
  return useContext(Contexto);
}
