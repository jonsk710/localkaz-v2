"use client";
import { useEffect, useState } from "react";

export default function ContactForm({ listingId }: { listingId: string }) {
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Honeypot & min time
  const [hp, setHp] = useState("");            // champ invisible
  const [ts, setTs] = useState<number>(0);     // timestamp form ouvert
  useEffect(() => { setTs(Date.now()); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(false); setToken(null);

    // si honeypot rempli → succès silencieux
    if (hp) { setOk(true); setMessage(""); return; }

    // min 2 secondes entre ouverture et envoi (bloque bots instantanés)
    const minDelayMs = 2000;
    if (Date.now() - ts < minDelayMs) {
      setErr("Veuillez patienter une seconde et réessayer.");
      return;
    }

    const body = {
      listing_id: listingId,
      guest_email: guestEmail || null,
      guest_name: guestName || null,
      message,
      _hp: "",     // toujours vide côté humain
      _ts: ts,     // envoyé pour contrôle serveur (optionnel)
    };

    setLoading(true);
    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { error: `Non-JSON (${res.status})` };
      if (!res.ok) throw new Error(data?.error || "Erreur");

      setOk(true);
      setMessage("");
      if (data?.token) setToken(String(data.token));
    } catch (e: any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
      {/* Honeypot (caché visuellement) */}
      <div aria-hidden="true" style={{position:"absolute", left:"-9999px", width:1, height:1, overflow:"hidden"}}>
        <label>Votre site web</label>
        <input value={hp} onChange={(e)=>setHp(e.target.value)} autoComplete="off" tabIndex={-1} />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Votre email (facultatif)</label>
        <input type="email" value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)}
               className="px-3 py-2 rounded-lg border border-gray-200 w-full"
               placeholder="vous@example.com" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Votre nom (facultatif)</label>
        <input value={guestName} onChange={(e)=>setGuestName(e.target.value)}
               className="px-3 py-2 rounded-lg border border-gray-200 w-full"
               placeholder="Nom" />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Message</label>
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 w-full min-h-[120px]"
                  placeholder="Bonjour, je suis intéressé(e)..." required />
      </div>
      <button disabled={loading}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
        {loading ? "Envoi..." : "Envoyer la demande"}
      </button>

      {ok && (
        <p className="text-green-700 text-sm">
          ✅ Message envoyé !
          {token && (
            <> Suivre la conversation :{" "}
              <a className="underline" href={`/chat/${token}`} target="_blank" rel="noreferrer">
                ouvrir
              </a>
            </>
          )}
        </p>
      )}
      {err && <p className="text-red-700 text-sm">❌ {err}</p>}
    </form>
  );
}
