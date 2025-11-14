"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Item = {
  id: string;
  kind: "reservation" | "block";
  status: "pending" | "confirmed" | "cancelled";
  check_in: string;
  check_out: string;
  note?: string | null;
  created_by?: string | null;
  updated_at?: string | null;
};

function ymd(d: Date) { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; }
function firstOfMonth(d=new Date()) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function lastOfMonth(d=new Date()) { return new Date(d.getFullYear(), d.getMonth()+1, 0); }

export default function HostCalendarActions({ listingId }: { listingId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);

  const [from, setFrom] = useState(ymd(firstOfMonth()));
  const [to, setTo] = useState(ymd(lastOfMonth()));
  const [note, setNote] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY!;
    return createClient(url, key);
  }, []);
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY)!;

  // Récupère token + userId
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (!alive) return; setToken(data.session?.access_token || null); });
    supabase.auth.getUser().then(({ data }) => { if (!alive) return; setUserId(data.user?.id ?? null); });
    return () => { alive = false; };
  }, [supabase]);

  // Récupère host_id de l’annonce (pour info)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${URL}/rest/v1/listings?select=host_id&id=eq.${encodeURIComponent(listingId)}`, {
          headers: { apikey: KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        const j = await res.json();
        if (Array.isArray(j) && j.length > 0) setHostId(j[0]?.host_id ?? null);
      } catch {}
    })();
  }, [URL, KEY, token, listingId]);

  async function rpc(fn: string, payload: any) {
    setErr(null); setOk(null);
    const headers: Record<string,string> = {
      apikey: KEY,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method:"POST", headers, body: JSON.stringify(payload) });
    const txt = await res.text(); let j:any=null; try { j = txt ? JSON.parse(txt) : null; } catch {}
    if (!res.ok) throw new Error((j && (j.error||j.message||j.hint||j.details)) || txt || "request failed");
    return j;
  }

  // ====== utilise les HELPERS *_as côté UI pour éviter 'forbidden' ======
  async function refresh() {
    if (!userId) { setItems([]); return; }
    setBusy(true);
    try {
      const j = await rpc("list_bookings_window_as", {
        p_actor: userId, p_listing: listingId, p_from: from, p_to: to
      });
      setItems(Array.isArray(j) ? j : []);
    } catch(e:any){ setErr(e.message); }
    finally { setBusy(false); }
  }

  async function block() {
    if (!userId) { setErr("Connecte-toi pour bloquer."); return; }
    setBusy(true);
    try {
      await rpc("host_block_dates_as", {
        p_actor: userId, p_listing: listingId, p_from: from, p_to: to, p_note: note || null
      });
      setOk("Blocage créé."); await refresh();
    } catch(e:any){ setErr(e.message); }
    finally { setBusy(false); }
  }

  async function unblock() {
    if (!userId) { setErr("Connecte-toi pour débloquer."); return; }
    setBusy(true);
    try {
      await rpc("host_unblock_range_as", {
        p_actor: userId, p_listing: listingId, p_from: from, p_to: to
      });
      setOk("Blocages supprimés."); await refresh();
    } catch(e:any){ setErr(e.message); }
    finally { setBusy(false); }
  }

  // Auto-refresh au chargement + quand tu changes la fenêtre
  useEffect(() => { refresh(); }, [userId, listingId, from, to]); // eslint-disable-line

  const disabled = !userId || busy;
  return (
    <section className="mt-6 rounded-2xl border p-4 bg-white">
      <h3 className="text-lg font-semibold mb-3">Gestion du calendrier (hôte/admin)</h3>

      <div className="grid sm:grid-cols-5 gap-3 items-end">
        <div><label className="text-xs text-gray-600">Du</label>
          <input type="date" className="w-full border rounded px-2 py-1" value={from} onChange={e=>setFrom(e.target.value)} />
        </div>
        <div><label className="text-xs text-gray-600">Au</label>
          <input type="date" className="w-full border rounded px-2 py-1" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        <div className="sm:col-span-2"><label className="text-xs text-gray-600">Note (optionnel)</label>
          <input type="text" className="w-full border rounded px-2 py-1" placeholder="ex: entretien, fermé…" value={note} onChange={e=>setNote(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={block} disabled={disabled} className="px-3 py-2 border rounded disabled:opacity-50">Bloquer</button>
          <button onClick={unblock} disabled={disabled} className="px-3 py-2 border rounded disabled:opacity-50">Débloquer</button>
        </div>
      </div>

      <div className="mt-1 text-[10px] text-gray-400">
        listingId={listingId} · userId={userId || "(non connecté)"} · hostId={hostId || "(?)"}
      </div>

      {(busy || err || ok) && (
        <div className="mt-2 text-sm">
          {busy && <div className="p-2 bg-blue-50 border rounded">Traitement…</div>}
          {err && <div className="p-2 bg-red-50 border rounded border-red-300 break-all">Erreur: {err}</div>}
          {ok && <div className="p-2 bg-green-50 border rounded border-green-300">{ok}</div>}
        </div>
      )}

      <div className="mt-4">
        <div className="text-sm font-medium mb-2">Éléments sur la fenêtre</div>
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Statut</th>
                <th className="text-left px-3 py-2">Du</th>
                <th className="text-left px-3 py-2">Au</th>
                <th className="text-left px-3 py-2">Note</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (<tr><td colSpan={6} className="px-3 py-3 text-gray-500">Aucun élément.</td></tr>)}
              {items.map(it => (
                <tr key={it.id} className="border-t">
                  <td className="px-3 py-2">{it.kind}</td>
                  <td className="px-3 py-2">{it.status}</td>
                  <td className="px-3 py-2">{it.check_in}</td>
                  <td className="px-3 py-2">{it.check_out}</td>
                  <td className="px-3 py-2">{it.note || ""}</td>
                  <td className="px-3 py-2">
                    {it.kind === "block" ? <span className="text-gray-500">Bloc manuel</span> : <span className="text-gray-500">Réservation</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
