'use client';
type Point = { id:string; name:string; blurb?:string|null; top_pct:number; left_pct:number; };
export default function MockMap({ points=[], onPick }:{
  points?: Point[];
  onPick?: (p:Point)=>void;
}) {
  return (
    <div className="relative w-full h-[520px] bg-gradient-to-b from-sky-200 to-emerald-100 rounded-3xl shadow-inner">
      <div className="absolute inset-6 rounded-3xl border border-white/60" />
      {points.map((p)=>(
        <button key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2 group"
          style={{ top: `${p.top_pct}%`, left: `${p.left_pct}%` }} onClick={()=>onPick?.(p)} title={p.name}>
          <svg width="28" height="28" viewBox="0 0 24 24" className="drop-shadow">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z" fill="#16a34a"/>
            <circle cx="12" cy="9" r="2.5" fill="white"/>
          </svg>
          <span className="text-[11px] bg-white/90 px-2 py-0.5 rounded shadow-sm">{p.name}</span>
        </button>
      ))}
    </div>
  );
}
