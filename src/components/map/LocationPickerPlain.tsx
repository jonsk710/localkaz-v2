"use client";
import "@/styles/cursors.css";
"Se client";
import "@/styles/cursors.css";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";

type Value = { lat: number; lng: number; radius_m: number };
export default function LocationPickerPlain({
  value,
  onChange,
}: {
  value?: Value | null;
  onChange: (v: Value | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const dotRef = useRef<L.CircleMarker | null>(null);

  const [radius, setRadius] = useState<number>(value?.radius_m ?? 5000);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );

  // Init Leaflet (1 seule fois)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [16.265, -61.551],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;
    map.getContainer().classList.add('lk-cursor-plus');

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      crossOrigin: "",
    }).addTo(map);

    // curseur "+"
    const plusCursor = `url("data:image/svg+xml;utf8,
      <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>
        <circle cx='12' cy='12' r='11' fill='white' stroke='%231f2937' stroke-width='2'/>
        <line x1='12' y1='5' x2='12' y2='19' stroke='%231f2937' stroke-width='2'/>
        <line x1='5' y1='12' x2='19' y2='12' stroke='%231f2937' stroke-width='2'/>
      </svg>") 12 12, crosshair`;
    (map.getContainer() as HTMLDivElement).style.cursor = plusCursor;
    (map.getContainer() as HTMLDivElement).style.touchAction = "manipulation";

    // Clic => place cercle + point et notifie le parent
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      draw(lat, lng, radius);
      setCenter({ lat, lng });
      onChange({ lat, lng, radius_m: radius });
    });

    // Valeur initiale ?
    if (value?.lat && value?.lng) {
      draw(value.lat, value.lng, value.radius_m ?? radius);
      setCenter({ lat: value.lat, lng: value.lng });
      setRadius(value.radius_m ?? radius);
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 12));
    }

    // Cleanup
    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si parent change value après coup, on reflète
  useEffect(() => {
    if (!mapRef.current || !value) return;
    draw(value.lat, value.lng, value.radius_m ?? radius);
    setCenter({ lat: value.lat, lng: value.lng });
    setRadius(value.radius_m ?? radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng, value?.radius_m]);

  function draw(lat: number, lng: number, r: number) {
    const map = mapRef.current!;
    if (!circleRef.current) {
      circleRef.current = L.circle([lat, lng], {
        radius: r,
        color: "#2563eb",
        weight: 2,
        fillColor: "#2563eb",
        fillOpacity: 0.15,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([lat, lng]).setRadius(r);
    }
    if (!dotRef.current) {
      dotRef.current = L.circleMarker([lat, lng], {
        radius: 6,
        color: "#1f2937",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      }).addTo(map);
    } else {
      dotRef.current.setLatLng([lat, lng]);
    }
  }

  function onRadiusSlide(n: number) {
    setRadius(n);
    if (center && circleRef.current) {
      circleRef.current.setRadius(n);
      onChange({ lat: center.lat, lng: center.lng, radius_m: n });
    }
  }

  function clearZone() {
    setCenter(null);
    if (circleRef.current) { circleRef.current.remove(); circleRef.current = null; }
    if (dotRef.current) { dotRef.current.remove(); dotRef.current = null; }
    onChange(null);
  }

  async function useGeoloc() {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        draw(lat, lng, radius);
        setCenter({ lat, lng });
        onChange({ lat, lng, radius_m: radius });
        mapRef.current!.setView([lat, lng], Math.max(mapRef.current!.getZoom(), 12));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-700">Cliquez sur la carte pour définir la zone.</p>
        <button type="button" onClick={useGeoloc}
          className="px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs">
          Me localiser
        </button>
        <button type="button" onClick={clearZone}
          className="px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs">
          Effacer la zone
        </button>
      </div>

      <div ref={containerRef} style={{ height: 300, width: "100%" }}
           className="rounded-lg overflow-hidden border border-gray-200 lk-cursor-plus" />

      <div className="flex items-center gap-3">
        <input type="range" min={1000} max={15000} step={500}
               value={radius} onChange={(e) => onRadiusSlide(Number(e.target.value))}
               className="w-full" />
        <span className="text-sm text-gray-700 whitespace-nowrap">{Math.round(radius/1000)} km</span>
      </div>

      {center && (
        <div className="text-xs text-gray-500">
          Zone approximative centrée à ({center.lat.toFixed(4)}, {center.lng.toFixed(4)}) — rayon {Math.round(radius/1000)} km.
        </div>
      )}
    </div>
  );
}
