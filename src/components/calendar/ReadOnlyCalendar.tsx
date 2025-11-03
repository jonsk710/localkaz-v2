"use client";
import { useEffect, useMemo, useState } from "react";

type Range = { check_in: string; check_out: string; status: string };

function ymd(d: Date){const y=d.getFullYear(),m=(d.getMonth()+1).toString().padStart(2,"0"),day=d.getDate().toString().padStart(2,"0"); return `${y}-${m}-${day}`;}
function firstDayOfMonth(d: Date){return new Date(d.getFullYear(), d.getMonth(), 1);}
function lastDayOfMonth(d: Date){return new Date(d.getFullYear(), d.getMonth()+1, 0);}
function addMonths(d: Date, n: number){return new Date(d.getFullYear(), d.getMonth()+n, 1);}
function daysMatrix(view: Date){
  const first=firstDayOfMonth(view), last=lastDayOfMonth(view);
  const start=((first.getDay()+6)%7), total=last.getDate();
  const cells:{date:Date; inMonth:boolean}[]=[];
  for(let i=0;i<start;i++){const d=new Date(first); d.setDate(first.getDate()-(start-i)); cells.push({date:d,inMonth:false});}
  for(let i=1;i<=total;i++){cells.push({date:new Date(first.getFullYear(),first.getMonth(),i),inMonth:true});}
  while(cells.length%7!==0){const d=new Date(cells[cells.length-1].date); d.setDate(d.getDate()+1); cells.push({date:d,inMonth:false});}
  return cells;
}
function inAnyRange(d: string, ranges: Range[]){return ranges.some(r => d >= r.check_in && d < r.check_out && r.status !== "cancelled");} // [)

export default function ReadOnlyCalendar({ listingId }: { listingId: string }) {
  const [view, setView] = useState(()=>firstDayOfMonth(new Date()));
  const [ranges, setRanges] = useState<Range[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const from = ymd(firstDayOfMonth(view));
  const to   = ymd(lastDayOfMonth(view));
  const days = useMemo(()=>daysMatrix(view), [view]);
  const monthLabel = view.toLocaleString("fr-FR",{month:"long", year:"numeric"});

  useEffect(()=>{
    if(!listingId) return;
    setLoading(true); setErr(null);
    fetch(`/api/bookings/calendar?listing=${encodeURIComponent(listingId)}&from=${from}&to=${to}`, { cache:"no-store" })
      .then(async r => { const j = await r.json(); if(!r.ok) throw new Error(j?.error || "fetch failed"); setRanges(j.ranges || []); })
      .catch(e => setErr(e.message))
      .finally(()=>setLoading(false));
  }, [listingId, from, to]);

  return (
    <section className="mt-6 border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Calendrier des disponibilités</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border" onClick={()=>setView(addMonths(view,-1))}>←</button>
          <div className="text-base font-medium w-40 text-center">{monthLabel}</div>
          <button className="px-3 py-1 rounded border" onClick={()=>setView(addMonths(view,+1))}>→</button>
        </div>
      </div>
      {loading && <div className="p-2 bg-blue-50 border rounded mb-2">Chargement…</div>}
      {err && <div className="p-2 bg-red-50 border border-red-300 rounded mb-2">Erreur: {err}</div>}
      <div className="grid grid-cols-7 gap-1">
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d=>(
          <div key={d} className="text-center text-xs font-medium p-1">{d}</div>
        ))}
        {days.map(({date,inMonth},i)=>{
          const iso = ymd(date);
          const booked = inAnyRange(iso, ranges);
          return (
            <div key={i}
              className={[
                "border rounded p-2 h-16 flex items-start justify-end text-xs",
                inMonth ? "" : "opacity-40",
                booked ? "bg-red-100 border-red-300" : "bg-white"
              ].join(" ")}
              title={booked ? "Occupé" : "Libre"}
            >
              <span className={booked ? "text-red-700" : "text-gray-700"}>{date.getDate()}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs">
        <span className="inline-flex items-center mr-4"><span className="inline-block w-3 h-3 border bg-white mr-2"></span> Libre</span>
        <span className="inline-flex items-center"><span className="inline-block w-3 h-3 border bg-red-100 border-red-300 mr-2"></span> Occupé</span>
      </div>
    </section>
  );
}
