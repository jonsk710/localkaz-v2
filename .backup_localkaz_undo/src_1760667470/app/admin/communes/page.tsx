/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useRef, useState } from "react";

type Commune = {
  id:string;
  name:string;
  blurb?:string|null;
  top_pct?:number|null;
  left_pct?:number|null;
  lat?:number|null;
  lng?:number|null;
  tags?:string[]|null;
};

const BASEMAP = "/maps/guadeloupe-blank.png";

export default function AdminCommunes(){
  const [items, setItems] = useState<Commune[]>([]);
  const [f, setF] = useState({ name:"", blurb:"", lat:"", lng:"", top_pct:"", left_pct:"", tags:"" });
  const [msg, setMsg] = useState("");
  const boxRef = useRef<HTMLDivElement|null>(null);

  async function load(){
    const r = await fetch("/api/communes", { cache:"no-store" });
    const j = await r.json();
    if (j.ok) setItems(j.data); else setMsg(j.error||"Erreur");
  }
  useEffect(()=>{ load(); },[]);

  function onClickMap(e: React.MouseEvent<HTMLDivElement>){
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const leftPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const topPct  = Math.max(0, Math.min(100, (y / rect.height) * 100));
    const round = (n:number)=> Number(n.toFixed(1));
    setF(prev => ({ ...prev, top_pct: String(round(topPct)), left_pct: String(round(leftPct)) }));
  }

  async function add(e: React.FormEvent){
    e.preventDefault(); setMsg("");
    const res = await fetch("/api/communes", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        name: f.name, blurb: f.blurb,
        lat: f.lat, lng: f.lng,
        top_pct: f.top_pct, left_pct: f.left_pct,
        tags: f.tags
      })
    });
    const j = await res.json();
    if (!j.ok) { setMsg(j.error||"Erreur"); return; }
    setF({ name:"", blurb:"", lat:"", lng:"", top_pct:"", left_pct:"", tags:"" });
    load();
  }

  async function del(id: string){
    setMsg("");
    const r = await fetch(`/api/communes/${id}`, { method:"DELETE" });
    const j = await r.json();
    if (!j.ok) { setMsg(j.error||"Erreur"); return; }
    setItems(items=>items.filter(i=>i.id!==id));
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Communes — placement sur la carte</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Carte image cliquable */}
        <div ref={boxRef} onClick={onClickMap} className="relative rounded-3xl overflow-hidden border bg-white cursor-crosshair">
          <img
            src={BASEMAP}
            alt="Carte Guadeloupe (vierge)"
            className="w-full h-auto select-none"
            draggable={false}
          />
          {/* Points existants (positions en %) */}
          {items
            .filter(c => typeof c.top_pct === "number" && typeof c.left_pct === "number")
            .map((c)=>(
              <div
                key={c.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${c.top_pct}%`, left: `${c.left_pct}%` }}
                title={c.name}
              >
                <div className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-white shadow" />
              </div>
            ))
          }
        </div>

        {/* Formulaire */}
        <form onSubmit={add} className="grid gap-3 bg-white border rounded-2xl p-4 h-fit">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nom</label>
            <input className="border rounded-xl px-3 py-2" placeholder="Sainte-Anne" value={f.name} onChange={e=>setF({...f, name:e.target.value})}/>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Description (blurb)</label>
            <input className="border rounded-xl px-3 py-2" placeholder="Lagons, marché du bourg…" value={f.blurb} onChange={e=>setF({...f, blurb:e.target.value})}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Top %</label>
              <input className="border rounded-xl px-3 py-2" placeholder="ex: 20.5" value={f.top_pct} onChange={e=>setF({...f, top_pct:e.target.value})}/>
            </div>
            <div>
              <label className="text-sm font-medium">Left %</label>
              <input className="border rounded-xl px-3 py-2" placeholder="ex: 60.2" value={f.left_pct} onChange={e=>setF({...f, left_pct:e.target.value})}/>
            </div>
          </div>

          <details className="rounded-xl border p-3">
            <summary className="cursor-pointer text-sm font-medium">Options avancées (lat/lng, tags)</summary>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium">Lat</label>
                <input className="border rounded-xl px-3 py-2" placeholder="16.2260" value={f.lat} onChange={e=>setF({...f, lat:e.target.value})}/>
              </div>
              <div>
                <label className="text-sm font-medium">Lng</label>
                <input className="border rounded-xl px-3 py-2" placeholder="-61.3897" value={f.lng} onChange={e=>setF({...f, lng:e.target.value})}/>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Tags (séparés par des virgules)</label>
                <input className="border rounded-xl px-3 py-2" placeholder="plage,famille" value={f.tags} onChange={e=>setF({...f, tags:e.target.value})}/>
              </div>
            </div>
          </details>

          <button className="px-4 py-2 rounded-2xl bg-amber-500 text-white" type="submit">Ajouter</button>
          {msg && <div className="text-sm text-red-600">{msg}</div>}
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map(c=>(
          <div key={c.id} className="bg-white border rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{c.name}</div>
              <button onClick={()=>del(c.id)} className="text-red-600 text-sm underline">Supprimer</button>
            </div>
            {c.blurb && <div className="text-sm text-gray-600 mt-1">{c.blurb}</div>}
            <div className="text-xs text-gray-500 mt-2 space-y-0.5">
              <div>Top/Left % : {c.top_pct ?? "—"} / {c.left_pct ?? "—"}</div>
              <div>Lat/Lng : {c.lat ?? "—"} / {c.lng ?? "—"}</div>
              <div>Tags : {(c.tags||[]).join(", ") || "—"}</div>
            </div>
          </div>
        ))}
        {items.length===0 && <div className="text-sm text-gray-600">Aucune commune pour l’instant.</div>}
      </div>
    </main>
  );
}
