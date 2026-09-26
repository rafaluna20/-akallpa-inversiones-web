/**
 * Estado de la captación de un proyecto, para decidir qué se le ofrece al inversionista.
 * El plazo lo decide el SERVIDOR (`plazo_vencido`, hora de Lima): el navegador nunca compara fechas.
 * Esto es solo presentación; la regla real la aplica Odoo al crear el aporte.
 */
import type { ProyectoResumen } from './types';

export type TonoCaptacion = 'abierto' | 'completo' | 'vencido' | 'cerrado';

export interface EstadoCaptacion {
  tono: TonoCaptacion;
  puedeInvertir: boolean;
  completo: boolean;
  vencido: boolean;
  /** Lo que falta por captar (nunca negativo). */
  falta: number;
  /** Título de la cabecera del panel. */
  titulo: string;
  subtitulo: string;
  /** Mensaje cuando NO se puede invertir. */
  cierre: { titulo: string; detalle: string } | null;
}

type Datos = Pick<ProyectoResumen, 'estado' | 'porcentaje_recaudado' | 'plazo_vencido' | 'capital_objetivo' | 'capital_aportado'>;

export function estadoDeCaptacion(p: Datos): EstadoCaptacion {
  const falta = Math.max(0, p.capital_objetivo - p.capital_aportado);

  if (p.estado === 'captando') {
    const completo = p.porcentaje_recaudado >= 100;
    const vencido = p.plazo_vencido && !completo;
    if (completo) {
      return {
        tono: 'completo', puedeInvertir: false, completo: true, vencido: false, falta,
        titulo: 'Proyecto financiado', subtitulo: 'Recaudación completada',
        cierre: { titulo: 'Cupos agotados', detalle: 'Este proyecto ya no acepta nuevos aportes.' },
      };
    }
    if (vencido) {
      return {
        tono: 'vencido', puedeInvertir: false, completo: false, vencido: true, falta,
        titulo: 'Plazo de captación vencido', subtitulo: 'Ya no se reciben aportes',
        cierre: { titulo: 'Plazo vencido', detalle: 'El plazo para invertir en este proyecto ha finalizado.' },
      };
    }
    return { tono: 'abierto', puedeInvertir: true, completo: false, vencido: false, falta, titulo: 'Oportunidad de inversión', subtitulo: 'Captando aportes', cierre: null };
  }

  const cierres: Record<string, { titulo: string; subtitulo: string; cierre: { titulo: string; detalle: string } }> = {
    en_ejecucion: {
      titulo: 'Proyecto en ejecución', subtitulo: 'La obra está en marcha',
      cierre: { titulo: 'En ejecución', detalle: 'La captación terminó: el proyecto ya no admite nuevos aportes.' },
    },
    liquidando: {
      titulo: 'Proyecto en liquidación', subtitulo: 'Se está calculando el reparto',
      cierre: { titulo: 'En liquidación', detalle: 'Se está calculando el reparto de capital y utilidad.' },
    },
    liquidado: {
      titulo: 'Proyecto liquidado', subtitulo: 'Reparto realizado',
      cierre: { titulo: 'Proyecto finalizado', detalle: 'El capital y la utilidad ya fueron repartidos.' },
    },
  };
  const c = cierres[p.estado] ?? cierres.liquidado;
  return { tono: 'cerrado', puedeInvertir: false, completo: false, vencido: false, falta, ...c };
}
