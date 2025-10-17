"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { ensureLeafletIconsPatched } from "./fixLeafletIcons";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

function FitBounds({ items }: { items: Listing[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = items
      .filter((x) => typeof x.lat === "number" && typeof x.lng === "number")
      .map((x) => [x.lat as number, x.lng as number]) as [number, number][];
    if (pts.length === 0) return;
    if (pts.length === 1) {
      map.setView(pts[0], 12);
    } else {
      // @ts-ignore
      map.fitBounds(pts, { padding: [40, 40] });
    }
  }, [items, map]);
  return null;
}

export default function MapView({ items }: { items: Listing[] }) {
  ensureLeafletIconsPatched();

  // Centre par défaut sur Guadeloupe
  const center: [number, number] = [16.265, -61.551];
  const points = useMemo(
    () => items.filter((x) => typeof x.lat === "number" && typeof x.lng === "number"),
    [items]
  );

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={10} scrollWheelZoom className="map-h-70">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds items={points} />
        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {points.map((it) => (
            <Marker key={it.id} position={[it.lat as number, it.lng as number]}>
              <Popup>
                <div style={{ maxWidth: 240 }}>
                  <div style={{ fontWeight: 700 }}>{it.title}</div>
                  {it.image_url ? (
                    <img
                      src={it.image_url}
                      alt={it.title}
                      style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginTop: 6 }}
                    />
                  ) : null}
                  <div style={{ marginTop: 6, fontSize: 12, color: "#444" }}>
                    {it.description
                      ? (it.description.length > 120 ? it.description.slice(0, 120) + "…" : it.description)
                      : "—"}
                  </div>
                  <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>{it.price != null ? `${it.price} ${it.currency ?? "EUR"}` : "—"}</b>
                    <a href={"/?id=" + it.id} style={{ fontSize: 12, textDecoration: "underline" }}>
                      Voir
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
