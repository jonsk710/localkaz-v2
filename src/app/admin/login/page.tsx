"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(undefined);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) router.push("/admin");
    else {
      const j = await res.json().catch(()=>({}));
      setErr(j?.error || "Impossible de se connecter.");
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Connexion Admin</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />
        <button className="rounded bg-black text-white px-4 py-2" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </main>
  );
}
