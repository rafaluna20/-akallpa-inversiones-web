/** Datos del portal compartidos entre el layout y las pantallas (una sola consulta a Odoo por solicitud). */
import { cache } from 'react';

import { llamarAutenticado } from './auth';
import type { EstadoCuenta, Participacion, Patrimonio, ProyectoResumen } from './types';

export const obtenerEstadoCuenta = cache(() => llamarAutenticado<EstadoCuenta>('estado_cuenta'));
export const obtenerProyectos = cache(() => llamarAutenticado<{ proyectos: ProyectoResumen[] }>('proyectos'));
export const obtenerParticipaciones = cache(() => llamarAutenticado<{ participaciones: Participacion[] }>('participaciones'));
export const obtenerPatrimonio = cache(() => llamarAutenticado<Patrimonio>('patrimonio'));
