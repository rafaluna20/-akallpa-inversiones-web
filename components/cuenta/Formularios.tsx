'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';

import { loginAction, type EstadoFormulario } from '@/app/actions/auth';
import { actualizarDepositosAction, crearAporteAction, crearRetiroAction } from '@/app/actions/operaciones';
import { Alert } from '@/components/ui/primitives';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { formatearMoneda } from '@/lib/format';
import { nuevaLlave } from '@/lib/uuid';

const CLASE_INPUT =
  'w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 ' +
  'outline-none transition-colors focus:border-blue-500';

const ESTADO_INICIAL: EstadoFormulario = {};

/** Llave de idempotencia por solicitud; se renueva al terminar una solicitud exitosa. */
function useLlave(exito: boolean | undefined): string {
  const [llave, setLlave] = useState('');
  useEffect(() => {
    setLlave(nuevaLlave());
  }, [exito]);
  return llave;
}

export function LoginForm() {
  const [estado, accion] = useFormState(loginAction, ESTADO_INICIAL);
  return (
    <form action={accion} className="space-y-5" noValidate>
      <div>
        <label htmlFor="login" className="mb-1 block text-sm font-medium text-slate-300">Correo electrónico</label>
        <input id="login" name="login" type="email" autoComplete="username" required className={CLASE_INPUT} placeholder="tu@correo.com" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={CLASE_INPUT} />
      </div>
      {estado.error && <Alert tipo="error">{estado.error}</Alert>}
      <SubmitButton>Ingresar</SubmitButton>
    </form>
  );
}

interface AporteProps {
  proyectoId: number;
  moneda: string;
  saldoDisponible: number;
  faltante: number;
}

export function AporteForm({ proyectoId, moneda, saldoDisponible, faltante }: AporteProps) {
  const [estado, accion] = useFormState(crearAporteAction, ESTADO_INICIAL);
  const llave = useLlave(estado.ok);
  return (
    <form action={accion} className="space-y-5" noValidate>
      <input type="hidden" name="proyectoId" value={proyectoId} />
      <input type="hidden" name="llave" value={llave} />
      <div>
        <label htmlFor="monto" className="mb-1 block text-sm font-medium text-slate-300">Monto a aportar ({moneda})</label>
        <input id="monto" name="monto" inputMode="decimal" autoComplete="off" required className={CLASE_INPUT} placeholder="0.00" />
        <p className="mt-2 text-xs text-slate-500">
          Saldo disponible: <span className="font-mono">{formatearMoneda(saldoDisponible, moneda)}</span> · Falta captar:{' '}
          <span className="font-mono">{formatearMoneda(faltante, moneda)}</span>
        </p>
      </div>
      {estado.error && <Alert tipo="error">{estado.error}</Alert>}
      {estado.ok && estado.mensaje && <Alert tipo="exito">{estado.mensaje}</Alert>}
      <SubmitButton className={llave ? '' : 'pointer-events-none opacity-60'}>Solicitar aporte</SubmitButton>
    </form>
  );
}

interface RetiroProps {
  moneda: string;
  saldoDisponible: number;
  tieneCuentaDestino: boolean;
}

export function RetiroForm({ moneda, saldoDisponible, tieneCuentaDestino }: RetiroProps) {
  const [estado, accion] = useFormState(crearRetiroAction, ESTADO_INICIAL);
  const llave = useLlave(estado.ok);
  if (!tieneCuentaDestino) {
    return (
      <Alert tipo="error">
        Aún no tienes una cuenta de destino verificada. Contacta a Akallpa para registrarla y poder solicitar retiros.
      </Alert>
    );
  }
  return (
    <form action={accion} className="space-y-5" noValidate>
      <input type="hidden" name="llave" value={llave} />
      <div>
        <label htmlFor="monto-retiro" className="mb-1 block text-sm font-medium text-slate-300">Monto a retirar ({moneda})</label>
        <input id="monto-retiro" name="monto" inputMode="decimal" autoComplete="off" required className={CLASE_INPUT} placeholder="0.00" />
        <p className="mt-2 text-xs text-slate-500">
          Disponible: <span className="font-mono">{formatearMoneda(saldoDisponible, moneda)}</span>. El retiro va a tu cuenta verificada.
        </p>
      </div>
      {estado.error && <Alert tipo="error">{estado.error}</Alert>}
      {estado.ok && estado.mensaje && <Alert tipo="exito">{estado.mensaje}</Alert>}
      <SubmitButton className={llave ? '' : 'pointer-events-none opacity-60'}>Solicitar retiro</SubmitButton>
    </form>
  );
}

/** Botón "Ya deposité": trae ya los movimientos del banco. */
export function ActualizarDepositosForm() {
  const [estado, accion] = useFormState(actualizarDepositosAction, ESTADO_INICIAL);
  return (
    <form action={accion} className="space-y-4">
      {estado.error && <Alert tipo="error">{estado.error}</Alert>}
      {estado.ok && estado.mensaje && <Alert tipo="exito">{estado.mensaje}</Alert>}
      <SubmitButton>Ya deposité, actualizar mi saldo</SubmitButton>
    </form>
  );
}
