'use client';

import clsx from 'clsx';
import { useState, type ReactNode } from 'react';

export interface PestanaProyecto {
  id: string;
  etiqueta: string;
  insignia?: number;
  contenido: ReactNode;
}

/** Pestañas del detalle del proyecto (Descripción, Avance de obra, Cierres, Detalles), como las de Inversiones Pro. */
export function TabsProyecto({ pestanas, inicial }: { pestanas: PestanaProyecto[]; inicial?: string }) {
  const [activa, setActiva] = useState(inicial ?? pestanas[0]?.id);
  const actual = pestanas.find((t) => t.id === activa);

  return (
    <div className="w-full">
      <div role="tablist" aria-label="Información del proyecto" className="scrollbar-hide mb-6 flex gap-1 overflow-x-auto border-b border-white/10">
        {pestanas.map((t) => {
          const seleccionada = t.id === activa;
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={seleccionada}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActiva(t.id)}
              className={clsx('relative whitespace-nowrap px-6 py-3 font-semibold transition-colors', seleccionada ? 'text-blue-400' : 'text-gray-400 hover:text-gray-300')}
            >
              <span className="flex items-center gap-2">
                {t.etiqueta}
                {t.insignia !== undefined && t.insignia > 0 && (
                  <span className="min-w-[20px] rounded-full bg-blue-500 px-2 py-0.5 text-center text-xs text-white">{t.insignia}</span>
                )}
              </span>
              {seleccionada && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />}
            </button>
          );
        })}
      </div>
      {actual && (
        <div key={actual.id} id={`panel-${actual.id}`} role="tabpanel" aria-labelledby={`tab-${actual.id}`} className="min-h-[200px]">
          {actual.contenido}
        </div>
      )}
    </div>
  );
}
