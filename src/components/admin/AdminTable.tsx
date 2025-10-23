"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Row = {
  id: string;
  title: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  deleted_at: string | null;
};

export default function AdminTable() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  const supa = useMemo(
    () => createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } }),
    [url, anon]
  );

  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [showTrashOnly, setShowTrashOnly] = useState(false);

  async function ensureAuth() {
    const { data: { user }, error } = await supa.auth.getUser();
    if (error) throw new Error(error.message);
    if (!user) throw new Error("unauthenticated");
    return user;
  }

  async function load() {
    setLoading(true); setErr(null);
    try {
      await ensureAuth();
      const r = await supa.rpc("admin_list_listings_v2");
      if (r.error) throw new Error(r.error.message);
      const rows: Row[] = (r.data as any[]) || [];
      setItems(rows);
    } catch (e:any) {
      setErr(e.message || String(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function postStatus(id: string, patch: { is_active?: boolean; is_approved?: boolean }) {
    setActing(id); setErr(null);
    try {
      await ensureAuth();
      const p_is_active   = typeof patch.is_active === "boolean"   ? patch.is_active   : null;
      const p_is_approved = typeof patch.is_approved === "boolean" ? patch.is_approved : null;
      const { error } = await supa.rpc("admin_set_listing_status", { p_id: id, p_is_active, p_is_approved });
      if (error) throw new Error(error.message);
      await load();
    } catch (e:any) {
      setErr(e.message || String(e));
    } finally {
      setActing(null);
    }
  }

  async function trash(id: string) {
    setActing(id); setErr(null);
    try {
      await ensureAuth();
      const { error } = await supa.rpc("admin_trash_listing", { p_id: id });
      if (error) throw new Error(error.message);
      await load();
    } catch (e:any) {
      setErr(e.message || String(e));
    } finally {
      setActing(null);
    }
  }

  async function restore(id: string) {
    setActing(id); setErr(null);
    try {
      await ensureAuth();
      const { error } = await supa.rpc("admin_restore_listing", { p_id: id });
      if (error) throw new Error(error.message);
      await load();
    } catch (e:any) {
      setErr(e.message || String(e));
    } finally {
      setActing(null);
    }
  }

  useEffect(() => { load(); }, []);

  const visible = items.filter(it => showTrashOnly ? it.deleted_at !== null : true);

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin — Annonces</h1>
          <p className="text-sm text-gray-600">Approuver / Activer / Corbeille.</p>
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={showTrashOnly} onChange={e => setShowTrashOnly(e.target.checked)} />
          Voir seulement la corbeille
        </label>
      </header>

      {err && <p className="text-red-700 text-sm">❌ {err}</p>}
      {loading ? <p>Chargement…</p> : (
        !visible.length ? <p>Aucune annonce.</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-3 py-2">Titre</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Créée</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(it => (
                  <tr key={it.id} className={`bg-white ${it.deleted_at ? "opacity-70" : ""}`}>
                    <td className="px-3 py-3">
                      <div className="font-medium">{it.title}</div>
                      {it.deleted_at && <div className="text-xs text-rose-700">🗑️ Dans la corbeille</div>}
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
                    <td className="px-3 py-3">{new Date(it.created_at).toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {!it.deleted_at ? (
                          <>
                            <button
                              disabled={acting === it.id}
                              onClick={() => postStatus(it.id, { is_approved: !it.is_approved })}
                              className="px-2 py-1 rounded-lg border text-xs font-medium"
                              style={{ backgroundColor: it.is_approved ? "#FEF3C7" : "#16A34A", color: it.is_approved ? "#92400E" : "#FFFFFF", borderColor: it.is_approved ? "#FCD34D" : "#15803D" }}
                            >
                              {it.is_approved ? "Retirer approbation" : "Approuver"}
                            </button>
                            <button
                              disabled={acting === it.id}
                              onClick={() => postStatus(it.id, { is_active: !it.is_active })}
                              className="px-2 py-1 rounded-lg border text-xs font-medium"
                              style={{ backgroundColor: it.is_active ? "#E11D48" : "#0284C7", color: "#FFFFFF", borderColor: it.is_active ? "#BE123C" : "#0369A1" }}
                            >
                              {it.is_active ? "Désactiver" : "Activer"}
                            </button>
                            <button
                              disabled={acting === it.id}
                              onClick={() => trash(it.id)}
                              className="px-2 py-1 rounded-lg border text-xs font-medium"
                              style={{ backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fecaca" }}
                              title="Mettre à la corbeille"
                            >
                              Mettre à la corbeille
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={acting === it.id}
                            onClick={() => restore(it.id)}
                            className="px-2 py-1 rounded-lg border text-xs font-medium"
                            style={{ backgroundColor: "#10b981", color: "#FFFFFF", borderColor: "#059669" }}
                            title="Restaurer"
                          >
                            Restaurer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </section>
  );
}
