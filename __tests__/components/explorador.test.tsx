import { fireEvent, render, screen, within } from '@testing-library/react';

import { ExploradorProyectos, filtrarYOrdenar } from '@/components/proyectos/ExploradorProyectos';
import type { ProyectoResumen } from '@/lib/types';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, prefetch: _prefetch, ...resto }: { href: string; children: React.ReactNode; prefetch?: boolean }) => (
    <a href={href} {...resto}>
      {children}
    </a>
  ),
}));

const base: ProyectoResumen = {
  id: 1, nombre: 'Casa Miraflores', empresa: 'Akallpa', estado: 'captando', moneda: 'PEN', capital_objetivo: 150000,
  capital_aportado: 40000, porcentaje_recaudado: 26.7, fecha_limite: '2026-12-01', plazo_vencido: false, avance_pct: 0, tipo: 'casa',
  ubicacion: 'Miraflores', ticket_minimo: null, roi_estimado: null, comision_gestor: 10, socios: 1, tiene_imagen: false,
  mi_participacion: null,
};
const proyectos: ProyectoResumen[] = [
  base,
  { ...base, id: 2, nombre: 'Residencial Olivos', tipo: 'multifamiliar', ubicacion: 'Los Olivos', estado: 'en_ejecucion', capital_objetivo: 300000, porcentaje_recaudado: 66.7, socios: 5 },
  { ...base, id: 3, nombre: 'Torre Barranco', tipo: 'departamento', ubicacion: 'Barranco', capital_objetivo: 90000, porcentaje_recaudado: 95, socios: 2 },
];

describe('filtrarYOrdenar', () => {
  const opciones = { tipo: 'todos', orden: 'recientes' as const, consulta: '' };

  test('por defecto ordena del más reciente al más antiguo', () => {
    expect(filtrarYOrdenar(proyectos, opciones).map((p) => p.id)).toEqual([3, 2, 1]);
  });

  test('filtra por categoría, por estado fijo y por texto (nombre, empresa o ubicación)', () => {
    expect(filtrarYOrdenar(proyectos, { ...opciones, tipo: 'casa' }).map((p) => p.id)).toEqual([1]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, estadoFijo: 'captando' }).map((p) => p.id)).toEqual([3, 1]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, consulta: 'olivos' }).map((p) => p.id)).toEqual([2]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, consulta: 'BARRANCO' }).map((p) => p.id)).toEqual([3]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, consulta: 'no existe' })).toEqual([]);
  });

  test('ordena por inversión, avance y socios', () => {
    expect(filtrarYOrdenar(proyectos, { ...opciones, orden: 'mayor-inversion' }).map((p) => p.id)).toEqual([2, 1, 3]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, orden: 'menor-inversion' }).map((p) => p.id)).toEqual([3, 1, 2]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, orden: 'casi-completos' }).map((p) => p.id)).toEqual([3, 2, 1]);
    expect(filtrarYOrdenar(proyectos, { ...opciones, orden: 'socios' }).map((p) => p.id)).toEqual([2, 3, 1]);
  });

  test('no modifica la lista original', () => {
    const copia = [...proyectos];
    filtrarYOrdenar(proyectos, { ...opciones, orden: 'mayor-inversion' });
    expect(proyectos).toEqual(copia);
  });
});

describe('ExploradorProyectos', () => {
  test('muestra un chip por cada categoría que existe y cuenta los resultados', () => {
    render(<ExploradorProyectos proyectos={proyectos} titulo="Todos los proyectos" />);
    expect(screen.getByText('3 proyectos encontrados')).toBeInTheDocument();
    for (const etiqueta of ['Todos', 'Casas', 'Multifamiliares', 'Departamentos']) {
      expect(screen.getByRole('button', { name: new RegExp(etiqueta) })).toBeInTheDocument();
    }
    expect(screen.queryByRole('button', { name: /Terrenos/ })).not.toBeInTheDocument();
  });

  test('un chip filtra y "Todos" restablece', () => {
    render(<ExploradorProyectos proyectos={proyectos} titulo="Todos los proyectos" />);
    fireEvent.click(screen.getByRole('button', { name: /Multifamiliares/ }));
    expect(screen.getByText('1 proyecto encontrado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Multifamiliares/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Multifamiliares/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Todos/ }));
    expect(screen.getByText('3 proyectos encontrados')).toBeInTheDocument();
  });

  test('cambia el orden y la vista', () => {
    render(<ExploradorProyectos proyectos={proyectos} titulo="Todos los proyectos" />);
    const lista = () => within(screen.getByRole('list')).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(lista()).toEqual(['Torre Barranco', 'Residencial Olivos', 'Casa Miraflores']);
    fireEvent.change(screen.getByLabelText('Ordenar:'), { target: { value: 'menor-inversion' } });
    expect(lista()).toEqual(['Torre Barranco', 'Casa Miraflores', 'Residencial Olivos']);
    fireEvent.click(screen.getByRole('button', { name: 'Vista lista' }));
    expect(screen.getByRole('button', { name: 'Vista lista' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('con una búsqueda muestra la consulta y solo lo que coincide', () => {
    render(<ExploradorProyectos proyectos={proyectos} titulo="Todos los proyectos" consultaInicial="olivos" />);
    expect(screen.getByText('«olivos»')).toBeInTheDocument();
    expect(screen.getByText('1 proyecto encontrado')).toBeInTheDocument();
  });

  test('sin resultados explica qué pasó', () => {
    render(<ExploradorProyectos proyectos={proyectos} titulo="Todos los proyectos" consultaInicial="zzz" />);
    expect(screen.getByText('No encontramos proyectos con esa búsqueda')).toBeInTheDocument();
  });

  test('en Oportunidades solo entran los que están captando', () => {
    render(<ExploradorProyectos proyectos={proyectos} titulo="Oportunidades" estadoFijo="captando" />);
    expect(screen.getByText('2 proyectos encontrados')).toBeInTheDocument();
    expect(screen.queryByText('Residencial Olivos')).not.toBeInTheDocument();
  });

  test('sin categorías definidas no muestra chips', () => {
    render(<ExploradorProyectos proyectos={proyectos.map((p) => ({ ...p, tipo: null }))} titulo="Todos los proyectos" />);
    expect(screen.queryByRole('button', { name: /Todos/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
  });
});
