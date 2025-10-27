"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/env";

type Listing = {
  id: string;
  title: string;
  approx_lat: number | null;
  approx_lng: number | null;
  approx_radius_m?: number | null;
};

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

const DEFAULT_CENTER: [number, number] = [16.242, -61.548]; // Guadeloupe
const DEFAULT_ZOOM = 10;

function clampRadius(m?: number | null) {
  // Bornage 5–10 km, fallback 8 km si absent
  const val = typeof m === "number" && isFinite(m) && m > 0 ? m : 8000;
  return Math.min(10000, Math.max(5000, val));
}

function ListingsLayer({ items }: { items: Listing[] }) {
  const map = useMap();

  useEffect(() => {
    let group: any;

    (async () => {
      const L = (await import("leaflet")).default;

      group = L.layerGroup();
      group.addTo(map);

      items.forEach((it) => {
        if (typeof it.approx_lat !== "number" || typeof it.approx_lng !== "number") return;

        // Point bleu (pixel radius)
        const marker = L.circleMarker([it.approx_lat, it.approx_lng], {
          radius: 5,
          color: "#2563eb",
          weight: 1,
          opacity: 1,
          fillColor: "#3b82f6",
          fillOpacity: 0.9,
        })
          .addTo(group)
          .bindTooltip(it.title || "Annonce", { direction: "top", offset: [0, -6] })
          .on("click", () => {
            if (typeof window !== "undefined") window.location.href = `/annonce/${it.id}`;
          });

        // Cercle d'approximation (en mètres, borné 5–10 km, fallback 8 km)
        const r = clampRadius(it.approx_radius_m);
        const area = L.circle([it.approx_lat, it.approx_lng], {
          radius: r,
          color: "#2563eb",
          weight: 1,
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
        })
          .addTo(group)
          .bindTooltip(it.title || "Annonce")
          .on("click", () => {
            if (typeof window !== "undefined") window.location.href = `/annonce/${it.id}`;
          });

        // (pas besoin de stocker marker/area : group.clearLayers() à la cleanup)
      });
    })();

    return () => {
      try {
        if (group) {
          group.clearLayers();
          group.remove();
        }
      } catch {}
    };
  }, [map, JSON.stringify(items)]);

  return null;
}

export default function MapView() {
  const [items, setItems] = useState<Listing[]>([]);
  const points = useMemo(
    () => items.filter((x) => typeof x.approx_lat === "number" && typeof x.approx_lng === "number"),
    [items]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,approx_lat,approx_lng,approx_radius_m,is_active,is_approved")
        .eq("is_active", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(500);

    if (!cancelled && !error) setItems((data || []) as Listing[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full h-full">
      <MapContainer
        center={
          points.length
            ? ([points[0].approx_lat!, points[0].approx_lng!] as [number, number])
            : DEFAULT_CENTER
        }
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution="&copy; OpenStreetMap"
        />
        <ListingsLayer items={points} />
      </MapContainer>
    </div>
  );
}
