/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState, FormEvent } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
};

export default function HostDashboard() {
  const supabase = getSupabaseBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [lat, setLat] = useState<number | "">("");
  const [lng, setLng] = useState<number | "">("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, [supabase]);

  async function loadMyListings(uid: string) {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("id,title,description,price,currency,is_active,is_approved,created_at")
        .eq("host_id", uid)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement de vos annonces");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) loadMyListings(userId);
  }, [userId]); // eslint-disable-line

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setErr(null);
    try {
      const { data, error } = await supabase
        .from("listings")
        .insert({
          title,
          description,
          price: price === "" ? null : Number(price),
          lat: lat === "" ? null : Number(lat),
          lng: lng === "" ? null : Number(lng),
          host_id: userId,           // RLS: with check (auth.uid() = host_id)
          is_active: true,
          is_approved: false,
          currency: "EUR",
        })
        .select("id,title,description,price,currency,is_active,is_approved,created_at")
        .single();
      if (error) throw error;
      // reset
      setTitle(""); setDescription(""); setPrice(""); setLat(""); setLng("");
      // prepend
      setItems((prev) => [data as Listing, ...prev]);
    } catch (e: any) {
      setErr(e?.message || "Erreur création d'annonce");
    }
  }

  if (!userId) {
    return (
      <div className="space-y-3">
        <p className="text-gray-700">
          Espace Hôte — veuillez vous connecter pour gérer vos annonces.
        </p>
        <a href="/login" className="inline-flex px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
          Se connecter
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Création */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Créer une annonce</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="px-3 py-2 rounded-lg border border-gray-200"
            placeholder="Titre"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            required
          />
          <input
            className="px-3 py-2 rounded-lg border border-gray-200"
            placeholder="Prix (EUR)"
            type="number" step="0.01" min="0"
            value={price}
            onChange={(e)=>setPrice(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <input
            className="px-3 py-2 rounded-lg border border-gray-200"
            placeholder="Latitude"
            type="number" step="0.000001"
            value={lat}
            onChange={(e)=>setLat(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <input
            className="px-3 py-2 rounded-lg border border-gray-200"
            placeholder="Longitude"
            type="number" step="0.000001"
            value={lng}
            onChange={(e)=>setLng(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <textarea
            className="px-3 py-2 rounded-lg border border-gray-200 md:col-span-2"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e)=>setDescription(e.target.value)}
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
            >
              Créer
            </button>
            {err && <span className="ml-3 text-sm text-red-600">{err}</span>}
          </div>
        </form>
      </div>

      {/* Liste */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-3">Mes annonces</h2>
        {loading ? (
          <div>Chargement…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">Vous n'avez pas encore d'annonce.</div>
        ) : (
          <div className="overflow-x-auto">
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
                          {it.description.length > 140 ? it.description.slice(0,140)+"…" : it.description}
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
          </div>
        )}
      </div>
    </div>
  );
}
