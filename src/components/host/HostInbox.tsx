"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/env";

const supa = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

type Inquiry = {
  id: string;
  listing_id: string;
  guest_email: string | null;
  guest_name: string | null;
  message: string;
  status: "new" | "read" | "archived";
  created_at: string;
  listings?: { title?: string | null };
};

export default function HostInbox() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supa.auth.getUser();
    if (!user) { setItems([]); setLoading(false); return; }

    const { data, error } = await supa
      .from("inquiries")
      .select("id,listing_id,guest_email,guest_name,message,status,created_at, listings(title)")
      .order("created_at", { ascending: false });

    setItems(data as any || []);
    setLoading(false);
  }

  async function setStatus(id: string, status: "new"|"read"|"archived") {
    const { error } = await supa.from("inquiries").update({ status }).eq("id", id);
    if (!error) load();
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div>Chargement…</div>;
  if (!items.length) return <div className="text-sm text-gray-600">Aucune demande.</div>;

  return (
    <div className="space-y-3">
      {items.map(it => (
        <div key={it.id} className="border border-gray-200 rounded-xl p-3 bg-white">
          <div className="text-sm text-gray-600">{new Date(it.created_at).toLocaleString()}</div>
          <div className="font-semibold">{it.listings?.title || it.listing_id}</div>
          <div className="text-sm">De : {it.guest_name || "—"} {it.guest_email ? `· ${it.guest_email}` : ""}</div>
          <p className="mt-2 whitespace-pre-wrap">{it.message}</p>
          <div className="mt-3 flex gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full border border-gray-200">{it.status}</span>
            <button className="text-xs px-2 py-1 rounded-lg border" onClick={()=>setStatus(it.id, "read")}>Marquer lu</button>
            <button className="text-xs px-2 py-1 rounded-lg border" onClick={()=>setStatus(it.id, "archived")}>Archiver</button>
          </div>
        </div>
      ))}
    </div>
  );
}
