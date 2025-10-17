'use client';

import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

import React from 'react';

// Imports dynamiques pour éviter SSR et fiabiliser les typings
const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
) as unknown as React.ComponentType<any>;

const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
) as unknown as React.ComponentType<any>;

const center: [number, number] = [16.23, -61.53];

export default function MapLeaflet({ children }: { children?: React.ReactNode }) {
  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: 520, width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {children}
    </MapContainer>
  );
}
