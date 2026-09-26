import { fireEvent, render, screen } from '@testing-library/react';

import { MapaProyectos } from '@/components/mapa/MapaProyectos';
import type { ProyectoResumen } from '@/lib/types';

// Leaflet necesita el navegador real: aquí solo se prueba la lista y los filtros.
jest.mock('next/dynamic', () => () => function MapaFalso() {
  return <div data-testid="mapa" />;
});

const base = {
  empresa: 'Akallpa', moneda: 'PEN', capital_objetivo: 100000, capital_aportado: 0, porcentaje_recaudado: 40, fecha_limite: null, plazo_vencido: false,
  avance_pct: 0, tipo: 'casa', ticket_minimo: null, roi_estimado: null, comision_gestor: 10, socios: 0, tiene_imagen: false, mi_participacion: null,
} as const;

const proyectos = [
  { ...base, id: 1, nombre: 'Casa Miraflores', estado: 'captando', ubicacion: 'Miraflores', coordenadas: { lat: -12.12, lng: -77.03 } },
  { ...base, id: 2, nombre: 'Residencial Olivos', estado: 'en_ejecucion', ubicacion: 'Los Olivos', coordenadas: { lat: -11.98, lng: -77.07 } },
  { ...base, id: 3, nombre: 'Torre sin pin', estado: 'captando', ubicacion: 'Barranco', coordenadas: null },
] as ProyectoResumen[];

describe('MapaProyectos', () => {
  test('lista los proyectos ubicados y aparta los que no tienen posición', () => {
    render(<MapaProyectos proyectos={proyectos} />);
    expect(screen.getByTestId('mapa')).toBeInTheDocument();
    expect(screen.getByText('Casa Miraflores')).toBeInTheDocument();
    expect(screen.getByText('Ubicación aún no publicada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Torre sin pin/ })).toHaveAttribute('href', '/proyectos/3');
  });

  test('el filtro por etapa oculta los demás', () => {
    render(<MapaProyectos proyectos={proyectos} />);
    fireEvent.click(screen.getByRole('button', { name: 'En obra' }));
    expect(screen.getByText('Residencial Olivos')).toBeInTheDocument();
    expect(screen.queryByText('Casa Miraflores')).not.toBeInTheDocument();
    expect(screen.queryByText('Torre sin pin')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'En obra' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('al elegir un proyecto aparecen sus enlaces y al volver a tocarlo se cierran', () => {
    render(<MapaProyectos proyectos={proyectos} />);
    const boton = screen.getByRole('button', { name: /Casa Miraflores/ });
    fireEvent.click(boton);
    expect(screen.getByRole('link', { name: 'Ver proyecto' })).toHaveAttribute('href', '/proyectos/1');
    expect(screen.getByRole('link', { name: /Abrir en Google Maps/ })).toHaveAttribute('href', expect.stringContaining('query=-12.12,-77.03'));
    fireEvent.click(boton);
    expect(screen.queryByRole('link', { name: 'Ver proyecto' })).not.toBeInTheDocument();
  });

  test('sin proyectos publicados lo explica', () => {
    render(<MapaProyectos proyectos={[]} />);
    expect(screen.getByText('Aún no hay proyectos publicados')).toBeInTheDocument();
  });

  test('una etapa sin proyectos avisa en vez de quedar vacía', () => {
    render(<MapaProyectos proyectos={proyectos} />);
    fireEvent.click(screen.getByRole('button', { name: 'Liquidados' }));
    expect(screen.getByText('No hay proyectos en esta etapa.')).toBeInTheDocument();
  });
});
