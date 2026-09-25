/** Validación de las entradas de los formularios (se repite en el servidor: nunca confiar en el navegador). */
import { z } from 'zod';

/** Acepta "1200", "1 200,50" o "1200.5" y devuelve un número; cualquier otra cosa da NaN. */
export function parsearMonto(texto: unknown): number {
  if (typeof texto !== 'string') return NaN;
  const limpio = texto.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return NaN;
  return Number(limpio);
}

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Ingresa tu correo.').max(254, 'Correo demasiado largo.'),
  password: z.string().min(1, 'Ingresa tu contraseña.').max(256, 'Contraseña demasiado larga.'),
});

/** Llave de idempotencia de una solicitud (la genera el formulario; Odoo exige el mismo formato). */
export const llaveSchema = z.string().regex(/^[A-Za-z0-9_-]{8,64}$/, 'Solicitud inválida. Recarga la página.');

export const aporteSchema = z.object({
  proyectoId: z.coerce.number().int().positive('Proyecto inválido.'),
  monto: z
    .string({ required_error: 'Ingresa un monto.', invalid_type_error: 'Ingresa un monto.' })
    .transform((t) => parsearMonto(t))
    .pipe(z.number({ invalid_type_error: 'Ingresa un monto válido (hasta 2 decimales).' }).positive('El monto debe ser mayor a 0.').max(10_000_000, 'El monto es demasiado alto.')),
  llave: llaveSchema,
});

export const retiroSchema = z.object({
  monto: aporteSchema.shape.monto,
  llave: llaveSchema,
});

/** Mensajes para el usuario según el código de error de la API. */
export const MENSAJE_POR_CODIGO: Record<string, string> = {
  credenciales: 'Correo o contraseña incorrectos.',
  limite: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  saldo: 'No tienes saldo suficiente para esta operación.',
  no_encontrado: 'No encontramos lo que buscas.',
  no_autorizado: 'Tu sesión expiró. Vuelve a iniciar sesión.',
  interno: 'Ocurrió un error inesperado. Intenta de nuevo.',
  servicio: 'El servicio no está disponible en este momento. Intenta de nuevo en unos minutos.',
};
