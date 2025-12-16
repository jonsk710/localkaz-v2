"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Role = "admin" | "host" | null;

export default function HeaderAuth() {
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      const u = data.user;
      setEmail(u?.email ?? null);
      const r = ((u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role) as Role ?? null;
      setRole(r);
      setLoading(false);
    });
    return () => { mounted = false; }
  }, [supabase]);

  async function onLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <div className="text-sm text-gray-600">…</div>;

  if (email) {
    const target = role === "admin" ? "/admin" : "/host";
    const label = role === "admin" ? "Mon espace (Admin)" : "Mon espace";
    return (
      <div className="flex items-center gap-2">
        <Link href={target} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm no-underline">
          {label}
        </Link>
        <button onClick={onLogout} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm">
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <Link href="/login" className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm no-underline">
      Se connecter
    </Link>
  );
}
