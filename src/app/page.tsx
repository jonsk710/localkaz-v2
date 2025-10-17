import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

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

export const dynamic = "force-dynamic";

export default async function Home() {
  const supa = getSupabaseServerPublic();

  // RLS autorise: is_active=true AND is_approved=true (déjà posées)
  const { data, error } = await supa
    .from("listings")
    .select("id,title,description,price,currency,image_url,created_at,lat,lng")
    .eq("is_active", true)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(24);

  const items = (data ?? []) as Listing[];

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Annonces récentes</h1>
        <p className="text-gray-600">Découvrez les locations publiées sur LocalKaz.</p>
      </header>

      {!items.length ? (
        <div className="text-gray-600">
          Aucune annonce publique pour le moment.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="card overflow-hidden">
              <div className="aspect-[16/10] bg-gray-100">
                {it.image_url ? (
                  // image basique sans next/image pour aller vite
                  <img
                    src={it.image_url}
                    alt={it.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                    Pas d’image
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h2 className="font-semibold">{it.title}</h2>
                {it.description && (
                  <p className="text-sm text-gray-600">
                    {it.description.length > 120
                      ? it.description.slice(0, 120) + "…"
                      : it.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {it.price != null ? `${it.price} ${it.currency ?? "EUR"}` : "—"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(it.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
