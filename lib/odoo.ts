/**
 * Cliente de la API de inversionistas de Odoo — SOLO servidor.
 *
 * El navegador nunca habla con Odoo: todas las llamadas pasan por Server Components, Server Actions o route
 * handlers de este proyecto, que reenvían el token del inversionista (guardado en una cookie httpOnly).
 *
 * Nunca se devuelve al cliente un mensaje crudo de un fallo del servidor: los errores de Odoo (JSON-RPC, red,
 * respuestas que no son JSON) se registran en el log y el usuario recibe un texto genérico.
 */

import type { ErrorApi, Resp } from './types';

const TIMEOUT_MS = 15_000;

export const ERROR_SERVICIO: ErrorApi = {
  success: false,
  error: 'El servicio no está disponible en este momento. Intenta de nuevo en unos minutos.',
  code: 'servicio',
};

function config(): { url: string; db: string } | null {
  const url = process.env.ODOO_URL?.replace(/\/+$/, '');
  const db = process.env.ODOO_DB;
  if (!url || !db) {
    console.error('[odoo] Faltan ODOO_URL u ODOO_DB en las variables de entorno.');
    return null;
  }
  return { url, db };
}

/** Llama a `/api/inv/<ruta>` con JSON-RPC y devuelve la respuesta tipada o un error genérico de servicio. */
export async function llamar<T>(
  ruta: string,
  params: Record<string, unknown> = {},
  token?: string
): Promise<Resp<T>> {
  if (typeof window !== 'undefined') {
    throw new Error('lib/odoo.ts no debe importarse en código de cliente.');
  }
  const cfg = config();
  if (!cfg) return ERROR_SERVICIO;

  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIMEOUT_MS);
  try {
    const respuesta = await fetch(`${cfg.url}/api/inv/${ruta}?db=${encodeURIComponent(cfg.db)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params }),
      cache: 'no-store',
      signal: controlador.signal,
    });

    let cuerpo: unknown;
    try {
      cuerpo = await respuesta.json();
    } catch {
      console.error(`[odoo] ${ruta}: respuesta que no es JSON (HTTP ${respuesta.status})`);
      return ERROR_SERVICIO;
    }

    const rpc = cuerpo as { result?: unknown; error?: { message?: string; data?: { message?: string } } };
    if (rpc.error) {
      console.error(`[odoo] ${ruta}: error JSON-RPC: ${rpc.error.data?.message ?? rpc.error.message ?? 'desconocido'}`);
      return ERROR_SERVICIO;
    }
    const resultado = rpc.result as { success?: unknown } | undefined;
    if (!resultado || typeof resultado !== 'object' || typeof resultado.success !== 'boolean') {
      console.error(`[odoo] ${ruta}: respuesta con formato inesperado`);
      return ERROR_SERVICIO;
    }
    return resultado as Resp<T>;
  } catch (error) {
    const abortado = error instanceof Error && error.name === 'AbortError';
    console.error(`[odoo] ${ruta}: ${abortado ? 'tiempo de espera agotado' : 'error de red'}`, abortado ? '' : error);
    return ERROR_SERVICIO;
  } finally {
    clearTimeout(temporizador);
  }
}
