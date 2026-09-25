import { MENSAJE_POR_CODIGO } from './validation';
import type { ErrorApi } from './types';

/** Texto para mostrar al usuario cuando una consulta de una pantalla falla. */
export function mensajeDeError(error: ErrorApi): string {
  if (error.code === 'negocio' || error.code === 'validacion') return error.error;
  return MENSAJE_POR_CODIGO[error.code] ?? error.error;
}
