import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), { ssr: false });

export const revalidate = 0;

export default function CartePage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Carte</h1>
      <div className="h-[70vh] rounded-xl border border-gray-200 overflow-hidden">
        <MapView />
      </div>
    </section>
  );
}
