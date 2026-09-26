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
  /** Lo decide el servidor (hora de Lima). */
  plazo_vencido: boolean;
  avance_pct: number;
  tipo: string | null;
  ubicacion: string | null;
  ticket_minimo: number | null;
  /** Estimación del gestor (no una promesa). `null` = no se muestra. */
  roi_estimado: number | null;
  comision_gestor: number;
  /** Solo la cantidad de socios, nunca quiénes son. */
  socios: number;
  tiene_imagen: boolean;
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
  descripcion: string;
  capital_minimo: number | null;
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

/** Datos para depositar desde la app de billetera (`deposito/info`). */
export type DepositoInfo =
  | { activo: false }
  | { activo: true; plataforma: string; app_url: string; billetera_vinculada: string | null; moneda: string };

export interface ActualizacionDeposito {
  acreditado: number;
  saldo: number;
  moneda: string;
}

/** Semáforo de un índice EVM (CPI o SPI): >= 1.0 es sano. */
export interface IndiceEvm {
  valor: number;
  ok: boolean;
  texto: string;
}

/** Métricas EVM de un informe. `sin_datos` = todavía no hay valorizaciones aprobadas: no se muestran índices. */
export interface Evm {
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  sin_datos: boolean;
  cpi: IndiceEvm | null;
  spi: IndiceEvm | null;
}

export interface InformeResumen {
  id: number;
  nombre: string;
  fecha: string | null;
  estado: string | null;
  estado_texto: string;
  avance: number;
  cpi: IndiceEvm | null;
  spi: IndiceEvm | null;
}

export interface InformeObra extends InformeResumen {
  descripcion: string;
  tareas: { total: number; cerradas: number; porcentaje: number };
  evm: Evm | null;
}

/** Tablero de obra (`proyecto/tablero`). Los montos solo llegan si el inversionista participa. */
export interface Tablero {
  participa: boolean;
  moneda: string;
  ultimo: InformeObra | null;
  historial: InformeResumen[];
  resultado: { ventas: number; costos: number; margen: number } | null;
  mayores_gastos: { fecha: string; descripcion: string; monto: number }[];
}
