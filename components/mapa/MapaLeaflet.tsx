'use client';

/** Mapa Leaflet. Solo en el navegador: se importa con `dynamic(..., { ssr: false })`. */
import L from 'leaflet';
import { useEffect, useRef } from 'react';

import 'leaflet/dist/leaflet.css';

import { ETIQUETA_ESTADO_PROYECTO, formatearPorcentaje } from '@/lib/format';
import { calcularEncuadre, COLOR_PIN, COLOR_PIN_SELECCIONADO, type ProyectoUbicado } from '@/lib/mapa';

interface Props {
  proyectos: ProyectoUbicado[];
  seleccionadoId: number | null;
  onSeleccionar: (id: number | null) => void;
}

function icono(color: string, grande: boolean): L.DivIcon {
  const t = grande ? 38 : 30;
  return L.divIcon({
    className: '',
    iconSize: [t, t],
    iconAnchor: [t / 2, t],
    popupAnchor: [0, -t],
    html: `<svg width="${t}" height="${t}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C7.6 2 4 5.5 4 9.9 4 15.6 12 22 12 22s8-6.4 8-12.1C20 5.5 16.4 2 12 2z" fill="${color}" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>`,
  });
}

/** El popup se arma con nodos DOM y `textContent`: el nombre del proyecto lo escribe el gestor y nunca debe interpretarse como HTML. */
function contenidoPopup(p: ProyectoUbicado): HTMLElement {
  const raiz = document.createElement('div');
  raiz.style.cssText = 'padding:2px;color:#0f172a;font-size:12px;line-height:1.4';
  const titulo = document.createElement('a');
  titulo.href = `/proyectos/${p.id}`;
  titulo.textContent = p.nombre;
  titulo.style.cssText = 'display:block;font-size:14px;font-weight:700;color:#1d4ed8;text-decoration:underline';
  const estado = document.createElement('div');
  estado.textContent = `${ETIQUETA_ESTADO_PROYECTO[p.estado] ?? p.estado} · ${formatearPorcentaje(p.porcentaje_recaudado, 0)} recaudado`;
  raiz.append(titulo, estado);
  if (p.ubicacion) {
    const u = document.createElement('div');
    u.textContent = p.ubicacion;
    u.style.color = '#64748b';
    raiz.append(u);
  }
  return raiz;
}

export default function MapaLeaflet({ proyectos, seleccionadoId, onSeleccionar }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const capa = useRef<L.LayerGroup | null>(null);
  const marcadores = useRef<Map<number, L.Marker>>(new Map());
  const alSeleccionar = useRef(onSeleccionar);
  alSeleccionar.current = onSeleccionar;

  useEffect(() => {
    if (!contenedor.current || mapa.current) return;
    const m = L.map(contenedor.current).setView([-9.19, -75.0152], 5);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>',
    }).addTo(m);
    m.on('click', () => alSeleccionar.current(null));
    capa.current = L.layerGroup().addTo(m);
    mapa.current = m;
    const pines = marcadores.current;
    return () => {
      m.remove();
      mapa.current = null;
      capa.current = null;
      pines.clear();
    };
  }, []);

  // Pines y encuadre: se rehacen cuando cambia el conjunto de proyectos (por ejemplo al filtrar).
  useEffect(() => {
    const m = mapa.current;
    const grupo = capa.current;
    if (!m || !grupo) return;
    grupo.clearLayers();
    marcadores.current.clear();
    for (const p of proyectos) {
      const pin = L.marker([p.coordenadas.lat, p.coordenadas.lng], { icon: icono(COLOR_PIN[p.estado], false), title: p.nombre, keyboard: true })
        .bindPopup(contenidoPopup(p), { closeButton: true, autoPan: true })
        .on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          alSeleccionar.current(p.id);
        })
        .addTo(grupo);
      marcadores.current.set(p.id, pin);
    }
    const { centro, limites } = calcularEncuadre(proyectos.map((p) => p.coordenadas));
    if (limites) m.fitBounds(limites, { padding: [60, 60], maxZoom: 15 });
    else m.setView([centro.lat, centro.lng], proyectos.length ? 15 : 5);
  }, [proyectos]);

  // Selección: resalta el pin, abre su popup y vuela hasta él.
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    for (const p of proyectos) {
      marcadores.current.get(p.id)?.setIcon(p.id === seleccionadoId ? icono(COLOR_PIN_SELECCIONADO, true) : icono(COLOR_PIN[p.estado], false));
    }
    const elegido = proyectos.find((p) => p.id === seleccionadoId);
    if (!elegido) {
      m.closePopup();
      return;
    }
    m.flyTo([elegido.coordenadas.lat, elegido.coordenadas.lng], Math.max(m.getZoom(), 15), { duration: 0.8 });
    marcadores.current.get(elegido.id)?.openPopup();
  }, [seleccionadoId, proyectos]);

  return <div ref={contenedor} className="h-full w-full" role="application" aria-label="Mapa de proyectos" />;
}
