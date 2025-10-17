"use client";

import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message);
      return;
    }
    // Redirige vers l'admin
    window.location.href = "/admin";
  }

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: 360, maxWidth: "100%", display: "grid", gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Connexion</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
          style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        {err && <div style={{ color: "#b00020", fontSize: 14 }}>{err}</div>}
        <p style={{ fontSize: 12, color: "#666" }}>
          Utilise ton compte admin (role=admin). Tu peux en créer un dans Supabase (Auth &rarr; Users).
        </p>
      </form>
    </main>
  );
}
