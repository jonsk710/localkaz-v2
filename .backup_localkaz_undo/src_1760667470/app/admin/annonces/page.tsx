"use client";

import { useEffect, useMemo, useState } from "react";

type Annonce = {
  id: string;
  title: string;
  created_at?: string;
  is_published?: boolean;
  price?: number;
  commune?: string|null;
  tags?: string[]|null;
  photos?: string[]|null;
};

export default function AdminAnnoncesPage() {
  const [rows, setRows] = useState<Annonce[]|null>(null);
  const [q, setQ] = useState("");
  const [onlyPub, setOnlyPub] = useState<"all"|"pub"|"draft">("all");
  const [sortBy, setSortBy] = useState<"date-desc"|"date-asc"|"price-desc"|"price-asc">("date-desc");
  const [busyId, setBusyId] = useState<string|null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/annonces", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setRows(json?.data ?? []);
    } catch {
      setRows([]);
      alert("Accès refusé ou erreur serveur. Connecte-toi sur /admin/login.");
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const data = rows ?? [];
    let out = data;
    if (q.trim()) {
      const s = q.toLowerCase();
      out = out.filter(a =>
        a.title?.toLowerCase().includes(s) ||
        (a.commune ?? "").toLowerCase().includes(s) ||
        (a.tags ?? []).join(",").toLowerCase().includes(s)
      );
    }
    if (onlyPub !== "all") {
      out = out.filter(a => (onlyPub === "pub" ? a.is_published : !a.is_published));
    }
    const byDate = (a: Annonce) => new Date(a.created_at ?? 0).getTime();
    const byPrice = (a: Annonce) => a.price ?? 0;
    switch (sortBy) {
      case "date-asc": out = [...out].sort((a,b) => byDate(a) - byDate(b)); break;
      case "price-desc": out = [...out].sort((a,b) => byPrice(b) - byPrice(a)); break;
      case "price-asc": out = [...out].sort((a,b) => byPrice(a) - byPrice(b)); break;
      default: out = [...out].sort((a,b) => byDate(b) - byDate(a));
    }
    return out;
  }, [rows, q, onlyPub, sortBy]);

  async function togglePublish(id: string, nextVal: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/annonces/${id}`, {
        method: "PUT",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({ is_published: nextVal }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setRows((prev) => (prev ?? []).map(a => a.id === id ? { ...a, is_published: nextVal } : a));
    } catch {
      alert("Impossible de mettre à jour.");
    } finally {
      setBusyId(null);
    }
  }

  async function destroy(id: string) {
    if (!confirm("Supprimer cette annonce ?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/annonces/${id}`, { method:"DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      setRows((prev) => (prev ?? []).filter(a => a.id !== id));
    } catch {
      alert("Impossible de supprimer.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Annonces</h1>
        <a href="/espace-hote/nouvelle" className="border rounded px-3 py-1">+ Nouvelle annonce</a>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Rechercher (titre, commune, tags)…"
          className="border rounded px-3 py-2 w-full sm:w-72"
        />
        <select value={onlyPub} onChange={e=>setOnlyPub(e.target.value as any)} className="border rounded px-2 py-2">
          <option value="all">Tout</option>
          <option value="pub">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value as any)} className="border rounded px-2 py-2">
          <option value="date-desc">Plus récents</option>
          <option value="date-asc">Plus anciens</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="price-asc">Prix croissant</option>
        </select>
      </div>

      <ul className="divide-y rounded border">
        {filtered.map(a => {
          const cover = a.photos?.[0] ||
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=70";
          return (
            <li key={a.id} className="p-3 flex items-center gap-3">
              <img src={cover} alt={a.title} className="w-24 h-18 object-cover rounded border" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{a.title}</div>
                <div className="text-sm text-gray-500">
                  {a.commune ?? "—"} • {a.price ? `${a.price} €` : "—"} • {a.is_published ? "Publié" : "Brouillon"}
                </div>
                <div className="text-xs text-gray-400">{a.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <a className="text-sm underline" href={`/logement/${a.id}`} target="_blank">Voir</a>
                <a className="text-sm underline" href={`/espace-hote/annonces/${a.id}/edit`}>Éditer</a>
                <button
                  className="text-sm border rounded px-2 py-1"
                  disabled={busyId===a.id}
                  onClick={() => togglePublish(a.id, !a.is_published)}
                >
                  {a.is_published ? "Dépublier" : "Publier"}
                </button>
                <button
                  className="text-sm border rounded px-2 py-1 text-red-600"
                  disabled={busyId===a.id}
                  onClick={() => destroy(a.id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="p-3 text-sm text-gray-500">Aucune annonce trouvée.</li>
        )}
      </ul>
    </main>
  );
}
