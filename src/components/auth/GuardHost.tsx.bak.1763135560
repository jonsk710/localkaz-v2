"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
export default function GuardHost({ children }: { children: React.ReactNode }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setOk(false); return; }
    const role = String(user.user_metadata?.role ?? "");
    if (role === "admin" || role === "host") { setOk(true); return; }
    const { count } = await supabase.from("listings").select("id", { head: true, count: "exact" }).eq("host_id", user.id);
    setOk((count ?? 0) > 0);
  })(); }, []);
  if (ok === null) return null;
  if (!ok) return (<div className="max-w-3xl mx-auto py-16 text-center space-y-3"><h1 className="text-2xl font-bold">Accès réservé aux hôtes</h1><a className="inline-block px-4 py-2 rounded-2xl bg-amber-500 text-white" href="/login">Se connecter</a></div>);
  return <>{children}</>;
}
