import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Corrige les URLs d'icônes dans Next.js
const iconRetina = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const icon       = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadow     = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

export function ensureLeafletIconsPatched() {
  // @ts-ignore - setOptions existe bien
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
  });
}
