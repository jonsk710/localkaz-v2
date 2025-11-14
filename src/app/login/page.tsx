"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
export default function LoginPage(){
  const router = useRouter();
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [loading,setLoading]=useState(false); const [err,setErr]=useState<string|null>(null);
  async function onSubmit(e:React.FormEvent){ e.preventDefault(); setLoading(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if(error){ setErr(error.message); setLoading(false); return; }
    const { data:{ user } } = await supabase.auth.getUser();
    const role = String(user?.user_metadata?.role ?? "");
    if(role==="admin"){ router.replace("/admin"); return; }
    if(role==="host"){ router.replace("/espace-hote"); return; }
    try{
      const { count } = await supabase.from("listings").select("id",{ head:true, count:"exact" }).eq("host_id", user?.id ?? "");
      if((count??0)>0){ router.replace("/espace-hote"); return; }
    }catch{}
    router.replace("/");
  }
  return (
    <main className="max-w-md mx-auto px-4 py-12 space-y-4">
      <h1 className="text-2xl font-bold">Se connecter</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Mot de passe" value={pass} onChange={e=>setPass(e.target.value)} required />
        {err && <p className="text-red-600 text-sm">Erreur: {err}</p>}
        <button disabled={loading} className="rounded bg-black text-white px-4 py-2">{loading?"Connexion…":"Se connecter"}</button>
      </form>
    </main>
  );
}
