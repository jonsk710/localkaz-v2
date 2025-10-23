"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function HostMessagesList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const url  = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null);
      try {
        if (!url || !anon) throw new Error("NEXT_PUBLIC_SUPABASE_URL / ANON manquants");
        const supa = createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });

        const { data: { user }, error: uerr } = await supa.auth.getUser();
        if (uerr) throw new Error("auth.getUser: " + uerr.message);
        if (!user) { setRows([]); return; }

        const { data, error } = await supa.rpc("host_conversations_overview");
        if (error) throw new Error(error.message);
        setRows((data as any[]) || []);
      } catch (e:any) {
        setErr(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main style={{padding:20,fontFamily:"system-ui"}}>
      <h1 style={{fontSize:24,fontWeight:700}}>Mes messages</h1>
      {loading && <p>Chargement…</p>}
      {err && <p style={{color:"#b91c1c"}}>❌ {err}</p>}
      {!loading && !err && rows.length === 0 && <p>Aucune conversation.</p>}
      <ul style={{display:"grid",gap:8}}>
        {rows.map((c) => (
          <li key={c.id} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:12,background:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,display:"flex",alignItems:"center",gap:8}}>
                <span>{c.title || c.listing_id}</span>
                {c.unread_count > 0 && (
                  <span
                    style={{
                      display:"inline-flex",
                      alignItems:"center",
                      justifyContent:"center",
                      minWidth:18,
                      height:18,
                      padding:"0 6px",
                      borderRadius:9999,
                      background:"#ef4444",
                      color:"#fff",
                      fontSize:12,
                      lineHeight:"18px",
                    }}
                  >
                    {c.unread_count}
                  </span>
                )}
              </div>
              <div style={{fontSize:12,color:"#555"}}>
                Dernière activité : {c.last_message_at ? new Date(c.last_message_at).toLocaleString() : "—"}
              </div>
            </div>
            <a href={`/espace-hote/messages/${c.id}`} style={{fontSize:13,textDecoration:"underline"}}>Ouvrir →</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
