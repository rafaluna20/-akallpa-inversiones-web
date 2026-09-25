/**
 * Sesión del inversionista: el JWT que emite Odoo vive en una cookie httpOnly (el JavaScript del navegador no
 * puede leerla), con SameSite=Strict y Secure en producción.
 */
import { cookies } from 'next/headers';

import { COOKIE_SESION } from './session-cookie';

export { COOKIE_SESION };

export function leerToken(): string | undefined {
  return cookies().get(COOKIE_SESION)?.value;
}

export function guardarToken(token: string, segundos: number): void {
  cookies().set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: Math.max(60, Math.floor(segundos)),
  });
}

export function borrarToken(): void {
  cookies().delete(COOKIE_SESION);
}
