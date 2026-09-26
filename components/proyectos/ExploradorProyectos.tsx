'use client';

import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { FaBriefcase, FaBuilding, FaCheckCircle, FaCity, FaFilter, FaHome, FaList, FaStore, FaTh, FaTree } from 'react-icons/fa';
import type { IconType } from 'react-icons';

import { EmptyState } from '@/components/ui/primitives';
import { ETIQUETA_TIPO_PLURAL } from '@/lib/format';
import type { EstadoProyecto, ProyectoResumen } from '@/lib/types';

import { ProyectoCard } from './ProyectoCard';

type Orden = 'recientes' | 'socios' | 'mayor-inversion' | 'menor-inversion' | 'casi-completos';
type Vista = 'grid' | 'list';

const ICONOS_TIPO: Record<string, IconType> = {
  casa: FaHome,
  unifamiliar: FaHome,
  departamento: FaBuilding,
  multifamiliar: FaCity,
  local: FaStore,
  terreno: FaTree,
  oficina: FaBriefcase,
};

interface Props {
  proyectos: ProyectoResumen[];
  titulo: string;
  /** Si se indica, solo se muestran proyectos en ese estado (p. ej. "captando" en Oportunidades). */
  estadoFijo?: EstadoProyecto;
  consultaInicial?: string;
}

export function filtrarYOrdenar(
  proyectos: ProyectoResumen[],
  { tipo, orden, consulta, estadoFijo }: { tipo: string; orden: Orden; consulta: string; estadoFijo?: EstadoProyecto }
): ProyectoResumen[] {
  const q = consulta.trim().toLowerCase();
  const lista = proyectos.filter((p) => {
    if (estadoFijo && p.estado !== estadoFijo) return false;
    if (tipo !== 'todos' && p.tipo !== tipo) return false;
    if (q && !`${p.nombre} ${p.empresa} ${p.ubicacion ?? ''}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const por: Record<Orden, (a: ProyectoResumen, b: ProyectoResumen) => number> = {
    recientes: (a, b) => b.id - a.id,
    socios: (a, b) => b.socios - a.socios,
    'mayor-inversion': (a, b) => b.capital_objetivo - a.capital_objetivo,
    'menor-inversion': (a, b) => a.capital_objetivo - b.capital_objetivo,
    'casi-completos': (a, b) => b.porcentaje_recaudado - a.porcentaje_recaudado,
  };
  return [...lista].sort(por[orden]);
}

/** Explorador de proyectos: filtros por categoría, orden, vista en cuadrícula o lista y búsqueda. */
export function ExploradorProyectos({ proyectos, titulo, estadoFijo, consultaInicial = '' }: Props) {
  const [tipo, setTipo] = useState('todos');
  const [orden, setOrden] = useState<Orden>('recientes');
  const [vista, setVista] = useState<Vista>('grid');

  const base = useMemo(() => proyectos.filter((p) => !estadoFijo || p.estado === estadoFijo), [proyectos, estadoFijo]);
  const tipos = useMemo(() => Array.from(new Set(base.map((p) => p.tipo).filter((t): t is string => Boolean(t)))), [base]);
  const visibles = useMemo(
    () => filtrarYOrdenar(proyectos, { tipo, orden, consulta: consultaInicial, estadoFijo }),
    [proyectos, tipo, orden, consultaInicial, estadoFijo]
  );

  return (
    <div>
      {tipos.length > 0 && (
        <section aria-label="Categorías" className="mb-6">
          <p className="mb-3 text-xs text-slate-400" role="status">
            {visibles.length} {visibles.length === 1 ? 'proyecto encontrado' : 'proyectos encontrados'}
          </p>
          <div className="flex flex-wrap gap-3">
            {[{ id: 'todos', etiqueta: 'Todos', icono: FaFilter }, ...tipos.map((t) => ({ id: t, etiqueta: ETIQUETA_TIPO_PLURAL[t] ?? t, icono: ICONOS_TIPO[t] ?? FaBuilding }))].map((c) => {
              const Icono = c.icono;
              const activo = tipo === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTipo(c.id)}
                  aria-pressed={activo}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all active:scale-95',
                    activo ? 'border-slate-500 bg-slate-700 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  )}
                >
                  <Icono size={14} aria-hidden />
                  {c.etiqueta}
                  {activo && <FaCheckCircle size={12} className="text-blue-400" aria-hidden />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section aria-labelledby="titulo-explorador">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <h2 id="titulo-explorador" className="font-display text-2xl font-bold text-white md:text-3xl">
            {tipo === 'todos' ? titulo : `${titulo}: ${ETIQUETA_TIPO_PLURAL[tipo] ?? tipo}`}
            {consultaInicial && <span className="ml-3 text-base font-normal text-slate-400">«{consultaInicial}»</span>}
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="orden" className="text-sm text-slate-400">Ordenar:</label>
              <select
                id="orden"
                value={orden}
                onChange={(e) => setOrden(e.target.value as Orden)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-white transition-colors focus:border-blue-500 focus:outline-none"
              >
                <option value="recientes">Más recientes</option>
                <option value="socios">Más socios</option>
                <option value="mayor-inversion">Mayor inversión</option>
                <option value="menor-inversion">Menor inversión</option>
                <option value="casi-completos">Casi completos</option>
              </select>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-1" role="group" aria-label="Vista">
              {([['grid', FaTh, 'Vista cuadrícula'], ['list', FaList, 'Vista lista']] as const).map(([id, Icono, etiqueta]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVista(id)}
                  aria-pressed={vista === id}
                  title={etiqueta}
                  aria-label={etiqueta}
                  className={clsx('rounded p-2 transition-colors', vista === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}
                >
                  <Icono />
                </button>
              ))}
            </div>
          </div>
        </div>

        {visibles.length === 0 ? (
          <EmptyState
            titulo={consultaInicial ? 'No encontramos proyectos con esa búsqueda' : 'No hay proyectos disponibles por ahora'}
            descripcion={tipo !== 'todos' ? 'Prueba con otra categoría.' : undefined}
          />
        ) : (
          <div className={vista === 'grid' ? 'grid auto-rows-auto grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col gap-8'} role="list">
            {visibles.map((p) => (
              <div key={p.id} role="listitem">
                <ProyectoCard proyecto={p} variant={vista === 'list' ? 'lista' : 'default'} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
