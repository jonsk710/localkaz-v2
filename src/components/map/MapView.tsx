"use client";

import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  created_at: string;
  approx_lat: number | null;
  approx_lng: number | null;
  approx_radius_m: number | null;
};

export default function MapView({ items }: { items: Listing[] }) {
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Listing | null>(null);
  useEffect(() => { setReady(true); }, []);

  const points = useMemo(
    () => items.filter(x => typeof x.approx_lat === "number" && typeof x.approx_lng === "number"),
    [items]
  );

  // Guadeloupe
  const initialCenter: LatLngExpression = [16.265, -61.551];
  const initialZoom = 10; // pas trop zoomé

  return (
    <div className="map-wrap">
      <MapContainer center={initialCenter} zoom={initialZoom} scrollWheelZoom={true} className="map-h-70">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ready && points.map((it) => {
          const center: LatLngExpression = [it.approx_lat as number, it.approx_lng as number];
          const radius = it.approx_radius_m ?? 5000;
          return (
            <div key={it.id}>
              {/* Zone approximative (disque) */}
              <Circle
                center={center}
                radius={radius}
                pathOptions={{ color: "#2563eb", weight: 2, fillOpacity: 0.12 }}
                eventHandlers={{ click: () => setSelected(it) }}
              />
              {/* Petit point au centre */}
              <CircleMarker
                center={center}
                radius={6}
                pathOptions={{ color: "#1f2937", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
                eventHandlers={{ click: () => setSelected(it) }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={1} permanent={false}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{it.title}</div>
                  <div style={{ fontSize: 11, color: "#374151" }}>
                    {it.price != null ? `${it.price} ${it.currency ?? "EUR"}` : "Prix sur demande"}
                  </div>
                </Tooltip>
              </CircleMarker>
            </div>
          );
        })}

        {/* Popup contrôlé */}
        {selected && typeof selected.approx_lat === "number" && typeof selected.approx_lng === "number" && (
          <Popup
            position={[selected.approx_lat as number, selected.approx_lng as number]}
            eventHandlers={{ remove: () => setSelected(null) }}
          >
            <div style={{ maxWidth: 240 }}>
              <div style={{ fontWeight: 700 }}>{selected.title}</div>
              {selected.image_url ? (
                <img
                  src={selected.image_url}
                  alt={selected.title ?? "logement"}
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 6 }}
                />
              ) : null}
              <div style={{ marginTop: 6, fontSize: 12, color: "#444" }}>
                {selected.description
                  ? (selected.description.length > 120 ? selected.description.slice(0, 120) + "…" : selected.description)
                  : "—"}
              </div>
              <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>{selected.price != null ? `${selected.price} ${selected.currency ?? "EUR"}` : "—"}</b>
                <a href={"/?id=" + selected.id} style={{ fontSize: 12, textDecoration: "underline" }}>
                  Voir
                </a>
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: "#666" }}>
                Zone approximative (~{Math.round((selected.approx_radius_m ?? 5000)/1000)} km)
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
