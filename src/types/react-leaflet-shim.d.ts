declare module "react-leaflet" {
  // On exporte des composants typés en "any" pour éviter les erreurs de props (center, etc.)
  export const MapContainer: any;
  export const TileLayer: any;
  export const Marker: any;
  export const Popup: any;
  export function useMap(): any;
}
