/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  lat: number | null;
  lng: number | null;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  host_id: string | null;
  image_url?: string | null;
};

export default function HostDashboard() {
  const supabase = getSupabaseBrowserClient();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [currency, setCurrency] = useState("EUR");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");

  // ui state
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      const hostId = user?.id ?? null;

      const { data, error } = await supabase
        .from("listings")
        .select("id,title,description,price,currency,lat,lng,is_active,is_approved,created_at,host_id,image_url")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // si on veut n'afficher que les annonces de l'hôte, décommente :
      // const mine = hostId ? (data ?? []).filter(x => x.host_id === hostId) : (data ?? []);
      const mine = data ?? [];
      setItems(mine as Listing[]);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Vous devez être connecté pour créer une annonce.");

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        price: price === "" ? null : Number(price),
        currency: currency || "EUR",
        lat: lat === "" ? null : Number(lat),
        lng: lng === "" ? null : Number(lng),
        host_id: user.id,
        is_active: false,
        is_approved: false,
      };

      // Relax typage Supabase pour éviter le "never" au build
      const { data, error } = await supabase
        .from("listings" as any)
        .insert([payload] as any) // tableau + any => pas d'erreur TS, compatible Supabase
        .select()
        .single();

      if (error) throw error;

      // reset form & refresh
      setTitle("");
      setDescription("");
      setPrice("");
      setLat("");
      setLng("");
      await load();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Espace Hôte — Mes annonces</h1>
        <p className="text-gray-600">Créez et gérez vos annonces. L’admin peut ensuite les approuver.</p>
      </header>

      {/* Formulaire création */}
      <form onSubmit={onCreate} className="card p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            placeholder="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <input
            className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            placeholder="Prix (ex: 85)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
          />
          <input
            className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            placeholder="Latitude (ex: 16.27)"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            inputMode="decimal"
          />
          <input
            className="px-3 py-2 rounded-lg border border-gray-200 w-full"
            placeholder="Longitude (ex: -61.53)"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            inputMode="decimal"
          />
          <textarea
            className="px-3 py-2 rounded-lg border border-gray-200 w-full sm:col-span-2"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            {saving ? "Création…" : "Créer l’annonce"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {/* Liste des annonces */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-gray-600">Chargement…</div>
        ) : !items.length ? (
          <div className="text-gray-600">Aucune annonce.</div>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-3 py-2">Titre</th>
                <th className="px-3 py-2">Prix</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="bg-white rounded-xl shadow-soft">
                  <td className="px-3 py-3">
                    <div className="font-semibold">{it.title}</div>
                    {it.description && (
                      <div className="text-sm text-gray-600">
                        {it.description.length > 140 ? it.description.slice(0, 140) + "…" : it.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {it.price != null ? `${it.price} ${it.currency ?? "EUR"}` : "—"}
                  </td>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
