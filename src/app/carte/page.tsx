import { getSupabaseServerPublic } from "@/lib/supabase/server-public";
import loadable from "next/dynamic";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  created_at: string;
  lat: number | null;
  lng: number | null;
};

const MapView = loadable(() => import("@/components/map/MapView"), { ssr: false });

export const dynamicParams = true;
export const revalidate = 0;

export default async function CartePage() {
  const supa = getSupabaseServerPublic();
  const { data } = await supa
    .from("listings")
    .select("id,title,description,price,currency,image_url,created_at,lat,lng")
    .eq("is_active", true)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(500);

  const items = (data ?? []) as Listing[];

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Carte des annonces</h1>
        <p className="text-gray-600">Pins = annonces actives et approuvées.</p>
      </div>
      <MapView items={items} />
    </section>
  );
}
