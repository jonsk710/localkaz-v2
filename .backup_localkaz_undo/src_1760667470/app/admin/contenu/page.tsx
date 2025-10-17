/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useState } from "react";

type Settings = { site_name?:string|null; hero_title?:string|null; hero_subtitle?:string|null; hero_image_url?:string|null; };

export default function ContenuPage(){
  const [s, setS] = useState<Settings>({});
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(j=>{ if(j.ok) setS(j.data || {}); }); },[]);

  async function uploadHero(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true); setMsg("");
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/upload", { method:"POST", body: fd });
    const j = await res.json();
    if (!j.ok) { setMsg(j.error || "Erreur upload"); setUploading(false); return; }
    setS(v => ({ ...v, hero_image_url: j.url }));
    setUploading(false);
  }

  async function save(){
    setMsg("");
    const res = await fetch("/api/settings", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(s) });
    const j = await res.json();
    setMsg(j.ok ? "Enregistré ✅" : (j.error || "Erreur"));
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Contenu du site</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-4 border space-y-3">
          <label className="text-sm font-medium">Nom du site</label>
          <input className="border rounded-xl px-3 py-2 w-full" value={s.site_name||""} onChange={e=>setS({...s, site_name:e.target.value})}/>
          <label className="text-sm font-medium">Titre hero</label>
          <input className="border rounded-xl px-3 py-2 w-full" value={s.hero_title||""} onChange={e=>setS({...s, hero_title:e.target.value})}/>
          <label className="text-sm font-medium">Sous-titre hero</label>
          <input className="border rounded-xl px-3 py-2 w-full" value={s.hero_subtitle||""} onChange={e=>setS({...s, hero_subtitle:e.target.value})}/>
          <label className="text-sm font-medium">Image hero</label>
          <input type="file" accept="image/*" onChange={uploadHero}/>
          {uploading && <div className="text-sm text-slate-500">Upload…</div>}
          {s.hero_image_url && <img src={s.hero_image_url} className="h-36 rounded-xl object-cover border" alt="hero" />}
          <div><button className="px-4 py-2 rounded-2xl bg-amber-500 text-white" onClick={save}>Enregistrer</button></div>
          {msg && <div className="text-sm text-slate-600">{msg}</div>}
        </div>
        <div className="rounded-2xl bg-white p-4 border">
          <div className="text-sm text-slate-600">Gère ici le texte et l’image du hero de l’accueil. Les autres sections viendront ensuite (SEO, pages légales, etc.).</div>
        </div>
      </div>
    </main>
  );
}
