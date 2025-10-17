'use client';
import { useState } from "react";
type Commune = { id:string; name:string; blurb?:string|null; top_pct:number; left_pct:number; tags?:string[]|null };

export default function MapCommunes({ items }:{items:Commune[]}) {
  const [picked, setPicked] = useState<Commune|null>(null);
  return (
    <div className="space-y-3">
      <div className="relative w-full h-[520px] bg-gradient-to-b from-sky-200 to-emerald-100 rounded-3xl shadow-inner overflow-hidden">
        <div className="absolute inset-6 rounded-3xl border border-white/60" />
        {items.map(c=>{
          const top = Number(c.top_pct)||0; const left = Number(c.left_pct)||0;
          return (
            <button
              key={c.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ top: `${top}%`, left: `${left}%` }}
              title={c.name}
              onClick={()=>setPicked(c)}
            >
              <div className="w-8 h-8 rounded-full bg-red-600 shadow-lg group-hover:scale-110 transition-transform grid place-items-center text-white font-bold">
                ·
              </div>
              <span className="text-[11px] bg-white/90 px-2 py-0.5 rounded shadow-sm">{c.name}</span>
            </button>
          );
        })}
        {items.length===0 && (
          <div className="absolute inset-0 grid place-items-center text-gray-600">
            Aucune commune — ajoute des points dans l’admin.
          </div>
        )}
      </div>
      <div className="p-4 bg-white/80 rounded-2xl border">
        {picked ? (
          <div className="text-sm">
            <div className="font-semibold">{picked.name}</div>
            <div className="text-gray-600">{picked.blurb || "—"}</div>
            {picked.tags && picked.tags.length>0 && (
              <div className="text-xs text-gray-500 mt-1">Tags : {picked.tags.join(", ")}</div>
            )}
          </div>
        ) : (
          <div className="text-gray-600 text-sm">Clique un point pour voir le détail.</div>
        )}
      </div>
    </div>
  );
}
