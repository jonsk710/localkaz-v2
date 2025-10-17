"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Annonce = {
  id: string;
  title: string;
  price: number;
  is_published?: boolean;
  photos?: string[];
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HostListings() {
  const [rows, setRows] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    // Avec RLS "owner_read", on pourrait omettre eq('owner_id', user.id).
    // On le garde par clarté.
    const { data, error } = await supabase
      .from("annonces")
      .select("id,title,price,is_published,photos")
      .eq("owner_id", user?.id ?? "")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) setRows(data as any);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function onDelete(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    const { error } = await supabase.from("annonces").delete().eq("id", id);
    if (error) return alert(error.message);
    setRows((r) => r.filter((x) => x.id !== id));
  }

  async function onTogglePublish(a: Annonce) {
    const { error } = await supabase
      .from("annonces")
      .update({ is_published: !a.is_published })
      .eq("id", a.id);
    if (error) return alert(error.message);
    setRows((r) => r.map((x) => (x.id === a.id ? { ...x, is_published: !a.is_published } : x)));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes annonces</h1>
        <Link href="/espace-hote/nouvelle" className="rounded bg-black text-white px-4 py-2">
          Créer une annonce
        </Link>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : rows.length === 0 ? (
        <p>Pas encore d’annonce.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {rows.map((a) => {
            const cover =
              a.photos?.[0] ||
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";
            return (
              <li key={a.id} className="border rounded overflow-hidden">
                <div className="relative aspect-[4/3]">
                  {/* tu peux remplacer par <Image /> si tu veux */}
                  <img src={cover} alt={a.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-gray-500">{a.price} € / nuit</div>
                    </div>
                    <span className={`text-xs rounded px-2 py-0.5 ${a.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {a.is_published ? "Publié" : "Brouillon"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/espace-hote/annonces/${a.id}/edit`}
                      className="rounded border px-3 py-1"
                    >
                      Éditer
                    </Link>
                    <button
                      onClick={() => onTogglePublish(a)}
                      className="rounded border px-3 py-1"
                    >
                      {a.is_published ? "Dépublier" : "Publier"}
                    </button>
                    <button
                      onClick={() => onDelete(a.id)}
                      className="rounded border px-3 py-1 text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
