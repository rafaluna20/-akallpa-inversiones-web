/** Nombre de la cookie de sesión. Vive aparte de `session.ts` porque el middleware (Edge) no puede importar `next/headers`. */
export const COOKIE_SESION = 'inv_token';
