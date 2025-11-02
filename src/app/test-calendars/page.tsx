"use client";
import { useEffect, useMemo, useState } from "react";

type Listing = { id: string; title: string; price?: number; image_url?: string | null };
type Range = { listing_id: string; check_in: string; check_out: string; status: string };

function ymd(d: Date){const y=d.getFullYear();const m=(d.getMonth()+1).toString().padStart(2,"0");const day=d.getDate().toString().padStart(2,"0");return `${y}-${m}-${day}`;}
function firstDayOfMonth(d: Date){return new Date(d.getFullYear(), d.getMonth(), 1);}
function lastDayOfMonth(d: Date){return new Date(d.getFullYear(), d.getMonth()+1, 0);}
function addMonths(d: Date, n: number){return new Date(d.getFullYear(), d.getMonth()+n, 1);}
function daysMatrix(view: Date){
  const first=firstDayOfMonth(view), last=lastDayOfMonth(view);
  const start=((first.getDay()+6)%7); const total=last.getDate(); const cells:{date:Date;inMonth:boolean}[]=[];
  for (let i=0;i<start;i++){const d=new Date(first); d.setDate(first.getDate()-(start-i)); cells.push({date:d,inMonth:false});}
  for (let i=1;i<=total;i++){cells.push({date:new Date(first.getFullYear(), first.getMonth(), i), inMonth:true});}
  while (cells.length%7!==0){const d=new Date(cells[cells.length-1].date); d.setDate(d.getDate()+1); cells.push({date:d,inMonth:false});}
  return cells;
}
function inAnyRange(d: string, ranges: Range[]){return ranges.some(r => d >= r.check_in && d <= r.check_out && r.status !== "cancelled");}

export default function AllCalendarsPage(){
  const [view, setView] = useState(()=>firstDayOfMonth(new Date()));
  const [listings, setListings] = useState<Listing[]>([]);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const from = ymd(firstDayOfMonth(view));
  const to   = ymd(lastDayOfMonth(view));
  const days = useMemo(()=>daysMatrix(view), [view]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setErr(null);
      try {
        const [L, R] = await Promise.all([
          fetch(`/api/listings/basic`, { cache: "no-store" }).then(r => r.json()),
          fetch(`/api/bookings/calendar/all?from=${from}&to=${to}`, { cache: "no-store" }).then(r => r.json()),
        ]);
        if (cancelled) return;
        if (L.error) throw new Error(L.error);
        if (R.error) throw new Error(R.error);
        setListings(L.items || []);
        setRanges(R.ranges || []);
      } catch(e:any){ if (!cancelled) setErr(e.message || "load failed"); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [from, to]);

  const byListing = useMemo(() => {
    const m = new Map<string, Range[]>();
    for (const r of ranges) {
      if (!m.has(r.listing_id)) m.set(r.listing_id, []);
      m.get(r.listing_id)!.push(r);
    }
    return m;
  }, [ranges]);

  const monthLabel = view.toLocaleString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Calendriers de toutes les annonces</h1>
      <div className="flex items-center justify-between mb-4">
        <button className="px-3 py-1 rounded border" onClick={()=>setView(addMonths(view,-1))}>← Mois précédent</button>
        <div className="text-lg font-medium">{monthLabel}</div>
        <button className="px-3 py-1 rounded border" onClick={()=>setView(addMonths(view,+1))}>Mois suivant →</button>
      </div>

      {loading && <div className="p-3 bg-blue-50 border rounded mb-4">Chargement…</div>}
      {err && <div className="p-3 bg-red-50 border border-red-300 rounded mb-4">Erreur: {err}</div>}

      {(!loading && listings.length === 0) && (
        <div className="p-3 bg-yellow-50 border rounded">Aucune annonce à afficher.</div>
      )}

      <div className="space-y-8">
        {listings.map((l) => {
          const rs = byListing.get(l.id) || [];
          return (
            <div key={l.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-semibold">{l.title || "Sans titre"}</div>
                  {typeof l.price === "number" && <div className="text-sm text-gray-600">{l.price} € / nuit</div>}
                </div>
                {l.image_url ? <img src={l.image_url} alt="" className="w-24 h-16 object-cover rounded" /> : <div className="w-24 h-16 bg-gray-100 rounded" />}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d=>(
                  <div key={d} className="text-center text-xs font-medium p-1">{d}</div>
                ))}
                {days.map(({date,inMonth},i)=>{
                  const iso = ymd(date);
                  const booked = inAnyRange(iso, rs);
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
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-sm">
        <span className="inline-flex items-center mr-4"><span className="inline-block w-4 h-4 border bg-white mr-2"></span> Libre</span>
        <span className="inline-flex items-center"><span className="inline-block w-4 h-4 border bg-red-100 border-red-300 mr-2"></span> Occupé</span>
      </div>
    </div>
  );
}
