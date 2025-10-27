"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Zone = { lat: number; lng: number; radius_m: number };

const DEFAULT_CENTER: [number, number] = [16.242, -61.548]; // Guadeloupe
const MIN_KM = 5;
const MAX_KM = 10;
const BASE_ZOOM = 12;

function kmClamp(km: number) {
  return Math.min(MAX_KM, Math.max(MIN_KM, km || 8));
}
function mClamp(m: number) {
  return Math.round(kmClamp((m || 8000) / 1000) * 1000);
}

function MetersCircle({
  center,
  radius,
  options,
}: {
  center: LatLngExpression;
  radius: number;
  options?: L.PathOptions;
}) {
  const map = useMap();
  useEffect(() => {
    const layer = L.circle(center, { radius, ...(options || {}) });
    layer.addTo(map);
    return () => { layer.remove(); };
  }, [map, (center as any)[0], (center as any)[1], radius, JSON.stringify(options || {})]);
  return null;
}

function ClickBinder({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const handler = (e: any) => onPick(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, onPick]);
  return null;
}

export default function RadiusFilter() {
  const router = useRouter();
  const sp = useSearchParams();

  // État local (on n’écrit pas l’URL tant que l’utilisateur n’appuie pas sur “Filtrer”)
  const [zone, setZone] = useState<Zone>(() => {
    const lat = parseFloat(sp.get("lat") || "") || DEFAULT_CENTER[0];
    const lng = parseFloat(sp.get("lng") || "") || DEFAULT_CENTER[1];
    const km = kmClamp(parseFloat(sp.get("radius_km") || "") || 8);
    return { lat, lng, radius_m: Math.round(km * 1000) };
  });

  // Réagit si l’URL change par ailleurs (ex: retour arrière)
  useEffect(() => {
    const lat = parseFloat(sp.get("lat") || "") || DEFAULT_CENTER[0];
    const lng = parseFloat(sp.get("lng") || "") || DEFAULT_CENTER[1];
    const km = kmClamp(parseFloat(sp.get("radius_km") || "") || 8);
    setZone({ lat, lng, radius_m: Math.round(km * 1000) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.get("lat"), sp.get("lng"), sp.get("radius_km")]);

  const radiusKm = useMemo(() => kmClamp(zone.radius_m / 1000), [zone.radius_m]);
  const zoom = Math.max(3, Math.min(18, BASE_ZOOM - 2)); // léger dézoom

  function writeURL(z: Zone) {
    const next = new URLSearchParams(sp.toString());
    next.set("lat", z.lat.toFixed(6));
    next.set("lng", z.lng.toFixed(6));
    next.set("radius_km", (z.radius_m / 1000).toString());
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  function applyFilters() {
    writeURL(zone);
  }

  function resetFilters() {
    const next = new URLSearchParams(sp.toString());
    next.delete("lat");
    next.delete("lng");
    next.delete("radius_km");
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-3 space-y-3">
      <div className="grid sm:grid-cols-3 gap-3 items-center">
        <label className="text-sm text-gray-700">Rayon</label>
        <input
          type="range"
          min={MIN_KM}
          max={MAX_KM}
          step={0.5}
          value={radiusKm}
          onChange={(e) => setZone(z => ({ ...z, radius_m: Math.round(kmClamp(Number(e.target.value)) * 1000) }))}
          className="sm:col-span-2 w-full"
          aria-label="Rayon (km)"
        />
        <div className="sm:col-start-2 text-sm text-gray-700">
          {radiusKm} km (min {MIN_KM}, max {MAX_KM})
        </div>
      </div>

      <div className="h-[320px] rounded-xl border border-gray-200 overflow-hidden map-cursor-plus">
        <MapContainer
          center={[zone.lat, zone.lng]}
          zoom={zoom}
          doubleClickZoom={false}
          scrollWheelZoom
          zoomControl
          className="w-full h-full"
        >
          <TileLayer
            url={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            attribution="&copy; OpenStreetMap"
          />

          <ClickBinder onPick={(lat, lng) => setZone({ ...zone, lat, lng })} />

          <MetersCircle
            center={[zone.lat, zone.lng]}
            radius={mClamp(zone.radius_m)}
            options={{ color: "#2563eb", weight: 1, fillColor: "#3b82f6", fillOpacity: 0.1 }}
          />
        </MapContainer>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={applyFilters}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          Filtrer
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
