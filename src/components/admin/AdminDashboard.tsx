"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

type Listing = {
  id: string;
  title: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  created_at: string;
  is_active: boolean | null;
  is_approved: boolean | null;
  deleted_at: string | null;
  contact_email: string | null;
  host_id: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Filter = "all"|"pending"|"active"|"disabled"|"deleted";

export default function AdminDashboard() {
  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("pending");
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setErr(null);
    const sel = "id,title,price,currency,image_url,created_at,is_active,is_approved,deleted_at,contact_email,host_id";
    let query = supabase.from("listings").select(sel).order("created_at", { ascending: false });

    // Filtres serveur (les plus utiles)
    if (filter === "pending") {
      query = query.eq("is_approved", false).is("deleted_at", null);
    } else if (filter === "active") {
      query = query.eq("is_approved", true).eq("is_active", true).is("deleted_at", null);
    } else if (filter === "disabled") {
      query = query.eq("is_active", false).is("deleted_at", null);
    } else if (filter === "deleted") {
      query = query.not("deleted_at", "is", null);
    } else {
      // all: pas de critère
    }

    if (q.trim()) {
      query = query.ilike("title", `%${q.trim()}%`);
    }

    const { data, error } = await query;
    if (error) { setErr(error.message); setRows([]); setLoading(false); return; }
    setRows(data ?? []);
    setLoading(false);
  }, [q, filter]);

  useEffect(() => { refresh(); }, [refresh]);

  const counts = useMemo(() => {
    const all = rows.length;
    const pending = rows.filter(r => !r.is_approved && !r.deleted_at).length;
    const active = rows.filter(r => r.is_approved && r.is_active && !r.deleted_at).length;
    const disabled = rows.filter(r => r.is_active === false && !r.deleted_at).length;
    const deleted = rows.filter(r => r.deleted_at).length;
    return { all, pending, active, disabled, deleted };
  }, [rows]);

  async function approve(id: string) {
    const { error } = await supabase.from("listings").update({ is_approved: true }).eq("id", id);
    if (error) return alert(error.message);
    setRows(r => r.map(x => x.id === id ? { ...x, is_approved: true } : x));
  }

  async function toggleActive(id: string, to: boolean) {
    const { error } = await supabase.from("listings").update({ is_active: to }).eq("id", id);
    if (error) return alert(error.message);
    setRows(r => r.map(x => x.id === id ? { ...x, is_active: to } : x));
  }

  async function softDelete(id: string) {
    if (!confirm("Supprimer (soft) cette annonce ?")) return;
    const { error } = await supabase.from("listings").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) return alert(error.message);
    setRows(r => r.map(x => x.id === id ? { ...x, deleted_at: new Date().toISOString() } : x));
  }

  async function restore(id: string) {
    const { error } = await supabase.from("listings").update({ deleted_at: null }).eq("id", id);
    if (error) return alert(error.message);
    setRows(r => r.map(x => x.id === id ? { ...x, deleted_at: null } : x));
  }

  async function approveAllPending() {
    if (!confirm("Approuver toutes les annonces en attente affichées ?")) return;
    const { error } = await supabase.from("listings").update({ is_approved: true }).eq("is_approved", false).is("deleted_at", null);
    if (error) return alert(error.message);
    refresh();
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold">Admin — Annonces</h1>
        <div className="flex gap-2">
          <input className="border rounded px-3 py-1.5" placeholder="Rechercher un titre…" value={q} onChange={e=>setQ(e.target.value)} />
          <button onClick={refresh} className="rounded px-3 py-1.5 border">Recharger</button>
          {filter==="pending" && <button onClick={approveAllPending} className="rounded px-3 py-1.5 bg-emerald-600 text-white">Approuver tout</button>}
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterBtn label={`En attente (${counts.pending})`} active={filter==="pending"} onClick={()=>setFilter("pending")} />
        <FilterBtn label={`Actives (${counts.active})`} active={filter==="active"} onClick={()=>setFilter("active")} />
        <FilterBtn label={`Désactivées (${counts.disabled})`} active={filter==="disabled"} onClick={()=>setFilter("disabled")} />
        <FilterBtn label={`Supprimées (${counts.deleted})`} active={filter==="deleted"} onClick={()=>setFilter("deleted")} />
        <FilterBtn label={`Toutes (${counts.all})`} active={filter==="all"} onClick={()=>setFilter("all")} />
      </div>

      {err && <p className="text-red-600 text-sm">Erreur: {err}</p>}
      {loading ? <p>Chargement…</p> : rows.length === 0 ? <p className="text-gray-600">Aucune annonce.</p> : (
        <ul className="grid xl:grid-cols-2 gap-4">
          {rows.map(r => {
            const cover = r.image_url || "https://images.unsplash.com/photo-1505692794403-34d4982ca59b?auto=format&fit=crop&w=1600&q=80";
            return (
              <li key={r.id} className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-0">
                  <div className="col-span-1">
                    <img src={cover} alt={r.title ?? "cover"} className="w-full h-full object-cover aspect-[4/3]" />
                  </div>
                  <div className="col-span-2 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{r.title ?? "Sans titre"}</div>
                        <div className="text-xs text-gray-500">Créée le {new Date(r.created_at).toLocaleDateString()}</div>
                        <div className="text-sm">{r.price != null ? (<b>{r.price} {r.currency ?? "EUR"}</b>) : "Prix sur demande"}</div>
                        <div className="text-xs text-gray-600">Contact: {r.contact_email ?? "—"}</div>
                      </div>
                      <div className="flex gap-1">
                        <Badge ok={r.is_approved} label={r.is_approved ? "Approuvée" : "En attente"} />
                        <Badge ok={!!r.is_active} label={r.is_active ? "Active" : "Off"} />
                        {r.deleted_at && <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">Supprimée</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!r.is_approved && !r.deleted_at && (
                        <button onClick={()=>approve(r.id)} className="px-3 py-1 rounded bg-emerald-600 text-white">Approuver</button>
                      )}
                      {!r.deleted_at && (
                        r.is_active
                          ? <button onClick={()=>toggleActive(r.id, false)} className="px-3 py-1 rounded border">Désactiver</button>
                          : <button onClick={()=>toggleActive(r.id, true)} className="px-3 py-1 rounded border">Activer</button>
                      )}
                      {!r.deleted_at
                        ? <button onClick={()=>softDelete(r.id)} className="px-3 py-1 rounded border text-red-600">Supprimer</button>
                        : <button onClick={()=>restore(r.id)} className="px-3 py-1 rounded border">Restaurer</button>
                      }
                      <a className="px-3 py-1 rounded border" href={`/annonce/${r.id}`} target="_blank">Voir</a>
                      <a className="px-3 py-1 rounded border" href={`/espace-hote/annonces/${r.id}/edit`} target="_blank">Éditer</a>
                    </div>
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

function Badge({ ok, label }: { ok: boolean, label: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded ${ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{label}</span>;
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: ()=>void }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded border ${active ? "bg-black text-white" : "bg-white"}`}>{label}</button>;
}
