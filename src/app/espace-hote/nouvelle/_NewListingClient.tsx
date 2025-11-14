"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewListingClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publish, setPublish] = useState(true); // publier direct

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // On récupère l'utilisateur pour mettre host_id/owner_id = auth.uid()
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      setLoading(false);
      return alert("Non connecté.");
    }

    const payload = {
      title,
      price: price === "" ? null : Number(price),
      description: description || null,
      image_url: imageUrl || null,
      is_active: publish,
      is_approved: publish, // si tu veux validation auto
      host_id: user.id,
      owner_id: user.id,
      // Valeurs par défaut minimales pour affichage carte/listes
      approx_lat: 16.237,
      approx_lng: -61.533,
      approx_radius_m: 3000
    };

    const { data, error } = await supabase
      .from("listings")
      .insert(payload)
      .select("id")
      .maybeSingle();

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    const id = data?.id as string;
    if (id) router.push(`/espace-hote/annonces/${id}/edit`);
    else router.push("/espace-hote/annonces");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <input className="w-full border rounded px-3 py-2" placeholder="Titre *"
        value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Prix par nuit (€) *" type="number" min={0}
        value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} required />
      <textarea className="w-full border rounded px-3 py-2" placeholder="Description"
        value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Image principale (URL)"
        value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        Publier immédiatement
      </label>

      <div className="flex gap-2">
        <button className="rounded bg-black text-white px-4 py-2" disabled={loading}>
          {loading ? "Création…" : "Créer l’annonce"}
        </button>
        <a href="/espace-hote/annonces" className="rounded border px-4 py-2">Annuler</a>
      </div>
    </form>
  );
}
