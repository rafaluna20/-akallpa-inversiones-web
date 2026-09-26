import { formatearFecha, formatearMonto } from '@/lib/format';
import { etiquetaMes, geometriaEvolucion } from '@/lib/patrimonio';
import type { PuntoPatrimonio } from '@/lib/types';

const linea = (puntos: { x: number; y: number }[]) => puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

/**
 * Evolución mensual del patrimonio (a costo) frente a lo que la persona puso de su bolsillo.
 * La distancia entre las dos líneas es lo ganado (o perdido). Con menos de 2 meses no hay evolución que mostrar.
 */
export function GraficoPatrimonio({ puntos, moneda }: { puntos: PuntoPatrimonio[]; moneda: string }) {
  const g = geometriaEvolucion(puntos);
  if (!g) return null;
  const { ancho, alto, margen, ejeX, ejeY } = g;
  const yBase = alto - margen.abajo;
  const area = `${margen.izq},${yBase} ${linea(g.patrimonio)} ${ancho - margen.der},${yBase}`;
  const ultimo = puntos[puntos.length - 1];

  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label={`Evolución mensual del patrimonio: ${formatearMonto(ultimo.patrimonio, moneda)} al ${formatearFecha(ultimo.fecha)}`} className="w-full">
        <defs>
          <linearGradient id="relleno-patrimonio" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ejeY.map((l) => (
          <g key={l.valor}>
            <line x1={margen.izq} x2={ancho - margen.der} y1={l.y} y2={l.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x={margen.izq + 2} y={l.y - 3} fontSize="9" fill="rgba(255,255,255,0.45)">{formatearMonto(l.valor, moneda)}</text>
          </g>
        ))}
        <polygon points={area} fill="url(#relleno-patrimonio)" />
        <polyline fill="none" stroke="#cbd5e1" strokeOpacity="0.7" strokeWidth="1.8" strokeDasharray="5 4" strokeLinejoin="round" points={linea(g.puesto)} />
        <polyline fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={linea(g.patrimonio)} />
        <circle cx={g.patrimonio[g.patrimonio.length - 1].x} cy={g.patrimonio[g.patrimonio.length - 1].y} r="5" fill="#22d3ee" stroke="#fff" strokeWidth="2" />
        {ejeX.map((e) => (
          <text key={e.fecha} x={e.x} y={alto - 6} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">{etiquetaMes(e.fecha)}</text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/70">
        <span className="flex items-center gap-2"><span className="h-1 w-5 rounded bg-cyan-400" aria-hidden /> Patrimonio (a costo)</span>
        <span className="flex items-center gap-2"><span className="h-0 w-5 border-t-2 border-dashed border-slate-300/70" aria-hidden /> Lo que pusiste (depósitos − retiros)</span>
      </figcaption>
      <table className="sr-only">
        <caption>Evolución mensual del patrimonio</caption>
        <thead><tr><th>Fecha</th><th>Patrimonio</th><th>Lo que pusiste</th></tr></thead>
        <tbody>
          {puntos.map((p) => (
            <tr key={p.fecha}><td>{p.fecha}</td><td>{formatearMonto(p.patrimonio, moneda)}</td><td>{formatearMonto(p.puesto, moneda)}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
