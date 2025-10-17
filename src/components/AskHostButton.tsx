'use client';
import { useState } from "react";

export default function AskHostButton({ annonceId }: { annonceId: string }) {
  const [open, setOpen] = useState(false);
  const [sender_name, setName] = useState("");
  const [sender_email, setEmail] = useState("");
  const [message, setMsg] = useState("");
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setErr(null); setOk(null);
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ annonce_id: annonceId, sender_name, sender_email, message })
    });
    const j = await r.json().catch(()=>({}));
    setLoading(false);
    if (r.ok && j.ok) {
      setOk("Message envoyé à l’hôte ✅");
      setName(""); setEmail(""); setMsg("");
    } else {
      setErr(j.error || "Erreur lors de l’envoi");
    }
  };

  return (
    <div className="space-y-3">
      <button className="w-full px-4 py-3 rounded-2xl bg-amber-500 text-white" onClick={()=>setOpen(v=>!v)}>
        {open ? "Fermer" : "Contacter l’hôte"}
      </button>
      {open && (
        <div className="space-y-2 border rounded-2xl p-3 bg-white">
          <input value={sender_name} onChange={e=>setName(e.target.value)} placeholder="Votre nom"
                 className="w-full border rounded-xl px-3 py-2" />
          <input value={sender_email} onChange={e=>setEmail(e.target.value)} placeholder="Votre email"
                 className="w-full border rounded-xl px-3 py-2" />
          <textarea value={message} onChange={e=>setMsg(e.target.value)} placeholder="Votre message"
                    className="w-full border rounded-xl px-3 py-2 min-h-[90px]" />
          <button disabled={loading} onClick={submit}
                  className="w-full px-4 py-2 rounded-2xl bg-slate-800 text-white disabled:opacity-50">
            {loading ? "Envoi…" : "Envoyer"}
          </button>
          {ok && <div className="text-green-700 text-sm">{ok}</div>}
          {err && <div className="text-red-600 text-sm">{err}</div>}
        </div>
      )}
    </div>
  );
}
