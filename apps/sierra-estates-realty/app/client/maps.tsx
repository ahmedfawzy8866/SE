'use client';
/**
 * Sierra Estates — live Leaflet maps.
 * Ported from ui_kits/houzez-portal/{compounds.html,property.html}: CARTO light
 * basemap tiles, custom DivIcon markers (AI-score badge on the compounds
 * overview map, a single blue dot on the property mini-map). Real react-leaflet
 * (npm, already a repo dependency) — not the CDN Leaflet build the static kit used.
 */
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Compound } from './portalData';
import { NEW_CAIRO_CENTER } from './portalData';

const CARTO_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const CARTO_ATTRIB = '&copy; OpenStreetMap &copy; CARTO';

function compoundIcon(c: Compound, hot: boolean) {
  return L.divIcon({
    className: '',
    html:
      `<span style="display:inline-flex;flex-direction:column;align-items:center;justify-content:center;` +
      `min-width:40px;padding:4px 9px;border-radius:20px;font-family:'JetBrains Mono',monospace;` +
      `font-size:11px;font-weight:800;line-height:1.15;color:#fff;white-space:nowrap;` +
      `background:${hot ? 'var(--navy,#002b4b)' : 'var(--pri,#00aeff)'};` +
      `box-shadow:0 3px 12px rgba(13,33,54,.35);border:2px solid #fff;cursor:pointer;">` +
      `${c.ai.toFixed(1)}<span style="font-size:8px;font-weight:600;opacity:.85;">${c.n.split(' ')[0]}</span></span>`,
    iconSize: undefined,
    iconAnchor: [20, 20],
  });
}

function dotIcon() {
  return L.divIcon({
    className: '',
    html:
      '<span style="display:inline-flex;width:18px;height:18px;border-radius:50%;' +
      'background:#00aeff;border:3px solid #fff;box-shadow:0 3px 10px rgba(13,33,54,.4);"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/** Recenters/pans an already-mounted map when `center` changes (e.g. user selects a compound). */
function FlyTo({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.panTo(center, { animate: true });
    if (zoom) map.setZoom(zoom);
  }, [center, zoom, map]);
  return null;
}

export function CompoundsMap({
  compounds,
  selected,
  onSelect,
  height = 540,
}: {
  compounds: Compound[];
  selected: Compound | null;
  onSelect: (c: Compound) => void;
  height?: number;
}) {
  const markers = useMemo(() => compounds, [compounds]);
  return (
    <div style={{ height, borderRadius: 'var(--r-card, 10px)', overflow: 'hidden' }}>
      <MapContainer
        center={NEW_CAIRO_CENTER}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url={CARTO_LIGHT} attribution={CARTO_ATTRIB} maxZoom={18} />
        {markers.map((c) => (
          <Marker
            key={c.n}
            position={c.c}
            icon={compoundIcon(c, c.ai >= 9.3)}
            eventHandlers={{ click: () => onSelect(c) }}
          />
        ))}
        {selected && <FlyTo center={selected.c} zoom={13} />}
      </MapContainer>
    </div>
  );
}

export function PropertyMiniMap({ center, height = 260 }: { center: [number, number]; height?: number }) {
  return (
    <div style={{ height, borderRadius: 'var(--r-card, 10px)', overflow: 'hidden' }}>
      <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={CARTO_LIGHT} attribution={CARTO_ATTRIB} maxZoom={18} />
        <Marker position={center} icon={dotIcon()} />
      </MapContainer>
    </div>
  );
}
