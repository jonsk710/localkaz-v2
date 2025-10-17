/* eslint-disable @next/next/no-img-element */
'use client';
import { useState } from "react";
export default function Gallery({ photos, alt }: { photos: string[]; alt?: string }) {
  const list = Array.isArray(photos) ? photos.filter(Boolean) : [];
  const [i, setI] = useState(0);
  if (list.length === 0) return <div className="aspect-[16/10] rounded-2xl bg-gray-100" />;
  const go = (d:number)=> setI(v => Math.max(0, Math.min(list.length-1, v + d)));
  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden">
        <img src={list[i]} alt={alt||""} className="w-full h-full object-cover" />
        {list.length > 1 && (
          <>
            <button onClick={()=>go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white shadow" aria-label="Précédent">‹</button>
            <button onClick={()=>go(1)}  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-white/80 hover:bg-white shadow" aria-label="Suivant">›</button>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((p, idx)=>(
            <button key={idx} onClick={()=>setI(idx)} className={`rounded-xl overflow-hidden border ${idx===i ? "ring-2 ring-amber-500" : ""}`}>
              <img src={p} alt="" className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
