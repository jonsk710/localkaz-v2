"use client";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import PasswordInput from "@/components/ui/PasswordInput";

export default function AdminLoginPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // L'API admin vérifiera le rôle "admin"
      window.location.href = "/admin";
    } catch (e: any) {
      setErr(e?.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Connexion — Admin</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email" placeholder="admin@exemple.com"
            value={email} onChange={(e)=>setEmail(e.target.value)} required
            autoComplete="username"
          />
        </div>
        <PasswordInput
          label="Mot de passe"
          placeholder="••••••••"
          value={pass}
          onChange={(e)=>setPass((e.target as HTMLInputElement).value)}
          required
          autoComplete="current-password"
          errorText={err}
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          disabled={loading}
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Le compte doit avoir <b>role: "admin"</b> dans <i>app_metadata</i> (ou <i>user_metadata</i>).
      </p>
    </section>
  );
}
