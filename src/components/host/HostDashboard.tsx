"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/env";
import LocationPickerPlain from "@/components/map/LocationPickerPlain";
const UploadImage = dynamic(() => import("@/components/upload/UploadImage"), { ssr: false });

type SessionUser = { id: string; email?: string | null };

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export default function HostDashboard() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState("EUR");
  const [imageUrl, setImageUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [zone, setZone] = useState<{ lat: number; lng: number; radius_m: number } | null>(null);

  const [myListings, setMyListings] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser({ id: user.id, email: user.email });
      setLoading(false);
      await reloadMine(user.id);
    })();
  }, []);

  async function reloadMine(uid: string) {
    const { data, error } = await supabase
      .from("listings")
      .select("id,title,is_active,is_approved,created_at")
      .eq("host_id", uid)
      .order("created_at", { ascending: false });
    if (!error) setMyListings(data ?? []);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const payload: any = {
        title,
        description: description || null,
        price: price === "" ? null : Number(price),
        currency,
        image_url: imageUrl || null,
        host_id: user.id,
        is_active: false,
        is_approved: false,
        contact_email: contactEmail || null,
      };
      if (zone) {
        payload.approx_lat = zone.lat;
        payload.approx_lng = zone.lng;
        payload.approx_radius_m = zone.radius_m;
      }

      const { error } = await supabase.from("listings").insert(payload);
      if (error) throw error;

      // reset
      setTitle("");
      setDescription("");
      setPrice("");
      setCurrency("EUR");
      setImageUrl("");
      setContactEmail("");
      setZone(null);

      await reloadMine(user.id);
      setNotice("Annonce créée. Elle doit être approuvée par un admin.");
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteListing(id: string, title: string) {
    if (!user) return;
    const ok = typeof window !== "undefined"
      ? window.confirm(`Supprimer définitivement « ${title} » ?\nCette action est irréversible.`)
      : false;
    if (!ok) return;
    setDeletingId(id);
    setError(null);
    setNotice(null);
    try {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
      await reloadMine(user.id);
      setNotice("Annonce supprimée.");
    } catch (e: any) {
      setError(e?.message ?? "Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <section><h1 className="text-2xl font-bold">Espace Hôte</h1><p>Chargement…</p></section>;
  }
  if (!user) {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Espace Hôte — Connexion requise</h1>
        <a href="/espace-hote/login" className="underline">Se connecter (Hôte)</a>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Espace Hôte</h1>
        <p className="text-gray-600 text-sm">Publiez une annonce. L’admin l’approuvera avant mise en ligne.</p>
      </header>

      {notice && <p className="text-sm text-green-700">✅ {notice}</p>}
      {error && <p className="text-sm text-red-700">❌ {error}</p>}

      {/* Formulaire création */}
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="sm:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Titre</label>
          <input className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Beau T2 proche plage" required />
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
          <textarea className="px-3 py-2 rounded-lg border border-gray-200 w-full min-h-[120px]"
            value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Votre description…" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Prix (par nuit)</label>
          <input className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            value={price} onChange={(e)=>setPrice(e.target.value)} inputMode="numeric" placeholder="85" />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Devise</label>
          <select className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            value={currency} onChange={(e)=>setCurrency(e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Image (URL)</label>
          <input className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://…" />
          <UploadImage onUploaded={(url)=>setImageUrl(url)} label="Ou téléverser un fichier" />
          {imageUrl && (
            <img src={imageUrl} alt="Aperçu"
              className="w-full h-40 object-cover rounded-lg border border-gray-200" />
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Email de contact</label>
          <input className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)}
            type="email" placeholder={user.email ?? "hote@exemple.com"} />
          <p className="text-xs text-gray-500 mt-1">
            Si vide, l’email de votre compte sera utilisé automatiquement.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">Localisation approximative</label>
          <LocationPickerPlain value={zone} onChange={setZone} />
        </div>

        <div className="sm:col-span-2">
          <button disabled={submitting}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
            {submitting ? "Envoi…" : "Publier (en attente d’approbation)"}
          </button>
        </div>
      </form>

      {/* Mes annonces */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Mes annonces</h2>
        {!myListings.length ? (
          <p className="text-gray-600 text-sm">Aucune annonce.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-3 py-2">Titre</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Créée le</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myListings.map((it) => (
                  <tr key={it.id} className="bg-white">
                    <td className="px-3 py-3">{it.title}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs border
                          ${it.is_approved ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                          {it.is_approved ? "Approuvée" : "En attente"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs border
                          ${it.is_active ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                          {it.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700">
                      {new Date(it.created_at).toLocaleString()}
                      <div className="mt-1">
                        <a className="text-xs underline text-sky-700" href={`/espace-hote/annonces/${it.id}/photos`}>Gérer photos</a>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => deleteListing(it.id, it.title)}
                        disabled={deletingId === it.id}
                        className="px-2 py-1 rounded-lg border text-xs font-medium"
                        /* inline pour forcer la couleur, même si un reset met tout blanc */
                        style={{ backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" }}
                        aria-label={`Supprimer ${it.title}`}
                        title="Supprimer définitivement"
                      >
                        {deletingId === it.id ? "Suppression…" : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
