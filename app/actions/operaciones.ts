'use server';

import { revalidatePath } from 'next/cache';

import { llamarAutenticado } from '@/lib/auth';
import { aporteSchema, MENSAJE_POR_CODIGO, retiroSchema } from '@/lib/validation';

import type { EstadoFormulario } from './auth';

interface Solicitud {
  repetido: boolean;
}

function mensajeDeError(codigo: string, texto: string): string {
  // Los errores de reglas de negocio ya vienen redactados para el usuario; el resto se traduce.
  if (codigo === 'negocio' || codigo === 'validacion') return texto;
  return MENSAJE_POR_CODIGO[codigo] ?? texto;
}

/** Solicita un aporte a un proyecto. Queda pendiente hasta que tesorería lo confirma. */
export async function crearAporteAction(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const datos = aporteSchema.safeParse({
    proyectoId: formData.get('proyectoId'),
    monto: formData.get('monto'),
    llave: formData.get('llave'),
  });
  if (!datos.success) return { error: datos.error.issues[0].message };

  const r = await llamarAutenticado<Solicitud>('aporte/crear', {
    proyecto_id: datos.data.proyectoId,
    monto: datos.data.monto,
    llave: datos.data.llave,
  });
  if (!r.success) return { error: mensajeDeError(r.code, r.error) };

  revalidatePath('/');
  revalidatePath('/cuenta');
  revalidatePath(`/proyectos/${datos.data.proyectoId}`);
  return {
    ok: true,
    mensaje: r.repetido
      ? 'Tu solicitud ya estaba registrada.'
      : 'Solicitud enviada. Tesorería la confirmará y el aporte aparecerá en tu cuenta.',
  };
}

/** Solicita un retiro hacia tu cuenta de destino verificada. El monto queda retenido hasta que se apruebe. */
export async function crearRetiroAction(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const datos = retiroSchema.safeParse({ monto: formData.get('monto'), llave: formData.get('llave') });
  if (!datos.success) return { error: datos.error.issues[0].message };

  const r = await llamarAutenticado<Solicitud>('retiro/crear', { monto: datos.data.monto, llave: datos.data.llave });
  if (!r.success) return { error: mensajeDeError(r.code, r.error) };

  revalidatePath('/');
  revalidatePath('/cuenta');
  return {
    ok: true,
    mensaje: r.repetido
      ? 'Tu solicitud de retiro ya estaba registrada.'
      : 'Retiro solicitado. El monto quedó retenido hasta que tesorería lo apruebe y lo pague.',
  };
}
