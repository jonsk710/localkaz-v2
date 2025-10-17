"use client";

import { useEffect, useMemo, useState } from "react";
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
  updated_at: string;
  host_id: string | null;
  host_email: string | null;
  host_name: string | null;
};

type FilterKey = "all" | "pending" | "approved" | "active" | "inactive";

export default function AdminTable() {
  const supabase = getSupabaseBrowserClient();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [unapproving, setUnapproving] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    async function grabToken() {
      const { data } = await supabase.auth.getSession();
      setAccessToken(data.session?.access_token ?? null);
    }
    grabToken();
  }, [supabase]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { "cache-control": "no-store" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch("/api/admin/listings", { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const reason = body?.error || `HTTP ${res.status}`;
        setError(
          res.status === 401 || res.status === 403
            ? "Accès réservé aux admins. Connecte-toi avec un compte admin."
            : `Erreur chargement: ${reason}`
        );
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [accessToken]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "pending": return items.filter(i => !i.is_approved);
      case "approved": return items.filter(i => i.is_approved);
      case "active": return items.filter(i => i.is_active);
      case "inactive": return items.filter(i => !i.is_active);
      default: return items;
    }
  }, [items, filter]);

  const counters = useMemo(() => ({
    all: items.length,
    pending: items.filter(i => !i.is_approved).length,
    approved: items.filter(i => i.is_approved).length,
    active: items.filter(i => i.is_active).length,
    inactive: items.filter(i => !i.is_active).length,
  }), [items]);

  async function approve(id: string) {
    setApproving(id);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`/api/admin/listings/${id}/approve`, { method: "POST", headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      setItems(prev => prev.map(it => it.id === id ? { ...it, is_approved: true, is_active: true } : it));
    } catch (e: any) {
      setError(e?.message || "Erreur approbation");
    } finally {
      setApproving(null);
    }
  }

  async function toggleActive(id: string) {
    setToggling(id);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`/api/admin/listings/${id}/toggle-active`, { method: "POST", headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const { listing } = await res.json();
      setItems(prev => prev.map(it => it.id === id ? { ...it, is_active: listing.is_active } : it));
    } catch (e: any) {
      setError(e?.message || "Erreur changement de statut");
    } finally {
      setToggling(null);
    }
  }

  async function unapprove(id: string) {
    setUnapproving(id);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`/api/admin/listings/${id}/unapprove`, { method: "POST", headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      setItems(prev => prev.map(it => it.id === id ? { ...it, is_approved: false } : it));
    } catch (e: any) {
      setError(e?.message || "Erreur désapprobation");
    } finally {
      setUnapproving(null);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Chargement…</div>;

  return (
    <div style={{ padding: 16 }}>
      {/* Filtres & compteurs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {([
          ["all","Tous"],
          ["pending","En attente"],
          ["approved","Approuvés"],
          ["active","Actifs"],
          ["inactive","Inactifs"],
        ] as [FilterKey,string][]).map(([key,label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: filter === key ? "#eef6ff" : "white",
              cursor: "pointer",
            }}
          >
            {label} ({counters[key] as number})
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd" }}>
          ↻ Recharger
        </button>
      </div>

      {error && <div style={{ marginBottom: 12, color: "#b00020" }}>{error}</div>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: "8px 6px" }}>Titre</th>
              <th style={{ padding: "8px 6px" }}>Prix</th>
              <th style={{ padding: "8px 6px" }}>Statuts</th>
              <th style={{ padding: "8px 6px" }}>Host</th>
              <th style={{ padding: "8px 6px" }}>Créé le</th>
              <th style={{ padding: "8px 6px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px 6px", maxWidth: 360 }}>
                  <div style={{ fontWeight: 600 }}>{it.title}</div>
                  {it.description && (
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {it.description.length > 140 ? it.description.slice(0,140)+"…" : it.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: "10px 6px", whiteSpace: "nowrap" }}>
                  {it.price != null ? `${it.price} ${it.currency ?? "EUR"}` : "—"}
                </td>
                <td style={{ padding: "10px 6px", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, fontSize: 12,
                    background: it.is_approved ? "#e6ffed" : "#fff7e6",
                    border: `1px solid ${it.is_approved ? "#a6f4c5" : "#ffd699"}`
                  }}>
                    {it.is_approved ? "Approuvée" : "En attente"}
                  </span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 999, fontSize: 12,
                    background: it.is_active ? "#eef7ff" : "#fde8e8",
                    border: `1px solid ${it.is_active ? "#c7e2ff" : "#fdcaca"}`
                  }}>
                    {it.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "10px 6px" }}>
                  <div>{it.host_name ?? "—"}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{it.host_email ?? "—"}</div>
                </td>
                <td style={{ padding: "10px 6px" }}>{new Date(it.created_at).toLocaleString()}</td>
                <td style={{ padding: "10px 6px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {!it.is_approved ? (
                    <button
                      onClick={() => approve(it.id)}
                      disabled={approving === it.id}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd" }}
                    >
                      {approving === it.id ? "…" : "Approuver"}
                    </button>
                  ) : (
                    <button
                      onClick={() => unapprove(it.id)}
                      disabled={unapproving === it.id}
                      style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd" }}
                    >
                      {unapproving === it.id ? "…" : "Désapprouver"}
                    </button>
                  )}

                  <button
                    onClick={() => toggleActive(it.id)}
                    disabled={toggling === it.id}
                    style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd" }}
                  >
                    {toggling === it.id ? "…" : it.is_active ? "Désactiver" : "Activer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
