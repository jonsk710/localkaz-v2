"use client";

import { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  env: {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "present" | "absent";
    SUPABASE_SERVICE_ROLE: "present" | "absent";
  };
  db?: { message?: string; error?: string };
  error?: string;
};

export default function DebugPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [clientUrl, setClientUrl] = useState<string>("(absent)");

  useEffect(() => {
    // ce que voit le navigateur (build Vercel)
    setClientUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "(absent)");
    fetch("/api/health")
      .then(r => r.json())
      .then(setHealth)
      .catch(e => setHealth({ ok:false, env:{NEXT_PUBLIC_SUPABASE_URL:"?",NEXT_PUBLIC_SUPABASE_ANON_KEY:"absent",SUPABASE_SERVICE_ROLE:"absent"}, error: String(e)}));
  }, []);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Debug env & Supabase</h1>
      <div className="card p-4 space-y-2">
        <div><b>Client sees NEXT_PUBLIC_SUPABASE_URL:</b> {clientUrl}</div>
      </div>
      <div className="card p-4 space-y-2">
        <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(health, null, 2)}</pre>
      </div>
      <p className="text-sm text-gray-600">
        Si <code>ok: true</code> et <code>db.message = "listings accessible"</code> ➜ la prod Vercel utilise bien tes bonnes variables et accède à la table.
      </p>
    </main>
  );
}
