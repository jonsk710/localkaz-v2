"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Role = "admin" | "host" | null;

export default function AuthButtons() {
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
      const r =
        ((u?.app_metadata as any)?.role as Role) ??
        ((u?.user_metadata as any)?.role as Role) ??
        null;
      setRole(r ?? null);
      setLoading(false);
    });
    return () => { mounted = false; }
  }, [supabase]);

  async function onLogout() {
    await supabase.auth.signOut();
    // full reload pour refléter l'état
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-600">…</div>
    );
  }

  // Connecté
  if (email) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {role === "admin" ? "Admin" : role === "host" ? "Hôte" : "Utilisateur"} — {email}
        </span>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  // Non connecté
  return (
    <div className="flex items-center gap-2">
      <Link href="/espace-hote/login" className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm no-underline">
        Connexion Hôte
      </Link>
      <Link href="/admin/login" className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm no-underline">
        Connexion Admin
      </Link>
    </div>
  );
}
