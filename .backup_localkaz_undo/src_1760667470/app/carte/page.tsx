'use client';

import { useEffect, useState } from "react";
import MapCommunes from "@/components/MapCommunes";

type Commune = { id:string; name:string; blurb?:string|null; top_pct:number; left_pct:number; tags?:string[]|null };

export default function CartePage(){
  const [items, setItems] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/communes", { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (j.ok) setItems(j.data || []);
        else setErr(j.error || "Erreur");
      } catch (e:any) {
        if (alive) setErr(e?.message || "Erreur réseau");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Carte des communes</h1>

      {err && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="h-[520px] rounded-3xl bg-gray-100 animate-pulse" />
      ) : (
        <MapCommunes items={items} />
      )}
    </main>
  );
}
