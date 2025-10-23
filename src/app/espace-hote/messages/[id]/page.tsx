"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

export default function HostChatPage() {
  const params = useParams() as { id?: string };
  const convId = (params?.id as string) || "";
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const url  = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";
  const supa = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });

  async function load() {
    setLoading(true); setErr(null);
    try {
      const { data, error } = await supa
        .from("messages")
        .select("id, sender_role, content, created_at")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      setMessages((data as any[]) || []);
      try { await supa.rpc("host_mark_read", { p_conversation_id: convId }); } catch {}
    } catch (e:any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    const txt = content.trim();
    if (!txt) return;
    setErr(null);
    try {
      const res = await fetch("/api/chat/host/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: convId, content: txt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur envoi");
      setContent("");
      await load();
    } catch (e:any) {
      setErr(e.message || String(e));
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [convId]);

  return (
    <main style={{padding:20,fontFamily:"system-ui",maxWidth:800,margin:"0 auto"}}>
      <a href="/espace-hote/messages" style={{fontSize:12,textDecoration:"underline"}}>← Retour</a>
      <h1 style={{fontSize:24,fontWeight:700,marginTop:8}}>Conversation</h1>
      {loading && <p>Chargement…</p>}
      {err && <p style={{color:"#b91c1c"}}>❌ {err}</p>}

      <div style={{border:"1px solid #e5e7eb",borderRadius:12,padding:12,background:"#fff",minHeight:220}}>
        {!messages.length ? (
          <p style={{color:"#555"}}>Aucun message.</p>
        ) : (
          <ul style={{display:"grid",gap:8}}>
            {messages.map((m) => (
              <li key={m.id} style={{
                border:"1px solid #e5e7eb",borderRadius:10,padding:10,
                background: m.sender_role === 'host' ? '#eff6ff' : '#ecfdf5'
              }}>
                <div style={{fontSize:12,color:"#555"}}>
                  {new Date(m.created_at).toLocaleString()} · {m.sender_role}
                </div>
                <div style={{whiteSpace:"pre-wrap"}}>{m.content}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{display:"flex",gap:8,marginTop:12}}>
        <input
          style={{flex:1,border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px"}}
          value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Écrire…"
        />
        <button onClick={send} style={{border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px",background:"#fff"}}>
          Envoyer
        </button>
      </div>
    </main>
  );
}
