'use client';

import React from 'react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type LiveMapProps = {
  mode?: 'dark' | 'light';
};

const HOTSPOTS: [number, number][] = [
  [30.0102, 31.4821],
  [30.0208, 31.4863],
  [30.0019, 31.5124],
  [30.0287, 31.5301],
];

export default function LiveMap({ mode = 'light' }: LiveMapProps) {
  const isDark = mode === 'dark';
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={[30.0144, 31.4913]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url={tileUrl}
        attribution="&copy; OpenStreetMap &copy; CARTO"
        maxZoom={18}
      />
      {HOTSPOTS.map((point, index) => (
        <CircleMarker
          key={`${point[0]}-${point[1]}`}
          center={point}
          radius={8 + index}
          pathOptions={{
            color: '#ffffff',
            weight: 2,
            fillColor: isDark ? '#00aeff' : '#0055aa',
            fillOpacity: 0.75,
          }}
        />
      ))}
    </MapContainer>
  );
}
