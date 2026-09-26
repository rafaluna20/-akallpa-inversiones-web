import { render, screen } from '@testing-library/react';

import { UbicacionProyecto } from '@/components/mapa/UbicacionProyecto';
import type { ProyectoResumen } from '@/lib/types';

// Leaflet necesita el navegador real: aquí solo se prueba lo que rodea al mapa.
jest.mock('next/dynamic', () => () => function MapaFalso() {
  return <div data-testid="mapa" />;
});

const proyecto = (extra: Partial<ProyectoResumen>) => ({ id: 5, nombre: 'Casa Pucusana', ubicacion: 'Pucusana, Lima', coordenadas: null, ...extra } as ProyectoResumen);

describe('UbicacionProyecto', () => {
  test('con coordenadas muestra el mapa, la zona y los enlaces', () => {
    render(<UbicacionProyecto proyecto={proyecto({ coordenadas: { lat: -12.47, lng: -76.8 } })} />);
    expect(screen.getByTestId('mapa')).toBeInTheDocument();
    expect(screen.getByText('Pucusana, Lima')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir en Google Maps/ })).toHaveAttribute('href', expect.stringContaining('query=-12.47,-76.8'));
    expect(screen.getByRole('link', { name: 'Ver todos los proyectos' })).toHaveAttribute('href', '/mapa');
  });

  test('sin coordenadas no dibuja el mapa y lo explica, con la zona si la hay', () => {
    render(<UbicacionProyecto proyecto={proyecto({})} />);
    expect(screen.queryByTestId('mapa')).not.toBeInTheDocument();
    expect(screen.getByText('Akallpa aún no publicó la ubicación exacta')).toBeInTheDocument();
    expect(screen.getByText(/Zona: Pucusana, Lima/)).toBeInTheDocument();
  });

  test('sin coordenadas ni zona no inventa nada', () => {
    render(<UbicacionProyecto proyecto={proyecto({ ubicacion: null })} />);
    expect(screen.queryByText(/Zona:/)).not.toBeInTheDocument();
  });

  test('coordenadas fuera de rango se tratan como no cargadas', () => {
    render(<UbicacionProyecto proyecto={proyecto({ coordenadas: { lat: 200, lng: 0 } })} />);
    expect(screen.queryByTestId('mapa')).not.toBeInTheDocument();
  });
});
