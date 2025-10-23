"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

export default function GuestChatPage() {
  const { token = "" } = useParams() as { token?: string };
  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";
  const supa = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });

  async function load() {
    setLoading(true); setErr(null);
    try {
      if (!token) throw new Error("Lien invalide");

      const info = await supa.rpc("guest_conversation_info", { p_public_token: token });
      if (info.error) throw new Error(info.error.message);
      const row = (info.data as any[])[0];
      if (!row) throw new Error("Conversation introuvable");
      setTitle(row.title || "Annonce");

      const res = await supa.rpc("guest_fetch_messages", { p_public_token: token });
      if (res.error) throw new Error(res.error.message);
      setMessages((res.data as any[]) || []);

      await supa.rpc("guest_mark_read", { p_public_token: token });
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
      const res = await fetch("/api/chat/guest/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          content: txt,
          guest_email: guestEmail || null,
          guest_name: guestName || null,
        }),
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
    const t = setInterval(load, 4000); // polling safe
    return () => clearInterval(t);
  }, [token]);

  return (
    <main style={{padding:20, fontFamily:"system-ui", maxWidth:800, margin:"0 auto"}}>
      <h1 style={{fontSize:24, fontWeight:700}}>Conversation — {title}</h1>
      {loading && <p>Chargement…</p>}
      {err && <p style={{color:"#b91c1c"}}>❌ {err}</p>}

      <div style={{display:"grid", gap:8, gridTemplateColumns:"1fr 1fr", margin:"12px 0"}}>
        <input placeholder="Votre email (facultatif)" value={guestEmail} onChange={(e)=>setGuestEmail(e.target.value)}
               style={{border:"1px solid #e5e7eb", borderRadius:10, padding:"8px 12px"}} />
        <input placeholder="Votre nom (facultatif)" value={guestName} onChange={(e)=>setGuestName(e.target.value)}
               style={{border:"1px solid #e5e7eb", borderRadius:10, padding:"8px 12px"}} />
      </div>

      <div style={{border:"1px solid #e5e7eb", borderRadius:12, padding:12, background:"#fff", minHeight:240}}>
        {!messages.length ? (
          <p style={{color:"#555"}}>Aucun message pour l’instant.</p>
        ) : (
          <ul style={{display:"grid", gap:8}}>
            {messages.map((m) => (
              <li key={m.id} style={{
                border:"1px solid #e5e7eb", borderRadius:10, padding:10,
                background: m.sender_role === 'guest' ? '#eff6ff' : '#ecfdf5'
              }}>
                <div style={{fontSize:12, color:"#555"}}>
                  {new Date(m.created_at).toLocaleString()} · {m.sender_role}
                </div>
                <div style={{whiteSpace:"pre-wrap"}}>{m.content}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{display:"flex", gap:8, marginTop:12}}>
        <input style={{flex:1, border:"1px solid #e5e7eb", borderRadius:10, padding:"8px 12px"}}
               value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Écrire votre message…" />
        <button onClick={send}
                style={{border:"1px solid #e5e7eb", borderRadius:10, padding:"8px 12px", background:"#fff"}}>
          Envoyer
        </button>
      </div>
    </main>
  );
}
