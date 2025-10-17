"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Sess = {
  email: string | null;
  role: string | null;
};

export default function AuthHeader() {
  const supabase = getSupabaseBrowserClient();
  const [sess, setSess] = useState<Sess | null>(null);
  const [loading, setLoading] = useState(true);

  async function readSession() {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user ?? null;
    setSess({
      email: user?.email ?? null,
      role:
        // priorités: app_metadata.role > user_metadata.role
        ((user?.app_metadata as any)?.role as string | null) ??
        ((user?.user_metadata as any)?.role as string | null) ??
        null,
    });
    setLoading(false);
  }

  useEffect(() => {
    readSession();
    const { data: sub } = supabase.auth.onAuthStateChange(() => readSession());
    return () => sub.subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      borderBottom: "1px solid #eee",
      position: "sticky",
      top: 0,
      background: "white",
      zIndex: 10
    }}>
      <a href="/" style={{ fontWeight: 800 }}>LocalKaz</a>
      <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/admin">Admin</a>
        <a href="/login">Login</a>
        {!loading && sess?.email ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#555" }}>
              {sess.email} — rôle: <b>{sess.role ?? "user"}</b>
            </span>
            <button onClick={logout} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd" }}>
              Se déconnecter
            </button>
          </div>
        ) : (
          <span style={{ fontSize: 12, color: "#777" }}>
            {loading ? "…" : "Non connecté"}
          </span>
        )}
      </nav>
    </header>
  );
}
