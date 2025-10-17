"use client";
import { useEffect, useState } from "react";
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
  host_id: string | null;
};

export default function AdminTable() {
  const supabase = getSupabaseBrowserClient();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setToken(data.session?.access_token ?? null);
    });
  }, [supabase]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const headers: HeadersInit = { "cache-control": "no-store" };
      if (token) headers["Authorization"] = "Bearer " + token;
      const res = await fetch("/api/admin/listings", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "HTTP " + res.status);
      }
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e: any) {
      setErr(e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  async function approve(id: string) {
    setApproving(id);
    try {
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = "Bearer " + token;
      const res = await fetch(`/api/admin/listings/${id}/approve`, { method: "POST", headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "HTTP " + res.status);
      }
      setItems(prev => prev.map(x => x.id === id ? { ...x, is_approved: true, is_active: true } : x));
    } catch (e: any) {
      setErr(e?.message || "Erreur approbation");
    } finally {
      setApproving(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={load}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >
          ↻ Recharger
        </button>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>

      {loading ? (
        <div>Chargement…</div>
      ) : !items.length ? (
        <div className="text-gray-600">Aucune annonce à afficher.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="px-3 py-2">Titre</th>
                <th className="px-3 py-2">Prix</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Créé le</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="bg-white rounded-xl shadow-soft">
                  <td className="align-top px-3 py-3">
                    <div className="font-semibold">{it.title}</div>
                    {it.description && (
                      <div className="text-sm text-gray-600">
                        {it.description.length > 140 ? it.description.slice(0, 140) + "…" : it.description}
                      </div>
                    )}
                  </td>
                  <td className="align-top px-3 py-3 whitespace-nowrap">
                    {it.price != null ? `${it.price} ${it.currency ?? "EUR"}` : "—"}
                  </td>
                  <td className="align-top px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs border
                        ${it.is_approved
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                        {it.is_approved ? "Approuvée" : "En attente"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs border
                        ${it.is_active
                          ? "bg-sky-50 border-sky-200 text-sky-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                        {it.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="align-top px-3 py-3 text-sm text-gray-700">
                    {new Date(it.created_at).toLocaleString()}
                  </td>
                  <td className="align-top px-3 py-3">
                    {!it.is_approved ? (
                      <button
                        onClick={() => approve(it.id)}
                        disabled={approving === it.id}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-60"
                      >
                        {approving === it.id ? "…" : "Approuver"}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
