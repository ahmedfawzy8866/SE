'use client';

import React from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/** A single compound plotted on the intelligence map. */
export interface MapPoint {
  /** Compound name. */
  name: string;
  /** [lat, lng]. */
  coord: [number, number];
  /** Expected annual yield / growth, in percent (e.g. 22 for "+22%"). */
  yieldPct: number;
  /** Average asking price, in EGP millions. */
  priceM: number;
  /** AI opportunity score (0–10). */
  ai: number;
  /** Live demand signal — number of currently-published listings in the compound. */
  demand?: number;
}

type LiveMapProps = {
  mode?: 'dark' | 'light';
  /** Real compound data to plot. When omitted the map renders empty tiles only. */
  points?: MapPoint[];
  /** Localise the tooltip labels. */
  labels?: { yield: string; price: string; ai: string; demand: string };
};

const NEW_CAIRO_CENTER: [number, number] = [30.03, 31.55];

/** Yield tiers → marker colour (hot / strong / stable). */
function yieldColor(yieldPct: number): string {
  if (yieldPct >= 20) return '#F5B301'; // gold — top demand/yield
  if (yieldPct >= 15) return '#34D399'; // green — strong
  return '#1E88D9'; // blue — stable
}

/** Marker radius scales with live demand when known, else with the AI score. */
function markerRadius(p: MapPoint): number {
  if (typeof p.demand === 'number' && p.demand > 0) {
    return 7 + Math.min(p.demand, 8) * 2.2;
  }
  return 6 + Math.max(0, p.ai - 8) * 5;
}

export default function LiveMap({ mode = 'light', points = [], labels }: LiveMapProps) {
  const isDark = mode === 'dark';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const l = labels ?? { yield: 'Yield', price: 'Avg', ai: 'AI', demand: 'live' };

  return (
    <MapContainer
      center={NEW_CAIRO_CENTER}
      zoom={11}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url={tileUrl} attribution="&copy; OpenStreetMap &copy; CARTO" maxZoom={18} />
      {points.map((p) => {
        const color = yieldColor(p.yieldPct);
        return (
          <CircleMarker
            key={p.name}
            center={p.coord}
            radius={markerRadius(p)}
            pathOptions={{
              color: '#ffffff',
              weight: 1.5,
              fillColor: color,
              fillOpacity: 0.8,
            }}
          >
            <Tooltip direction="top" opacity={1} className="se-map-tip">
              <strong>{p.name}</strong>
              <br />
              {l.yield} +{p.yieldPct}% · {l.price} EGP {p.priceM}M · {l.ai} {p.ai.toFixed(1)}
              {typeof p.demand === 'number' && p.demand > 0 ? (
                <>
                  {' '}
                  · {p.demand} {l.demand}
                </>
              ) : null}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
