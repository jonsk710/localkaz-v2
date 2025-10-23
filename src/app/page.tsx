import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export const revalidate = 0;

export default async function HomePage() {
  const supa = getSupabaseServerPublic();
  const { data, error } = await supa
    .from("listings")
    .select("id,title,description,price,currency,image_url,created_at,is_active,is_approved")
    .eq("is_active", true)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Annonces</h1>
        <p className="text-red-600">Erreur: {error.message}</p>
      </section>
    );
  }

  const items = data ?? [];

  return (
    <section className="space-y-4">
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
