/** Acceso autenticado a la API desde Server Components y route handlers. */
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { llamar } from './odoo';
import { leerToken } from './session';
import type { Me, Ok, Resp } from './types';

export interface Sesion {
  token: string;
  me: Ok<Me>;
}

/** Sesión vigente (validada contra Odoo) o `null`. Una sola consulta por solicitud gracias a `cache`. */
export const obtenerSesion = cache(async (): Promise<Sesion | null> => {
  const token = leerToken();
  if (!token) return null;
  const me = await llamar<Me>('me', {}, token);
  return me.success ? { token, me } : null;
});

export async function requerirSesion(): Promise<Sesion> {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/login');
  return sesion;
}

/**
 * Llama a un endpoint con el token de la sesión. Si el token ya no vale, envía al login; si el servicio falla,
 * devuelve el error para que la pantalla lo muestre.
 */
export async function llamarAutenticado<T>(ruta: string, params: Record<string, unknown> = {}): Promise<Resp<T>> {
  const token = leerToken();
  if (!token) redirect('/login');
  const respuesta = await llamar<T>(ruta, params, token);
  if (!respuesta.success && respuesta.code === 'no_autorizado') redirect('/login');
  return respuesta;
}
