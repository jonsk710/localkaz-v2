"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function joinCSV(arr?: string[]) { return (arr ?? []).join(", "); }
function splitCSV(s: string) { return s.split(",").map(x => x.trim()).filter(Boolean); }

export default function EditListingClient() {
  const p = useParams() as { id?: string | string[] };
  const id = Array.isArray(p.id) ? p.id[0] : (p.id ?? "");
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [commune, setCommune] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [photos, setPhotos] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("annonces")
        .select("title,price,commune,description,tags,photos,is_published")
        .eq("id", id)
        .single();
      setLoading(false);
      if (error) { alert(error.message); return; }
      setTitle(data.title ?? "");
      setPrice(data.price ?? "");
      setCommune(data.commune ?? "");
      setDescription(data.description ?? "");
      setTags(joinCSV(data.tags));
      setPhotos(joinCSV(data.photos));
      setIsPublished(!!data.is_published);
    })();
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title,
      price: Number(price),
      commune: commune || null,
      description: description || null,
      tags: splitCSV(tags),
      photos: splitCSV(photos),
      is_published: isPublished,
    };
    const { error } = await supabase.from("annonces").update(payload).eq("id", id);
    setLoading(false);
    if (error) alert(error.message);
    else router.push("/espace-hote/annonces");
  }

  if (loading) return <p>Chargement…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <input className="w-full border rounded px-3 py-2" placeholder="Titre *"
        value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Prix par nuit (€) *" type="number" min={0}
        value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Commune"
        value={commune} onChange={(e) => setCommune(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2" placeholder="Description"
        value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Tags (séparés par des virgules)"
        value={tags} onChange={(e) => setTags(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Photos (URLs séparées par des virgules)"
        value={photos} onChange={(e) => setPhotos(e.target.value)} />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        Publier l’annonce
      </label>
      <div className="flex gap-2">
        <button className="rounded bg-black text-white px-4 py-2" disabled={loading}>
          {loading ? "Sauvegarde…" : "Sauvegarder"}
        </button>
        <button type="button" className="rounded border px-4 py-2" onClick={() => router.back()}>
          Annuler
        </button>
      </div>
    </form>
  );
}
