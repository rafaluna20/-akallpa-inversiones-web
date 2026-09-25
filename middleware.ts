import { NextResponse, type NextRequest } from 'next/server';

import { COOKIE_SESION } from '@/lib/session-cookie';

const RUTAS_PUBLICAS = new Set(['/login']);

/**
 * Puerta de entrada: sin cookie de sesión solo se ve el login. Esto NO valida el token (eso lo hace cada
 * pantalla contra Odoo); solo evita renderizar páginas protegidas sin sesión.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (RUTAS_PUBLICAS.has(pathname)) return NextResponse.next();

  if (!request.cookies.get(COOKIE_SESION)?.value) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Todo excepto recursos estáticos de Next y archivos con extensión.
  matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
