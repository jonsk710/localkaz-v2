"use client";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function RequestForRoute() {
  const p = useParams() as any;
  const listing = p?.id ? String(p.id) : "";
  const [inDate, setIn] = useState("");
  const [outDate, setOut] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ok?:string,err?:string,total?:number}|null>(null);

  async function submit() {
    setMsg(null);
    if (!listing || !inDate || !outDate) {
      setMsg({err:"Dates manquantes"}); return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/bookings/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ listing, check_in: inDate, check_out: outDate, note })
      });
      const j = await r.json();
      if (!r.ok) { setMsg({err: j.error || "Erreur serveur"}); }
      else { setMsg({ok:"Demande envoyée ✅", total: j?.booking?.total}); }
    } catch (e:any) {
      setMsg({err: String(e?.message || e)});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Demander ces dates</h2>
      {msg?.err && <div className="text-sm text-red-600">Erreur: {msg.err}</div>}
      {msg?.ok && (
        <div className="text-sm text-green-700">
          {msg.ok}{msg.total!=null ? ` — Total estimé: ${msg.total} €` : ""}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-sm text-gray-600">Arrivée</div>
          <input type="date" value={inDate} onChange={e=>setIn(e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <div className="text-sm text-gray-600">Départ</div>
          <input type="date" value={outDate} onChange={e=>setOut(e.target.value)}
                 className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <input className="w-full border rounded px-3 py-2"
             placeholder="Note (optionnel)" value={note} onChange={e=>setNote(e.target.value)} />
      <button onClick={submit} disabled={loading}
              className="rounded bg-amber-500 text-white px-4 py-2">
        {loading ? "Envoi…" : "Demander la réservation"}
      </button>
    </div>
  );
}
