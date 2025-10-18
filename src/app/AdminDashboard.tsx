"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/env";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  host_id: string | null;
};

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export default function AdminDashboard() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      // On passe par l'API admin (bypass RLS via service role côté serveur)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? null;

      const headers: HeadersInit = { "cache-control": "no-store" };
      if (token) headers["Authorization"] = "Bearer " + token;

      const res = await fetch("/api/admin/listings", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const payload = await res.json();
      setItems(payload.items ?? []);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refreshAll();
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-600">Vue de contrôle rapide (lecture seule ici).</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={refreshAll}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          ↻ Recharger
        </button>
        {loading && <span className="text-sm text-gray-600">Chargement…</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      {!loading && !items.length ? (
        <div className="text-gray-600">Aucune annonce disponible.</div>
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
        </div>
      )}
    </section>
  );
}
