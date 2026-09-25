import { act, render, screen, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import { AporteForm, LoginForm, RetiroForm } from '@/components/cuenta/Formularios';
import { BarraInferior, BarraLateral } from '@/components/layout/Navegacion';
import { estaActiva } from '@/components/layout/nav';

// React 18 estable no incluye useFormState/useFormStatus: Next las provee en tiempo de ejecución. Aquí se simulan.
let estadoSimulado: { ok?: boolean; error?: string; mensaje?: string } = {};
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: (_accion: unknown, inicial: unknown) => [estadoSimulado ?? inicial, jest.fn()],
  useFormStatus: () => ({ pending: false }),
}));
jest.mock('@/app/actions/auth', () => ({ loginAction: jest.fn() }));
jest.mock('@/app/actions/operaciones', () => ({ crearAporteAction: jest.fn(), crearRetiroAction: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, prefetch: _prefetch, ...resto }: { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const FORMATO_LLAVE = /^[A-Za-z0-9_-]{8,64}$/;

beforeEach(() => {
  estadoSimulado = {};
});

describe('LoginForm', () => {
  test('tiene campos con etiqueta, autocompletado correcto y muestra el error del servidor', () => {
    estadoSimulado = { error: 'Correo o contraseña incorrectos.' };
    render(<LoginForm />);
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('autocomplete', 'username');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeEnabled();
  });
  test('sin error no muestra alerta', () => {
    render(<LoginForm />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('AporteForm', () => {
  const props = { proyectoId: 7, moneda: 'PEN', saldoDisponible: 1500, faltante: 60000 };

  test('genera una llave de idempotencia válida y envía el proyecto', async () => {
    const { container } = render(<AporteForm {...props} />);
    await waitFor(() => expect((container.querySelector('input[name="llave"]') as HTMLInputElement).value).toMatch(FORMATO_LLAVE));
    expect((container.querySelector('input[name="proyectoId"]') as HTMLInputElement).value).toBe('7');
  });

  test('muestra saldo disponible y lo que falta captar', () => {
    render(<AporteForm {...props} />);
    expect(screen.getByText(/Saldo disponible/)).toHaveTextContent(/1[\s., ]?500/);
    expect(screen.getByText(/Falta captar/)).toBeInTheDocument();
  });

  test('cada formulario montado tiene su propia llave (dos solicitudes no comparten llave)', async () => {
    const a = render(<AporteForm {...props} />);
    const b = render(<AporteForm {...props} />);
    await waitFor(() => expect((a.container.querySelector('input[name="llave"]') as HTMLInputElement).value).not.toBe(''));
    const la = (a.container.querySelector('input[name="llave"]') as HTMLInputElement).value;
    const lb = (b.container.querySelector('input[name="llave"]') as HTMLInputElement).value;
    expect(la).not.toBe(lb);
  });

  test('muestra el error y el éxito devueltos por la acción', () => {
    estadoSimulado = { error: 'No tienes saldo suficiente para esta operación.' };
    const { unmount } = render(<AporteForm {...props} />);
    expect(screen.getByRole('alert')).toHaveTextContent('saldo suficiente');
    unmount();
    estadoSimulado = { ok: true, mensaje: 'Solicitud enviada.' };
    render(<AporteForm {...props} />);
    expect(screen.getByRole('status')).toHaveTextContent('Solicitud enviada.');
  });

  test('renueva la llave después de una solicitud exitosa', async () => {
    const { container, rerender } = render(<AporteForm {...props} />);
    await waitFor(() => expect((container.querySelector('input[name="llave"]') as HTMLInputElement).value).not.toBe(''));
    const antes = (container.querySelector('input[name="llave"]') as HTMLInputElement).value;
    estadoSimulado = { ok: true, mensaje: 'Solicitud enviada.' };
    await act(async () => {
      rerender(<AporteForm {...props} />);
    });
    await waitFor(() => expect((container.querySelector('input[name="llave"]') as HTMLInputElement).value).not.toBe(antes));
  });
});

describe('RetiroForm', () => {
  test('sin cuenta de destino verificada no ofrece el formulario', () => {
    render(<RetiroForm moneda="PEN" saldoDisponible={100} tieneCuentaDestino={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/cuenta de destino verificada/);
    expect(screen.queryByRole('button', { name: /Solicitar retiro/ })).not.toBeInTheDocument();
  });

  test('con cuenta de destino, pide solo el monto (el destino nunca lo elige el usuario)', async () => {
    const { container } = render(<RetiroForm moneda="PEN" saldoDisponible={100} tieneCuentaDestino />);
    expect(screen.getByLabelText(/Monto a retirar/)).toBeInTheDocument();
    const nombres = Array.from(container.querySelectorAll('input')).map((i) => i.getAttribute('name'));
    expect(nombres.sort()).toEqual(['llave', 'monto']);
    await waitFor(() => expect((container.querySelector('input[name="llave"]') as HTMLInputElement).value).toMatch(FORMATO_LLAVE));
  });
});

describe('navegación', () => {
  test('estaActiva: la raíz solo coincide exacta; las demás también por prefijo', () => {
    expect(estaActiva('/', '/')).toBe(true);
    expect(estaActiva('/proyectos', '/')).toBe(false);
    expect(estaActiva('/proyectos/5/cierres/2', '/proyectos')).toBe(true);
    expect(estaActiva('/proyectos-extra', '/proyectos')).toBe(false);
    expect(estaActiva('/cuenta', '/proyectos')).toBe(false);
  });

  test('marca la sección activa con aria-current en ambas barras', () => {
    (usePathname as jest.Mock).mockReturnValue('/proyectos/5');
    render(
      <>
        <BarraLateral />
        <BarraInferior />
      </>
    );
    const activos = screen.getAllByRole('link', { current: 'page' });
    expect(activos).toHaveLength(2);
    activos.forEach((a) => expect(a).toHaveAttribute('href', '/proyectos'));
    expect(screen.getAllByRole('link', { name: /Panel/ })[0]).not.toHaveAttribute('aria-current');
  });
});
