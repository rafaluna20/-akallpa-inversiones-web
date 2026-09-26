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
  /** Posición para el mapa; `null` si el gestor aún no la cargó. */
  coordenadas: { lat: number; lng: number } | null;
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

/** Un punto de la evolución mensual del patrimonio (a costo). */
export interface PuntoPatrimonio {
  fecha: string;
  /** Saldo libre + capital en proyectos. */
  patrimonio: number;
  /** Lo que la persona puso de su bolsillo hasta esa fecha (depósitos − retiros). */
  puesto: number;
}

/** Participación de la persona en un proyecto, con lo que ha puesto y recibido. */
export interface Contrato {
  proyecto_id: number;
  nombre: string;
  estado: EstadoProyecto | string;
  tipo: string | null;
  ubicacion: string | null;
  en_curso: boolean;
  /** `false` si el proyecto ya no está publicado: no hay ficha a la que llevar. */
  visible: boolean;
  comprometido: number;
  aportado: number;
  /** Capital que sigue invertido (a costo). 0 cuando el proyecto ya se liquidó. */
  capital: number;
  porcentaje: number;
  utilidad_recibida: number;
  /** Liquidado: lo que volvió menos lo aportado (puede ser negativo). En curso: solo la utilidad recibida. */
  resultado: number;
  avance_pct: number;
  /** Estimación del gestor (no una promesa). Nunca se suma a los totales. */
  roi_estimado: number | null;
  ganancia_estimada: number | null;
}

export interface Patrimonio {
  moneda: string;
  hoy: string;
  patrimonio: number;
  saldo_libre: number;
  capital_en_curso: number;
  puesto: number;
  utilidad_mes: number;
  utilidad_recibida: number;
  resultado_realizado: number;
  proyectos_activos: number;
  proyectos_historicos: number;
  evolucion: PuntoPatrimonio[];
  contratos: Contrato[];
  /** La persona tiene cuentas en más de una moneda: aquí solo se muestra la principal. */
  otras_monedas: boolean;
}
