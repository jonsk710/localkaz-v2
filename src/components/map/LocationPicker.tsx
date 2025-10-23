"use client";

import { useEffect, useRef, useState } from "react";
// CSS Leaflet ici pour garantir le style indépendamment du layout
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import type { Map as LeafletMap } from "leaflet";
import * as L from "leaflet";

type Props = {
  value?: { lat: number; lng: number; radius_m: number } | null;
  onChange: (v: { lat: number; lng: number; radius_m: number } | null) => void;
};

const MapContainer: any = dynamic(() => import("react-leaflet").then(m => m.MapContainer as any), { ssr: false });
const TileLayer: any     = dynamic(() => import("react-leaflet").then(m => m.TileLayer as any),     { ssr: false });

export default function LocationPicker({ value, onChange }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);
  const zoneRef = useRef<L.Circle | null>(null);           // grand cercle (rayon)
  const dotRef  = useRef<L.CircleMarker | null>(null);     // petit point au centre (pas d'icône)

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );
  const [radius, setRadius] = useState<number>(value?.radius_m ?? 5000);

  // --- helpers
  function ensureLayers(map: LeafletMap) {
    if (!zoneRef.current) {
      zoneRef.current = L.circle([16.265, -61.551], {
        radius,
        color: "#2563eb",
        weight: 2,
        fillColor: "#2563eb",
        fillOpacity: 0.15,
      }).addTo(map);
    }
    if (!dotRef.current) {
      // petit disque (6px) au centre pour bien voir la cible
      dotRef.current = L.circleMarker([16.265, -61.551], {
        radius: 6,
        color: "#1f2937",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      }).addTo(map);
    }
  }

  function placeAt(lat: number, lng: number) {
    const map = mapRef.current!;
    ensureLayers(map);
    zoneRef.current!.setLatLng([lat, lng]).setRadius(radius);
    dotRef.current!.setLatLng([lat, lng]);
    setCenter({ lat, lng });
    onChange({ lat, lng, radius_m: radius });
  }

  function updateRadius(r: number) {
    setRadius(r);
    if (center && zoneRef.current) {
      zoneRef.current.setRadius(r);
      onChange({ lat: center.lat, lng: center.lng, radius_m: r });
    }
  }

  function onMapCreated(map: LeafletMap) {
    mapRef.current = map;

    // Curseur “+” : SVG inline pour être 100% autonome
    const plusCursor = `url("data:image/svg+xml;utf8,
      <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
        <circle cx='12' cy='12' r='11' fill='white' stroke='%231f2937' stroke-width='2'/>
        <line x1='12' y1='5' x2='12' y2='19' stroke='%231f2937' stroke-width='2'/>
        <line x1='5' y1='12' x2='19' y2='12' stroke='%231f2937' stroke-width='2'/>
      </svg>") 12 12, crosshair`;
    const el = map.getContainer();
    el.style.cursor = plusCursor;
    el.style.touchAction = "manipulation";

    ensureLayers(map);

    // Clic carte → place le centre et met à jour le rayon
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng || {};
      if (typeof lat === "number" && typeof lng === "number") {
        placeAt(lat, lng);
      }
    });

    // Si valeur initiale (édition), afficher direct
    if (value?.lat && value?.lng) {
      placeAt(value.lat, value.lng);
      updateRadius(value.radius_m ?? 5000);
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 12));
    }
  }

  function useGeoloc() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeAt(lat, lng);
        mapRef.current!.setView([lat, lng], Math.max(mapRef.current!.getZoom(), 12));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  const start = center ?? { lat: 16.265, lng: -61.551 };

  // Sync externe -> interne (si value change depuis parent)
  useEffect(() => {
    if (!value || !mapRef.current) return;
    placeAt(value.lat, value.lng);
    updateRadius(value.radius_m ?? 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, value?.radius_m]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-700">
          Cliquez sur la carte pour définir la zone (centre), puis ajustez le rayon.
        </p>
        <button
          type="button"
          onClick={useGeoloc}
          className="px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs"
        >
          Me localiser
        </button>
      </div>

      <div className="h-72 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={[start.lat, start.lng]}
          zoom={11}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          whenCreated={onMapCreated}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Le cercle et le point sont ajoutés IMPÉRATIVEMENT via Leaflet */}
        </MapContainer>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1000}
          max={15000}
          step={500}
          value={radius}
          onChange={(e) => updateRadius(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-700 whitespace-nowrap">{Math.round(radius / 1000)} km</span>
      </div>

      <div className="text-xs text-gray-500">
        La carte publique affichera une <b>zone approximative</b> (rayon ~{Math.round(radius / 1000)} km), pas l’adresse exacte.
      </div>
    </div>
  );
}
