"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RequestForm({ listingId }: { listingId: string }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function calc() {
    setErr(null);
    setQuote(null);
    if (!checkIn || !checkOut) { setErr("Choisis des dates."); return; }
    setLoading(true);
    const { data, error } = await supabase.rpc("calc_quote", { lid: listingId, d1: checkIn, d2: checkOut });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setQuote(data);
    if (data && data.ok === false) {
      setErr("Impossible: " + (data.errors || []).join(", "));
    }
  }

  async function requestBooking() {
    setErr(null);
    if (!checkIn || !checkOut) { setErr("Choisis des dates."); return; }
    setLoading(true);
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes?.user) { setLoading(false); setErr("Connecte-toi pour demander une réservation."); return; }

    // Si pas de devis, on le calcule
    if (!quote || !quote.ok) {
      const { data, error } = await supabase.rpc("calc_quote", { lid: listingId, d1: checkIn, d2: checkOut });
      if (error) { setLoading(false); setErr(error.message); return; }
      setQuote(data);
      if (data && data.ok === false) {
        setLoading(false); setErr("Impossible: " + (data.errors || []).join(", "));
        return;
      }
    }

    const { data, error } = await supabase
      .rpc("create_booking_request", { lid: listingId, d1: checkIn, d2: checkOut, note });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    alert("Demande envoyée ✅ (statut: pending)");
  }

  return (
    <section className="mt-6 p-4 border rounded-xl bg-white space-y-3">
      <h3 className="text-lg font-semibold">Demander ces dates</h3>
      {err && <div className="text-red-600 text-sm">Erreur: {err}</div>}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-gray-600">Arrivée</label>
          <input type="date" className="w-full border rounded px-2 py-1"
            value={checkIn} onChange={e=>setCheckIn(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Départ</label>
          <input type="date" className="w-full border rounded px-2 py-1"
            value={checkOut} onChange={e=>setCheckOut(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm text-gray-600">Note (optionnel)</label>
        <input className="w-full border rounded px-2 py-1"
          placeholder="ex: arrivée tardive, bébé, etc."
          value={note} onChange={e=>setNote(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <button onClick={calc} disabled={loading}
          className="px-3 py-1 rounded border">
          {loading ? "Calcul…" : "Calculer le prix"}
        </button>
        <button onClick={requestBooking} disabled={loading}
          className="px-3 py-1 rounded bg-amber-500 text-white">
          {loading ? "Envoi…" : "Demander la réservation"}
        </button>
      </div>

      {quote?.ok && (
        <div className="text-sm mt-2 p-2 bg-gray-50 rounded border">
          <div>Nuits: <b>{quote.nights}</b></div>
          <div>Prix/nuit: <b>{quote.nightly} {quote.currency}</b></div>
          <div>Frais ménage: <b>{quote.cleaning_fee}</b></div>
          <div>Frais service: <b>{quote.service_fee}</b></div>
          <div>Taxes: <b>{quote.taxes}</b></div>
          <div>Total: <b>{quote.total} {quote.currency}</b></div>
        </div>
      )}
    </section>
  );
}
