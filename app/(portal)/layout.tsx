import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { requerirSesion } from '@/lib/auth';
import { obtenerEstadoCuenta, obtenerProyectos } from '@/lib/datos';

// Todas las pantallas del portal dependen de la sesión: nunca se prerenderizan ni se guardan en caché.
export const dynamic = 'force-dynamic';

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { me } = await requerirSesion();
  const [estado, proyectos] = await Promise.all([obtenerEstadoCuenta(), obtenerProyectos()]);

  const saldo = me.cuentas[0];
  const filas = estado.success ? estado.proyectos : [];
  const enProyectos = filas.filter((p) => p.estado !== 'liquidado' && p.estado !== 'cancelado').reduce((s, p) => s + p.aportado, 0);
  const lista = proyectos.success ? proyectos.proyectos : [];

  return (
    <AppShell
      nombre={me.partner.nombre}
      email={me.partner.email}
      saldo={saldo?.saldo ?? 0}
      moneda={saldo?.moneda ?? 'PEN'}
      enProyectos={enProyectos}
      kyc={me.kyc}
      misProyectos={lista.filter((p) => p.mi_participacion).length}
      oportunidades={lista.filter((p) => p.estado === 'captando' && !p.mi_participacion).length}
    >
      {children}
    </AppShell>
  );
}
