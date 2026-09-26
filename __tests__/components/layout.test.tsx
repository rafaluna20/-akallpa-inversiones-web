import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import { BottomNav } from '@/components/layout/BottomNav';
import { estaActiva, gruposDeNavegacion, iniciales } from '@/components/layout/nav';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/layout/SidebarContext';
import { TopBar } from '@/components/layout/TopBar';

jest.mock('next/navigation', () => ({ usePathname: jest.fn(), useRouter: () => ({ push: mockPush }) }));
jest.mock('@/app/actions/auth', () => ({ logoutAction: jest.fn() }));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, prefetch: _prefetch, ...resto }: { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const mockPush = jest.fn();

describe('navegación', () => {
  test('estaActiva: la raíz solo coincide exacta; las demás también por prefijo; los anclajes nunca', () => {
    expect(estaActiva('/', '/')).toBe(true);
    expect(estaActiva('/proyectos', '/')).toBe(false);
    expect(estaActiva('/proyectos/5/cierres/2', '/proyectos')).toBe(true);
    expect(estaActiva('/proyectos-extra', '/proyectos')).toBe(false);
    expect(estaActiva('/cuenta', '/cuenta#movimientos')).toBe(false);
  });

  test('"Mi cuenta" no se enciende dentro de "Depositar", que es su propio ítem', () => {
    expect(estaActiva('/cuenta', '/cuenta')).toBe(true);
    expect(estaActiva('/cuenta/depositar', '/cuenta')).toBe(false);
    expect(estaActiva('/cuenta/depositar', '/cuenta/depositar')).toBe(true);
  });

  test('los grupos replican los de Inversiones Pro y las insignias solo aparecen si hay algo que contar', () => {
    const vacios = gruposDeNavegacion({ misProyectos: 0, oportunidades: 0 });
    expect(vacios.map((g) => g.title)).toEqual(['INVERSIONES', 'FINANZAS']);
    expect(vacios[0].items.every((i) => i.badge === undefined)).toBe(true);
    const con = gruposDeNavegacion({ misProyectos: 2, oportunidades: 3 });
    expect(con[0].items.map((i) => i.badge)).toEqual([undefined, 2, 3]);
  });

  test('iniciales del avatar', () => {
    expect(iniciales('Ana Torres Quispe')).toBe('AT');
    expect(iniciales('  beto  ')).toBe('B');
    expect(iniciales('')).toBe('?');
  });
});

describe('BottomNav', () => {
  test('marca la sección activa con aria-current', () => {
    (usePathname as jest.Mock).mockReturnValue('/proyectos/5');
    render(<BottomNav />);
    const activos = screen.getAllByRole('link', { current: 'page' });
    expect(activos).toHaveLength(1);
    expect(activos[0]).toHaveAttribute('href', '/proyectos');
  });
});

describe('Sidebar', () => {
  const props = {
    nombre: 'Ana Torres Quispe', email: 'ana@demo.pe', saldo: 22000, enProyectos: 120000, moneda: 'PEN',
    kyc: 'verificado' as const, misProyectos: 1, oportunidades: 2,
  };
  const dibujar = () => render(<SidebarProvider><Sidebar {...props} /></SidebarProvider>);

  test('muestra la tarjeta del inversionista, sus grupos y los accesos rápidos', () => {
    (usePathname as jest.Mock).mockReturnValue('/mis-inversiones');
    dibujar();
    expect(screen.getByText('Ana Torres Quispe')).toBeInTheDocument();
    expect(screen.getByText('Verificada')).toBeInTheDocument();
    expect(screen.getByText('INVERSIONES')).toBeInTheDocument();
    expect(screen.getByText('FINANZAS')).toBeInTheDocument();
    const depositar = screen.getAllByRole('link', { name: /Depositar$/ });
    expect(depositar).toHaveLength(2); // el botón destacado y el ítem de Finanzas
    depositar.forEach((a) => expect(a).toHaveAttribute('href', '/cuenta/depositar'));
    expect(screen.getByRole('link', { name: /Invertir Ahora/ })).toHaveAttribute('href', '/oportunidades');
    expect(screen.getByRole('link', { name: /Mis Inversiones/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Oportunidades/ })).toHaveTextContent('2');
  });

  test('se puede colapsar y expandir', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    dibujar();
    fireEvent.click(screen.getByRole('button', { name: 'Colapsar barra lateral' }));
    expect(screen.queryByText('INVERSIONES')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expandir barra lateral' }));
    expect(screen.getByText('INVERSIONES')).toBeInTheDocument();
  });

  test('un KYC pendiente se muestra como tal', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<SidebarProvider><Sidebar {...props} kyc="pendiente" /></SidebarProvider>);
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });
});

describe('TopBar', () => {
  beforeEach(() => mockPush.mockClear());

  test('muestra el saldo y las acciones rápidas', () => {
    render(<TopBar nombre="Ana Torres" email="ana@demo.pe" saldo={22000} moneda="PEN" />);
    expect(screen.getByText(/Saldo:/)).toHaveTextContent(/22[\s.,]?000/);
    expect(screen.getByRole('link', { name: 'Depositar' })).toHaveAttribute('href', '/cuenta/depositar');
    expect(screen.getByRole('link', { name: 'Retirar' })).toHaveAttribute('href', '/cuenta#retiros');
  });

  test('la búsqueda lleva a Proyectos con la consulta codificada', () => {
    render(<TopBar nombre="Ana Torres" email="ana@demo.pe" saldo={0} moneda="PEN" />);
    const cajas = screen.getAllByRole('textbox', { name: 'Buscar proyectos' });
    fireEvent.change(cajas[0], { target: { value: 'casa & jardín' } });
    fireEvent.submit(cajas[0].closest('form') as HTMLFormElement);
    expect(mockPush).toHaveBeenCalledWith('/proyectos?q=casa%20%26%20jard%C3%ADn');
  });

  test('una búsqueda vacía no navega', () => {
    render(<TopBar nombre="Ana Torres" email="ana@demo.pe" saldo={0} moneda="PEN" />);
    const caja = screen.getAllByRole('textbox', { name: 'Buscar proyectos' })[0];
    fireEvent.change(caja, { target: { value: '   ' } });
    fireEvent.submit(caja.closest('form') as HTMLFormElement);
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('el menú del usuario abre, muestra su correo y ofrece cerrar sesión', () => {
    render(<TopBar nombre="Ana Torres" email="ana@demo.pe" saldo={0} moneda="PEN" />);
    fireEvent.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    expect(screen.getByText('ana@demo.pe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar sesión/ })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('ana@demo.pe')).not.toBeInTheDocument();
  });
});
