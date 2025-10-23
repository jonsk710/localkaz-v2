"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

function isUUID(v: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
}

export default function ChatStartForm({ listingId, defaultEmail }: { listingId: string; defaultEmail?: string }) {
  const router = useRouter();
  const [guestEmail, setGuestEmail] = useState(defaultEmail || "");
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const first = message.trim();
    if (first.length < 3) {
      setErr("Veuillez écrire un message (au moins 3 caractères).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          guest_email: guestEmail || null,
          guest_name: guestName || null,
          message: first,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      const token = data?.token;
      if (!token || !isUUID(token)) {
        throw new Error("Token de chat invalide");
      }
      router.push(`/chat/${token}`);
    } catch (e:any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
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
                  placeholder="Bonjour, je suis intéressé(e)…" required />
      </div>
      <button disabled={loading}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
        {loading ? "Ouverture du chat…" : "Ouvrir une discussion"}
      </button>
      {err && <p className="text-red-700 text-sm">❌ {err}</p>}
    </form>
  );
}
