import { render, screen, within } from '@testing-library/react';

import { MovimientosLista } from '@/components/cuenta/MovimientosLista';
import { AvanceTimeline } from '@/components/proyectos/AvanceTimeline';
import { CierresLista, FacturasTabla, RubrosBarras } from '@/components/proyectos/CierreComponentes';
import { ProyectoCard } from '@/components/proyectos/ProyectoCard';
import { Alert, Badge, EmptyState, ProgressBar, Stat, tonoDeEstado } from '@/components/ui/primitives';
import type { FacturaLinea, ProyectoResumen } from '@/lib/types';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, prefetch: _prefetch, ...resto }: { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const proyecto: ProyectoResumen = {
  id: 7,
  nombre: 'Torre Miraflores',
  empresa: 'Akallpa S.A.C.',
  estado: 'captando',
  moneda: 'PEN',
  capital_objetivo: 100000,
  capital_aportado: 40000,
  porcentaje_recaudado: 40,
  fecha_limite: '2026-12-31',
  avance_pct: 15,
  mi_participacion: null,
};

describe('ProgressBar', () => {
  test('expone el progreso como barra accesible y limita el valor a 0-100', () => {
    const { rerender } = render(<ProgressBar valor={40} etiqueta="Capital" />);
    const barra = screen.getByRole('progressbar', { name: 'Capital' });
    expect(barra).toHaveAttribute('aria-valuenow', '40');
    rerender(<ProgressBar valor={250} etiqueta="Capital" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar valor={-3} etiqueta="Capital" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('primitivas', () => {
  test('Alert de error usa role=alert; las demás role=status', () => {
    const { rerender } = render(<Alert tipo="error">Falló</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
    rerender(<Alert tipo="exito">Listo</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Listo');
  });
  test('Stat, Badge y EmptyState muestran su contenido', () => {
    render(
      <>
        <Stat etiqueta="Saldo" valor="S/ 10.00" ayuda="ayuda" />
        <Badge>Etiqueta</Badge>
        <EmptyState titulo="Nada" descripcion="Todavía no hay datos" />
      </>
    );
    expect(screen.getByText('Saldo')).toBeInTheDocument();
    expect(screen.getByText('S/ 10.00')).toBeInTheDocument();
    expect(screen.getByText('Etiqueta')).toBeInTheDocument();
    expect(screen.getByText('Todavía no hay datos')).toBeInTheDocument();
  });
  test('tono según estado del proyecto', () => {
    expect(tonoDeEstado('captando')).toBe('azul');
    expect(tonoDeEstado('en_ejecucion')).toBe('verde');
    expect(tonoDeEstado('liquidando')).toBe('amarillo');
    expect(tonoDeEstado('otro')).toBe('gris');
  });
});

describe('ProyectoCard', () => {
  test('muestra nombre, estado, capital y enlaza al detalle', () => {
    render(<ProyectoCard proyecto={proyecto} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/proyectos/7');
    expect(screen.getByRole('heading', { name: 'Torre Miraflores' })).toBeInTheDocument();
    expect(screen.getByText('Captando aportes')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /Capital recaudado de Torre Miraflores/ })).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText(/Hasta 31 dic 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/Tu aporte/)).not.toBeInTheDocument();
  });

  test('si participa, muestra su aporte', () => {
    render(<ProyectoCard proyecto={{ ...proyecto, mi_participacion: { aportado: 5000, comprometido: 0, porcentaje: 12.5, estado: 'activa' } }} />);
    expect(screen.getByText(/Tu aporte/)).toHaveTextContent(/5[\s., ]?000/);
    expect(screen.getByText(/12\.50%/)).toBeInTheDocument();
  });

  test('un proyecto en ejecución no muestra fecha límite', () => {
    render(<ProyectoCard proyecto={{ ...proyecto, estado: 'en_ejecucion' }} />);
    expect(screen.getByText('En ejecución')).toBeInTheDocument();
    expect(screen.queryByText(/Hasta/)).not.toBeInTheDocument();
  });
});

const factura = (extra: Partial<FacturaLinea>): FacturaLinea => ({
  fecha: '2026-09-01', documento: 'F001-1', tipo: 'compra', tercero: 'Ferretería', concepto: 'Cemento',
  rubro: 'Cimentación', monto: 1000, comprobante: false, move_id: null, ...extra,
});

describe('FacturasTabla', () => {
  test('el enlace al comprobante solo aparece cuando está disponible', () => {
    render(
      <FacturasTabla
        cierreId={3}
        moneda="PEN"
        facturas={[factura({ documento: 'F001-1', comprobante: true, move_id: 9 }), factura({ documento: 'F001-2' })]}
      />
    );
    const enlace = screen.getByRole('link', { name: 'Ver comprobante F001-1' });
    expect(enlace).toHaveAttribute('href', '/api/comprobante?cierre=3&move=9');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  test('un comprobante marcado sin move_id no genera enlace roto', () => {
    render(<FacturasTabla cierreId={3} moneda="PEN" facturas={[factura({ comprobante: true, move_id: null })]} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('distingue compras y ventas, muestra rubro y usa cabeceras accesibles', () => {
    render(<FacturasTabla cierreId={1} moneda="PEN" facturas={[factura({ tipo: 'venta', documento: 'V-1', rubro: null })]} />);
    expect(screen.getByText('Venta')).toBeInTheDocument();
    const tabla = screen.getByRole('table');
    expect(within(tabla).getAllByRole('columnheader').length).toBeGreaterThanOrEqual(6);
    expect(within(tabla).getAllByText('—').length).toBeGreaterThan(0);
  });

  test('sin facturas muestra un mensaje', () => {
    render(<FacturasTabla cierreId={1} moneda="PEN" facturas={[]} />);
    expect(screen.getByText('No hay facturas en este cierre')).toBeInTheDocument();
  });

  test('los textos con HTML se muestran como texto (React los escapa)', () => {
    render(<FacturasTabla cierreId={1} moneda="PEN" facturas={[factura({ concepto: '<img src=x onerror=alert(1)>' })]} />);
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('RubrosBarras y CierresLista', () => {
  test('cada rubro muestra su monto y peso', () => {
    render(<RubrosBarras total={1500} moneda="PEN" rubros={[{ nombre: 'Cimentación', monto: 1000 }, { nombre: 'Acabados', monto: 500 }]} />);
    expect(screen.getByText('Cimentación')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Peso del rubro Cimentación' })).toHaveAttribute('aria-valuenow', '67');
  });
  test('sin costos no divide entre cero', () => {
    render(<RubrosBarras total={0} moneda="PEN" rubros={[{ nombre: 'X', monto: 0 }]} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
  test('la lista de cierres enlaza a cada cierre y colorea el resultado', () => {
    render(
      <CierresLista
        proyectoId={7}
        moneda="PEN"
        cierres={[{ id: 4, periodo_fin: '2026-09-30', avance_pct: 40, total_ventas: 3000, total_costos: 4000, resultado: -1000 }]}
      />
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/proyectos/7/cierres/4');
    expect(screen.getByText(/Resultado/)).toHaveClass('text-red-300');
  });
  test('sin cierres explica qué es el cierre mensual', () => {
    render(<CierresLista proyectoId={7} moneda="PEN" cierres={[]} />);
    expect(screen.getByText(/Todavía no hay cierres mensuales publicados/)).toBeInTheDocument();
  });
});

describe('AvanceTimeline y MovimientosLista', () => {
  test('las fotos se piden al route handler autenticado, nunca a Odoo directamente', () => {
    render(
      <AvanceTimeline
        avances={[{ id: 1, fecha: '2026-08-01', titulo: 'Cimientos', descripcion: 'Listo', avance_pct: 20, imagenes: [{ id: 55, nombre: 'a.jpg' }] }]}
      />
    );
    const img = screen.getByRole('img', { name: /Foto del avance: Cimientos/ });
    expect(img).toHaveAttribute('src', '/api/adjunto?id=55');
  });
  test('sin avances muestra un mensaje', () => {
    render(<AvanceTimeline avances={[]} />);
    expect(screen.getByText('Aún no hay avances publicados')).toBeInTheDocument();
  });
  test('los movimientos muestran signo, color y etiqueta legible', () => {
    render(
      <MovimientosLista
        movimientos={[
          { id: 1, fecha: '2026-09-01 10:00:00', tipo: 'deposito', importe: 500, saldo_posterior: 500, moneda: 'PEN', proyecto: null, descripcion: '', referencia: '' },
          { id: 2, fecha: '2026-09-02 10:00:00', tipo: 'aporte', importe: -300, saldo_posterior: 200, moneda: 'PEN', proyecto: 'Torre', descripcion: '', referencia: '' },
        ]}
      />
    );
    expect(screen.getByText('Depósito')).toBeInTheDocument();
    expect(screen.getByText('Aporte a proyecto')).toBeInTheDocument();
    expect(screen.getByText(/^\+/)).toHaveClass('text-emerald-300');
    expect(screen.getByText(/Torre/)).toBeInTheDocument();
  });
  test('sin movimientos muestra un mensaje', () => {
    render(<MovimientosLista movimientos={[]} />);
    expect(screen.getByText('Aún no tienes movimientos')).toBeInTheDocument();
  });
});
