import GuardHost from "@/components/auth/GuardHost";
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/env";

const supa = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

type Row = {
  id: string;
  listing_id: string | null;
  created_at: string;
  last_message_at: string | null;
  listings?: { title?: string | null } | null;
};

export default function HostMessagesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const { data: { user }, error } = await supa.auth.getUser();
      if (error) throw error;
      if (!user) {
        setUserId(null);
        setItems([]);
        setErr("Connexion requise");
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data, error: qerr } = await supa
        .from("conversations")
        .select("id, listing_id, created_at, last_message_at, listings(title)")
        .eq("host_id", user.id)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(200);

      if (qerr) throw qerr;
      setItems((data || []) as Row[]);
    } catch (e: any) {
      setErr(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <section><h1 className="text-2xl font-bold">Mes messages</h1><p>Chargement…</p></section>;

  if (err && !userId) {
    return (
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Mes messages</h1>
        <p className="text-red-600">{err}</p>
        <a href="/espace-hote/login" className="underline text-sm">Se connecter (Hôte)</a>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold">Mes messages</h1>
      {!items.length ? (
        <p className="text-gray-600 text-sm">Aucune conversation pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id} className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="font-semibold">{c.listings?.title || c.listing_id || "Annonce"}</div>
              <div className="text-xs text-gray-600">
                Dernière activité : {new Date(c.last_message_at || c.created_at).toLocaleString()}
              </div>
              <div className="mt-2">
                <a
                  href={`/espace-hote/messages/${c.id}`}
                  className="text-sm underline"
                >
                  Ouvrir la conversation →
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
