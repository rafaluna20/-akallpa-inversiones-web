'use server';

import { redirect } from 'next/navigation';

import { llamar } from '@/lib/odoo';
import { borrarToken, guardarToken, leerToken } from '@/lib/session';
import { loginSchema, MENSAJE_POR_CODIGO } from '@/lib/validation';

export interface EstadoFormulario {
  ok?: boolean;
  error?: string;
  mensaje?: string;
}

/** Inicia sesión: valida la entrada, pide el token a Odoo y lo guarda en una cookie httpOnly. */
export async function loginAction(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const datos = loginSchema.safeParse({ login: formData.get('login'), password: formData.get('password') });
  if (!datos.success) return { error: datos.error.issues[0].message };

  const respuesta = await llamar<{ token: string; expires_in: number }>('auth/login', datos.data);
  if (!respuesta.success) {
    return { error: MENSAJE_POR_CODIGO[respuesta.code] ?? respuesta.error };
  }
  guardarToken(respuesta.token, respuesta.expires_in);
  redirect('/');
}

/** Cierra la sesión: invalida el token en Odoo (todos los emitidos antes) y borra la cookie. */
export async function logoutAction(): Promise<void> {
  const token = leerToken();
  if (token) await llamar('auth/logout', {}, token);
  borrarToken();
  redirect('/login');
}
