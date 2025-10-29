"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/env";

const supa = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

type Msg = {
  id: string;
  created_at: string;
  sender_role: "guest" | "host";
  message: string;
};

export default function HostConversationPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supa
        .from("messages")
        .select("id,created_at,sender_role,message")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMsgs((data || []) as Msg[]);
    } catch (e:any) {
      setErr(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (id) load(); }, [id]);

  return (
    <section className="space-y-3">
      <a href="/espace-hote/messages" className="text-sm underline text-gray-600">← Retour</a>
      <h1 className="text-2xl font-bold">Conversation</h1>
      {loading ? <p>Chargement…</p> : err ? <p className="text-red-600">{err}</p> : (
        !msgs.length ? <p className="text-gray-600 text-sm">Aucun message.</p> : (
          <div className="space-y-2">
            {msgs.map(m => (
              <div key={m.id} className={`p-2 rounded-lg border ${m.sender_role === "host" ? "bg-sky-50 border-sky-200" : "bg-white border-gray-200"}`}>
                <div className="text-xs text-gray-600">{new Date(m.created_at).toLocaleString()} — {m.sender_role}</div>
                <div className="whitespace-pre-wrap">{m.message}</div>
              </div>
            ))}
          </div>
        )
      )}
    </section>
  );
}
