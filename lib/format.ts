/** Formato de dinero y fechas para el portal (es-PE). */

export function formatearMoneda(monto: number, moneda = 'PEN'): string {
  const valor = Number.isFinite(monto) ? monto : 0;
  try {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: moneda, minimumFractionDigits: 2 }).format(valor);
  } catch {
    return `${moneda} ${valor.toFixed(2)}`;
  }
}

/** "2026-09-25" → "25 sep 2026". Las fechas de Odoo llegan sin hora: se interpretan sin zona para no correrlas un día. */
export function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const fecha = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(fecha)
    .replace(/\./g, '');
}

export function formatearPorcentaje(valor: number, decimales = 1): string {
  return `${(Number.isFinite(valor) ? valor : 0).toFixed(decimales)}%`;
}

/** Limita un porcentaje al rango 0–100 (para barras de progreso). */
export function acotarPorcentaje(valor: number): number {
  if (!Number.isFinite(valor)) return 0;
  return Math.min(100, Math.max(0, valor));
}

export const ETIQUETA_ESTADO_PROYECTO: Record<string, string> = {
  captando: 'Captando aportes',
  en_ejecucion: 'En ejecución',
  liquidando: 'En liquidación',
  liquidado: 'Liquidado',
};

export const ETIQUETA_TIPO_MOVIMIENTO: Record<string, string> = {
  deposito: 'Depósito',
  retiro: 'Retiro',
  aporte: 'Aporte a proyecto',
  devolucion_aporte: 'Devolución de aporte',
  devolucion_capital: 'Devolución de capital',
  utilidad: 'Utilidad',
  reversion: 'Reversión',
  ajuste: 'Ajuste',
};

export const ETIQUETA_TIPO_PROYECTO: Record<string, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  multifamiliar: 'Multifamiliar',
  unifamiliar: 'Unifamiliar',
  local: 'Local comercial',
  terreno: 'Terreno',
  oficina: 'Oficina',
};

/** Plural para los filtros por categoría. */
export const ETIQUETA_TIPO_PLURAL: Record<string, string> = {
  casa: 'Casas',
  departamento: 'Departamentos',
  multifamiliar: 'Multifamiliares',
  unifamiliar: 'Unifamiliares',
  local: 'Locales',
  terreno: 'Terrenos',
  oficina: 'Oficinas',
};

/** Monto sin decimales para tarjetas: "S/ 130,000". */
export function formatearMonto(monto: number, moneda = 'PEN'): string {
  const valor = Number.isFinite(monto) ? monto : 0;
  const simbolo = moneda === 'PEN' ? 'S/' : moneda === 'USD' ? 'US$' : moneda;
  return `${simbolo} ${valor.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
}
