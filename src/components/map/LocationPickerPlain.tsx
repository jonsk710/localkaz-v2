"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";

type Zone = { lat: number; lng: number; radius_m: number };

const DEFAULT_CENTER: [number, number] = [16.242, -61.548]; // Guadeloupe
const BASE_ZOOM = 12;

function clampRadius(m: number) {
  // Rayon borné 5–10 km pour le picker
  return Math.min(10000, Math.max(5000, m || 8000));
}

function MetersCircle({
  center,
  radius,
  options,
}: {
  center: LatLngExpression;
  radius: number;
  options?: L.PathOptions; // ✅ bon type pour L.circle
}) {
  const map = useMap();
  useEffect(() => {
    const layer = L.circle(center, { radius, ...(options || {}) });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
    // options peut changer ⇒ on sérialise pour éviter les warnings de dépendances
  }, [map, (center as any)[0], (center as any)[1], radius, JSON.stringify(options || {})]);
  return null;
}

function ClickBinder({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: any) => onPick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, onPick]);
  return null;
}

export default function LocationPickerPlain({
  value,
  onChange,
  zoomBias = 0, // ex: -2 pour dézoomer
}: {
  value: Zone | null;
  onChange: (z: Zone) => void;
  zoomBias?: number;
}) {
  const zone = useMemo<Zone>(() => {
    if (!value) return { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], radius_m: 8000 };
    return { lat: value.lat, lng: value.lng, radius_m: clampRadius(value.radius_m) };
  }, [value]);

  const zoom = Math.max(3, Math.min(18, BASE_ZOOM + zoomBias));

  return (
    <div className="relative w-full h-full map-cursor-plus">
      <MapContainer
        center={[zone.lat || DEFAULT_CENTER[0], zone.lng || DEFAULT_CENTER[1]]}
        zoom={zoom}
        doubleClickZoom={false}
        scrollWheelZoom={true}
        zoomControl={true}
        className="w-full h-full"
      >
        <TileLayer
          url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution="&copy; OpenStreetMap"
        />

        {/* Clic = change le centre de la zone (sans pan/fit) */}
        <ClickBinder onPick={(lat, lng) => onChange({ ...zone, lat, lng })} />

        {/* Cercle (en mètres) */}
        <MetersCircle
          center={[zone.lat, zone.lng]}
          radius={clampRadius(zone.radius_m)}
          options={{ color: "#2563eb", weight: 1, fillColor: "#3b82f6", fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  );
}
