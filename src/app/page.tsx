import nextDynamic from "next/dynamic";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

const SearchFilters = nextDynamic(() => import("@/components/search/SearchFilters"), { ssr: false });
const SortBar = nextDynamic(() => import("@/components/search/SortBar"), { ssr: false });
const QueryBar = nextDynamic(() => import("@/components/search/QueryBar"), { ssr: false });

export const revalidate = 0;

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function asString(v: string | string[] | undefined, d = ""): string {
  return typeof v === "string" ? v : d;
}
function asNumber(v: string | string[] | undefined): number | null {
  if (typeof v !== "string") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function escIlike(s: string) {
  // échappe % et _ pour éviter de casser le pattern
  return s.replace(/[%_]/g, (m) => "\\" + m);
}

export default async function HomePage({ searchParams }: PageProps) {
  const sort = asString(searchParams?.sort, "recent");
  const q = asString(searchParams?.q, "").trim();
  const priceMin = asNumber(searchParams?.price_min);
  const priceMax = asNumber(searchParams?.price_max);
  const currency = asString(searchParams?.currency, "");

  
  const lat = typeof searchParams?.lat === "string" ? parseFloat(searchParams!.lat as string) : NaN;
  const lng = typeof searchParams?.lng === "string" ? parseFloat(searchParams!.lng as string) : NaN;
  const radiusKm = typeof searchParams?.radius_km === "string" ? parseFloat(searchParams!.radius_km as string) : NaN;
const supa = getSupabaseServerPublic();
  let qy = supa
    .from("listings")
    .select("id,title,description,price,currency,image_url,created_at,is_active,is_approved")
    .eq("is_active", true)
    .eq("is_approved", true);

  // Filtres
  if (q) {
    const pat = `%${escIlike(q)}%`;
    // title ILIKE ... OR description ILIKE ...
    qy = qy.or(`title.ilike.${pat},description.ilike.${pat}`);
  }
  if (priceMin != null) qy = qy.gte("price", priceMin);
  if (priceMax != null) qy = qy.lte("price", priceMax);
  if (currency && currency !== "ALL") qy = qy.eq("currency", currency);

  // Filtre périmètre (cadre rapide)
  if (Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(radiusKm) && radiusKm > 0) {
    const km = Math.min(10, Math.max(5, radiusKm));
    const degLat = km / 110.574;
    const cosLat = Math.cos((lat * Math.PI) / 180) || 0.0001;
    const degLng = km / (111.32 * cosLat);
    const minLat = lat - degLat;
    const maxLat = lat + degLat;
    const minLng = lng - degLng;
    const maxLng = lng + degLng;
    qy = qy
      .gte("approx_lat", minLat)
      .lte("approx_lat", maxLat)
      .gte("approx_lng", minLng)
      .lte("approx_lng", maxLng);
  }

  // Tri
  switch (sort) {
    case "price_asc":
      qy = qy.order("price", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false });
      break;
    case "price_desc":
      qy = qy.order("price", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
      break;
    case "title_az":
      qy = qy.order("title", { ascending: true }).order("created_at", { ascending: false });
      break;
    case "recent":
    default:
      qy = qy.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await qy.limit(50);

  if (error) {
    return (
      <section className="space-y-4">
        <SortBar />
        <QueryBar />
        <SearchFilters />
        <h1 className="text-2xl font-bold">Annonces</h1>
        <p className="text-red-600">Erreur: {error.message}</p>
      </section>
    );
  }

  const items = data ?? [];

  return (
    <section className="space-y-4">
      {/* Tri + Recherche au-dessus de la carte */}
      <SortBar />
      <QueryBar />

      {/* Carte + rayon + filtres (inchangé) */}
      <SearchFilters />

      <h1 className="text-2xl font-bold">Annonces</h1>
      {!items.length ? (
        <p className="text-gray-600">Aucune annonce pour le moment.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`/annonce/${it.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow"
                aria-label={`Voir l'annonce ${it.title}`}
              >
                {it.image_url && (
                  <img
                    src={it.image_url}
                    alt={it.title}
                    loading="lazy"
                    className="w-full h-36 object-cover rounded-lg mb-2"
                  />
                )}
                <div className="font-semibold">{it.title}</div>
                <div className="text-sm text-gray-600">
                  {it.description ? (it.description.length > 120 ? it.description.slice(0, 120) + "…" : it.description) : "—"}
                </div>
                <div className="mt-2 text-sm">
                  {it.price != null ? <b>{it.price} {it.currency ?? "EUR"}</b> : "Prix sur demande"}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
