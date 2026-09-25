import { EmptyState, ProgressBar } from '@/components/ui/primitives';
import { formatearFecha, formatearPorcentaje } from '@/lib/format';
import type { Avance } from '@/lib/types';

/** Historial de avance de obra con las fotos publicadas (se sirven a través de /api/adjunto, con control de acceso). */
export function AvanceTimeline({ avances }: { avances: Avance[] }) {
  if (avances.length === 0) {
    return <EmptyState titulo="Aún no hay avances publicados" descripcion="Cuando Akallpa publique un avance de obra lo verás aquí." />;
  }
  return (
    <ol className="space-y-5">
      {avances.map((a) => (
        <li key={a.id} className="rounded-2xl border border-white/5 bg-slate-900/30 p-5">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-semibold text-white">{a.titulo}</h4>
            <span className="text-xs text-slate-500">{formatearFecha(a.fecha)}</span>
          </div>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar valor={a.avance_pct} etiqueta={`Avance acumulado: ${a.titulo}`} />
            </div>
            <span className="w-14 text-right font-mono text-sm text-slate-300">{formatearPorcentaje(a.avance_pct, 0)}</span>
          </div>
          {a.descripcion && <p className="whitespace-pre-line text-sm text-slate-300">{a.descripcion}</p>}
          {a.imagenes.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {a.imagenes.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element -- la imagen se sirve por un route handler autenticado
                <img
                  key={img.id}
                  src={`/api/adjunto?id=${img.id}`}
                  alt={`Foto del avance: ${a.titulo}`}
                  loading="lazy"
                  className="aspect-video w-full rounded-xl border border-white/10 object-cover"
                />
              ))}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
