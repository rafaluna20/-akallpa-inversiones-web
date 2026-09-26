import { FaCalendarAlt, FaHardHat, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

import { formatearFecha, formatearPorcentaje } from '@/lib/format';
import type { ProyectoResumen } from '@/lib/types';

/** Barra de datos del proyecto (equivale a la StatsBar de Inversiones Pro, sin votos ni comentarios). */
export function BarraDatos({ proyecto }: { proyecto: ProyectoResumen }) {
  const p = proyecto;
  const datos = [
    { icono: <FaUsers className="text-xl text-purple-400" aria-hidden />, etiqueta: 'Socios', valor: String(p.socios) },
    { icono: <FaHardHat className="text-xl text-blue-400" aria-hidden />, etiqueta: 'Avance de obra', valor: formatearPorcentaje(p.avance_pct, 0) },
    ...(p.estado === 'captando' && p.fecha_limite
      ? [{ icono: <FaCalendarAlt className="text-xl text-amber-400" aria-hidden />, etiqueta: 'Cierre de captación', valor: formatearFecha(p.fecha_limite) }]
      : []),
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-4 lg:gap-6">
      {datos.map((d) => (
        <div key={d.etiqueta} className="flex items-center gap-2">
          {d.icono}
          <div>
            <p className="text-xs text-gray-500">{d.etiqueta}</p>
            <p className="text-lg font-bold text-white">{d.valor}</p>
          </div>
        </div>
      ))}
      {p.ubicacion && (
        <div className="ml-auto flex items-center gap-2">
          <FaMapMarkerAlt className="text-xl text-green-400" aria-hidden />
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="text-sm font-semibold text-white">{p.ubicacion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
