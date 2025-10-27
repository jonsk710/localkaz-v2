"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

function num(v: string | null | undefined) {
  if (!v) return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
}

export default function QueryBar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [cur, setCur] = useState("ALL");

  // Init depuis URL
  useEffect(() => {
    setQ(sp.get("q") || "");
    setMin(num(sp.get("price_min")));
    setMax(num(sp.get("price_max")));
    setCur(sp.get("currency") || "ALL");
  }, [sp]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const next = new URLSearchParams(sp.toString());
    if (q.trim()) next.set("q", q.trim()); else next.delete("q");
    if (min !== "" && Number(min) >= 0) next.set("price_min", String(Number(min))); else next.delete("price_min");
    if (max !== "" && Number(max) >= 0) next.set("price_max", String(Number(max))); else next.delete("price_max");
    if (cur && cur !== "ALL") next.set("currency", cur); else next.delete("currency");
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  function reset() {
    const next = new URLSearchParams(sp.toString());
    ["q","price_min","price_max","currency"].forEach(k => next.delete(k));
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  return (
    <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-3 grid lg:grid-cols-5 gap-3">
      <div className="lg:col-span-2">
        <label className="text-sm text-gray-700 block mb-1">Mot-clé</label>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Ex : plage, studio, piscine…"
          className="w-full px-3 py-2 rounded-lg border border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">Prix min</label>
        <input
          inputMode="numeric"
          value={min}
          onChange={(e)=>setMin(e.target.value.replace(/[^\d.]/g,""))}
          placeholder="0"
          className="w-full px-3 py-2 rounded-lg border border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">Prix max</label>
        <input
          inputMode="numeric"
          value={max}
          onChange={(e)=>setMax(e.target.value.replace(/[^\d.]/g,""))}
          placeholder="300"
          className="w-full px-3 py-2 rounded-lg border border-gray-200"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700 block mb-1">Devise</label>
        <select
          value={cur}
          onChange={(e)=>setCur(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-200"
        >
          <option value="ALL">Toutes</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="lg:col-span-5 flex items-center gap-2">
        <button
          type="submit"
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >Filtrer</button>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
        >Réinitialiser</button>
      </div>
    </form>
  );
}
