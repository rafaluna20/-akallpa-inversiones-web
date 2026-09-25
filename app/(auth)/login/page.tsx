import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/cuenta/Formularios';
import { Card } from '@/components/ui/primitives';
import { obtenerSesion } from '@/lib/auth';

export const metadata: Metadata = { title: 'Ingresar' };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // Si ya hay una sesión válida no se vuelve a pedir la contraseña.
  if (await obtenerSesion()) redirect('/');

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="mb-8 text-center font-display text-3xl font-bold text-white">
          Akallpa <span className="text-blue-400">Inversiones</span>
        </p>
        <Card>
          <h1 className="mb-1 font-display text-2xl font-bold text-white">Ingresar</h1>
          <p className="mb-6 text-sm text-slate-400">Accede a tus proyectos, cierres mensuales y estado de cuenta.</p>
          <LoginForm />
        </Card>
        <p className="mt-6 text-center text-xs text-slate-600">
          ¿Aún no tienes acceso? Solicítalo a Akallpa: el acceso es por invitación.
        </p>
      </div>
    </main>
  );
}
