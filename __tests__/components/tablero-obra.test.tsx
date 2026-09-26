import { render, screen, within } from '@testing-library/react';

import { GraficoEvolucion, TableroObra } from '@/components/proyectos/TableroObra';
import type { InformeObra, Tablero } from '@/lib/types';

const ok = (valor: number, texto: string) => ({ valor, ok: valor >= 1, texto });

const informe: InformeObra = {
  id: 3, nombre: 'Informe de septiembre', fecha: '2026-09-28', estado: 'on_track', estado_texto: 'En camino', avance: 35,
  cpi: null, spi: null, descripcion: 'Se vació la platea.\nSe inició el armado de columnas.',
  tareas: { total: 10, cerradas: 4, porcentaje: 40 },
  evm: { bac: 500000, pv: 100000, ev: 120000, ac: 100000, sin_datos: false, cpi: ok(1.2, 'Ahorro en costos'), spi: ok(0.8, 'Retrasado') },
};

const base: Tablero = {
  participa: true, moneda: 'PEN', ultimo: informe,
  historial: [
    { id: 1, nombre: 'Julio', fecha: '2026-07-31', estado: 'on_track', estado_texto: 'En camino', avance: 10, cpi: ok(1.0, ''), spi: ok(0.9, '') },
    { id: 2, nombre: 'Agosto', fecha: '2026-08-31', estado: 'at_risk', estado_texto: 'En riesgo', avance: 22, cpi: ok(1.1, ''), spi: ok(0.85, '') },
    { id: 3, nombre: 'Septiembre', fecha: '2026-09-28', estado: 'on_track', estado_texto: 'En camino', avance: 35, cpi: ok(1.2, ''), spi: ok(0.8, '') },
  ],
  resultado: { ventas: 90000, costos: 55000, margen: 35000 },
  mayores_gastos: [{ fecha: '2026-09-10', descripcion: 'Concreto premezclado', monto: 40000 }],
};

describe('TableroObra', () => {
  test('sin informes publicados lo explica', () => {
    render(<TableroObra tablero={{ ...base, ultimo: null, historial: [] }} />);
    expect(screen.getByText('Aún no hay informes de obra publicados')).toBeInTheDocument();
  });

  test('muestra estado, avance, tareas y el texto del informe', () => {
    render(<TableroObra tablero={base} />);
    expect(screen.getByText('Informe de septiembre')).toBeInTheDocument();
    expect(screen.getByText('En camino', { selector: 'span.inline-flex' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Avance de obra' })).toHaveAttribute('aria-valuenow', '35');
    expect(screen.getByRole('progressbar', { name: 'Tareas cerradas' })).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText(/Se vació la platea/)).toBeInTheDocument();
  });

  test('un participante ve la salud EVM con semáforos, el resultado y los mayores gastos', () => {
    render(<TableroObra tablero={base} />);
    const evm = screen.getByRole('region', { name: 'Salud del proyecto (EVM)' });
    expect(within(evm).getByText('Presupuesto base (BAC)').closest('tr')).toHaveTextContent(/500[\s.,]?000/);
    expect(within(evm).getByText('CPI · eficiencia de costo').closest('tr')).toHaveTextContent('Ahorro en costos');
    expect(within(evm).getByText('SPI · eficiencia de cronograma').closest('tr')).toHaveTextContent('Retrasado');
    expect(screen.getByRole('region', { name: 'Resultado acumulado' })).toHaveTextContent(/35[\s.,]?000/);
    expect(screen.getByText('Concreto premezclado')).toBeInTheDocument();
  });

  test('sin valorizaciones no muestra índices en rojo: avisa que aún no hay datos', () => {
    const sinDatos = { ...informe, evm: { bac: 500000, pv: 0, ev: 0, ac: 1200, sin_datos: true, cpi: null, spi: null } };
    render(<TableroObra tablero={{ ...base, ultimo: sinDatos }} />);
    expect(screen.getByText(/aparecerán cuando haya valorizaciones aprobadas/)).toBeInTheDocument();
    expect(screen.queryByText('Sobrecosto')).not.toBeInTheDocument();
    expect(screen.queryByText('Retrasado')).not.toBeInTheDocument();
  });

  test('sin el módulo de EVM no hay tabla EVM pero sí el resto', () => {
    render(<TableroObra tablero={{ ...base, ultimo: { ...informe, evm: null } }} />);
    expect(screen.queryByRole('region', { name: 'Salud del proyecto (EVM)' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Resultado acumulado' })).toBeInTheDocument();
  });

  test('quien no participa ve estado y avance, pero ningún monto ni índice', () => {
    const publico: Tablero = {
      ...base, participa: false, resultado: null, mayores_gastos: [],
      ultimo: { ...informe, evm: null }, historial: base.historial.map((h) => ({ ...h, cpi: null, spi: null })),
    };
    const { container } = render(<TableroObra tablero={publico} />);
    expect(screen.getByRole('progressbar', { name: 'Avance de obra' })).toBeInTheDocument();
    expect(screen.getByText(/disponibles para quienes participan/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Salud del proyecto (EVM)' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Resultado acumulado' })).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/500[\s.,]?000|Concreto|BAC/);
    expect(screen.getByRole('img', { name: /Evolución del avance/ })).toBeInTheDocument();   // el avance sí es público
  });

  test('cada estado de la obra se muestra con su texto', () => {
    const { rerender } = render(<TableroObra tablero={{ ...base, ultimo: { ...informe, estado: 'off_track', estado_texto: 'Atrasado' } }} />);
    expect(screen.getByText('Atrasado', { selector: 'span.inline-flex' })).toBeInTheDocument();
    rerender(<TableroObra tablero={{ ...base, ultimo: { ...informe, estado: 'at_risk', estado_texto: 'En riesgo' } }} />);
    expect(screen.getByText('En riesgo', { selector: 'span.inline-flex' })).toBeInTheDocument();
  });

  test('sin tareas no divide entre cero', () => {
    render(<TableroObra tablero={{ ...base, ultimo: { ...informe, tareas: { total: 0, cerradas: 0, porcentaje: 0 } } }} />);
    expect(screen.getByRole('progressbar', { name: 'Tareas cerradas' })).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('GraficoEvolucion', () => {
  test('con un solo informe no dibuja nada', () => {
    const { container } = render(<GraficoEvolucion historial={base.historial.slice(0, 1)} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('dibuja las series y ofrece una tabla equivalente para lectores de pantalla', () => {
    const { container } = render(<GraficoEvolucion historial={base.historial} />);
    expect(container.querySelectorAll('polyline')).toHaveLength(3);
    expect(screen.getByText(/Avance \(%\):/).parentElement).toHaveTextContent('35%');
    expect(screen.getByText('La línea punteada marca el índice 1.0 (en meta).')).toBeInTheDocument();
    const tabla = container.querySelector('table.sr-only') as HTMLElement;
    expect(within(tabla).getAllByRole('row')).toHaveLength(4);
  });
});
