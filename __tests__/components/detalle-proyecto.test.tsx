import { fireEvent, render, screen, within } from '@testing-library/react';

import { BarraDatos } from '@/components/proyectos/BarraDatos';
import { PanelInversion } from '@/components/proyectos/PanelInversion';
import { TabsProyecto } from '@/components/proyectos/TabsProyecto';
import type { ProyectoDetalle } from '@/lib/types';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, prefetch: _prefetch, ...resto }: { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const proyecto: ProyectoDetalle = {
  id: 7, nombre: 'Torre Miraflores', empresa: 'Akallpa S.A.C.', estado: 'captando', moneda: 'PEN', capital_objetivo: 100000,
  capital_aportado: 40000, porcentaje_recaudado: 40, fecha_limite: '2026-12-31', plazo_vencido: false, avance_pct: 0, tipo: 'casa',
  ubicacion: 'Miraflores', coordenadas: null, ticket_minimo: 5000, roi_estimado: null, comision_gestor: 10, socios: 3, tiene_imagen: false,
  mi_participacion: null, descripcion: 'Edificio de 6 pisos', capital_minimo: null, avances: [], cierres: [],
};

describe('PanelInversion', () => {
  test('captando: muestra montos reales, lo que falta, los socios (solo la cantidad) y "Invertir ahora"', () => {
    render(<PanelInversion proyecto={proyecto} />);
    expect(screen.getByText('Oportunidad de inversión')).toBeInTheDocument();
    expect(screen.getByText(/de S\/\s?100[\s.,]?000 meta/)).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Falta captar').closest('div')?.parentElement).toHaveTextContent(/60[\s.,]?000/);
    expect(screen.getByText('Socios').closest('div')?.parentElement).toHaveTextContent('3');
    expect(screen.getByRole('progressbar', { name: 'Capital recaudado del proyecto' })).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('link', { name: /Invertir ahora/ })).toHaveAttribute('href', '/proyectos/7/aportar');
    expect(screen.getByText('Inversión desde')).toBeInTheDocument();
  });

  test('si ya participa, ofrece "Aportar más" y muestra su aporte', () => {
    render(<PanelInversion proyecto={{ ...proyecto, mi_participacion: { aportado: 5000, comprometido: 0, porcentaje: 12.5, estado: 'activa' } }} />);
    expect(screen.getByRole('link', { name: /Aportar más/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Tu participación')).toHaveTextContent(/5[\s.,]?000/);
    expect(screen.getByLabelText('Tu participación')).toHaveTextContent('12.50%');
  });

  test('plazo vencido: aviso de tiempo agotado y sin botón para invertir', () => {
    render(<PanelInversion proyecto={{ ...proyecto, plazo_vencido: true }} />);
    expect(screen.getByText('Tiempo agotado')).toBeInTheDocument();
    expect(screen.getByText('Plazo vencido')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Invertir ahora|Aportar más/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Inversión desde')).not.toBeInTheDocument();
  });

  test('meta alcanzada: felicita y cierra los aportes', () => {
    render(<PanelInversion proyecto={{ ...proyecto, porcentaje_recaudado: 100, capital_aportado: 100000 }} />);
    expect(screen.getByText('¡Meta alcanzada!')).toBeInTheDocument();
    expect(screen.getByText('Cupos agotados')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Invertir ahora/ })).not.toBeInTheDocument();
  });

  test.each([
    ['en_ejecucion', 'En ejecución'],
    ['liquidando', 'En liquidación'],
    ['liquidado', 'Proyecto finalizado'],
  ])('estado %s: explica por qué ya no se puede aportar', (estado, texto) => {
    render(<PanelInversion proyecto={{ ...proyecto, estado: estado as ProyectoDetalle['estado'] }} />);
    expect(screen.getByText(texto)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Invertir ahora/ })).not.toBeInTheDocument();
  });

  test('el ROI solo aparece si el gestor lo cargó y va con su advertencia', () => {
    const { rerender } = render(<PanelInversion proyecto={proyecto} />);
    expect(screen.queryByText('ROI estimado')).not.toBeInTheDocument();
    rerender(<PanelInversion proyecto={{ ...proyecto, roi_estimado: 12.5 }} />);
    expect(screen.getByText('~12.5%')).toBeInTheDocument();
    expect(screen.getByText(/no garantiza rendimientos/)).toBeInTheDocument();
  });

  test('no promete lo que no puede: sin "Seguro" ni "Verificado", solo hechos comprobables', () => {
    render(<PanelInversion proyecto={proyecto} />);
    expect(screen.queryByText(/^Seguro$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Verificado$/)).not.toBeInTheDocument();
    expect(screen.getByText('Tesorería confirma cada aporte')).toBeInTheDocument();
  });

  test('nunca muestra quiénes son los socios', () => {
    const { container } = render(<PanelInversion proyecto={proyecto} />);
    expect(container.textContent).not.toMatch(/Inversionista|@/);
  });
});

describe('BarraDatos', () => {
  test('muestra socios, avance y ubicación; la fecha de cierre solo mientras capta', () => {
    const { rerender } = render(<BarraDatos proyecto={{ ...proyecto, avance_pct: 35 }} />);
    expect(screen.getByText('Socios').nextElementSibling).toHaveTextContent('3');
    expect(screen.getByText('35%')).toBeInTheDocument();
    expect(screen.getByText('Miraflores')).toBeInTheDocument();
    expect(screen.getByText('Cierre de captación')).toBeInTheDocument();
    rerender(<BarraDatos proyecto={{ ...proyecto, estado: 'en_ejecucion' }} />);
    expect(screen.queryByText('Cierre de captación')).not.toBeInTheDocument();
  });

  test('sin ubicación no deja un hueco', () => {
    render(<BarraDatos proyecto={{ ...proyecto, ubicacion: null }} />);
    expect(screen.queryByText('Ubicación')).not.toBeInTheDocument();
  });
});

describe('TabsProyecto', () => {
  const pestanas = [
    { id: 'a', etiqueta: 'Descripción', contenido: <p>Texto A</p> },
    { id: 'b', etiqueta: 'Avance de obra', insignia: 2, contenido: <p>Texto B</p> },
    { id: 'c', etiqueta: 'Cierres', insignia: 0, contenido: <p>Texto C</p> },
  ];

  test('muestra la primera pestaña y cambia al pulsar otra', () => {
    render(<TabsProyecto pestanas={pestanas} />);
    expect(screen.getByRole('tab', { name: 'Descripción' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Texto A')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Avance de obra/ }));
    expect(screen.getByText('Texto B')).toBeInTheDocument();
    expect(screen.queryByText('Texto A')).not.toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'tab-b');
  });

  test('la insignia solo aparece si es mayor que cero', () => {
    render(<TabsProyecto pestanas={pestanas} />);
    expect(within(screen.getByRole('tab', { name: /Avance de obra/ })).getByText('2')).toBeInTheDocument();
    expect(within(screen.getByRole('tab', { name: 'Cierres' })).queryByText('0')).not.toBeInTheDocument();
  });

  test('puede abrir en una pestaña inicial', () => {
    render(<TabsProyecto pestanas={pestanas} inicial="c" />);
    expect(screen.getByText('Texto C')).toBeInTheDocument();
  });
});
