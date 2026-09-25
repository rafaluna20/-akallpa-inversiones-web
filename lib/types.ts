/**
 * Tipos de las respuestas de la API de Odoo (`/api/inv/*`, módulo akallpa_inversionistas).
 * Toda respuesta es `{ success: true, ... }` o `{ success: false, error, code }`.
 */

export type CodigoError =
  | 'no_autorizado'
  | 'credenciales'
  | 'limite'
  | 'validacion'
  | 'negocio'
  | 'saldo'
  | 'no_encontrado'
  | 'interno'
  | 'servicio'
  | string;

export interface ErrorApi {
  success: false;
  error: string;
  code: CodigoError;
}

export type Ok<T> = { success: true } & T;
export type Resp<T> = Ok<T> | ErrorApi;

export interface Cuenta {
  empresa: string;
  moneda: string;
  saldo: number;
}

export interface Me {
  partner: { id: number; nombre: string; email: string };
  kyc: 'pendiente' | 'verificado' | 'rechazado';
  tiene_cuenta_destino: boolean;
  cuentas: Cuenta[];
}

export interface MiParticipacion {
  aportado: number;
  comprometido: number;
  porcentaje: number;
  estado: string;
}

export type EstadoProyecto = 'captando' | 'en_ejecucion' | 'liquidando' | 'liquidado';

export interface ProyectoResumen {
  id: number;
  nombre: string;
  empresa: string;
  estado: EstadoProyecto;
  moneda: string;
  capital_objetivo: number;
  capital_aportado: number;
  porcentaje_recaudado: number;
  fecha_limite: string | null;
  avance_pct: number;
  mi_participacion: MiParticipacion | null;
}

export interface CierreResumen {
  id: number;
  periodo_fin: string;
  avance_pct: number;
  total_ventas: number;
  total_costos: number;
  resultado: number;
}

export interface Avance {
  id: number;
  fecha: string;
  titulo: string;
  descripcion: string;
  avance_pct: number;
  imagenes: { id: number; nombre: string }[];
}

export interface ProyectoDetalle extends ProyectoResumen {
  avances: Avance[];
  cierres: CierreResumen[];
}

export interface FacturaLinea {
  fecha: string;
  documento: string;
  tipo: 'compra' | 'venta' | 'otro';
  tercero: string;
  concepto: string;
  rubro: string | null;
  monto: number;
  comprobante: boolean;
  move_id: number | null;
}

export interface CierreDetalle {
  id: number;
  proyecto: string;
  periodo_fin: string;
  moneda: string;
  avance_pct: number;
  notas: string;
  total_ventas: number;
  total_costos: number;
  resultado: number;
  rubros: { nombre: string; monto: number }[];
  facturas: FacturaLinea[];
}

export interface Movimiento {
  id: number;
  fecha: string;
  tipo: string;
  importe: number;
  saldo_posterior: number;
  moneda: string;
  proyecto: string | null;
  descripcion: string;
  referencia: string;
}

export interface EstadoCuentaProyecto {
  proyecto_id: number;
  proyecto: string;
  estado: string;
  moneda: string;
  aportado: number;
  capital_devuelto: number;
  utilidad: number;
}

export interface EstadoCuenta {
  saldos: Cuenta[];
  proyectos: EstadoCuentaProyecto[];
}

export interface Participacion {
  proyecto_id: number;
  proyecto: string;
  estado_proyecto: string;
  moneda: string;
  comprometido: number;
  aportado: number;
  porcentaje: number;
  estado: string;
  aportes: { id: number; fecha: string; monto: number; estado: string }[];
}

export interface RetiroResumen {
  id: number;
  fecha: string;
  monto: number;
  moneda: string;
  estado: string;
}
