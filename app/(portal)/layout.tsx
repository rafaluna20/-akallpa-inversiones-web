import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { requerirSesion } from '@/lib/auth';

// Todas las pantallas del portal dependen de la sesión: nunca se prerenderizan ni se guardan en caché.
export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { me } = await requerirSesion();
  return (
    <AppShell nombre={me.partner.nombre} cuentas={me.cuentas}>
      {children}
    </AppShell>
  );
}
