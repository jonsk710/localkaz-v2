"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ADMIN_EMAILS = new Set<string>(["test-admin@localkaz.test"]);

export default function GuardAdmin({ children }: { children: React.ReactNode }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [state, setState] = useState<"loading"|"ok"|"deny">("loading");

  useEffect(() => {
    let live = true;
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!live) return;
      if (!user) { setState("deny"); return; }
      const role = String(user.user_metadata?.role ?? "");
      const email = String(user.email ?? "");
      const allow = role === "admin" || ALLOWED_ADMIN_EMAILS.has(email);
      setState(allow ? "ok" : "deny");
    }
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { check(); });
    return () => { live = false; sub.subscription.unsubscribe(); };
  }, []);

  if (state === "loading") return null;
  if (state === "deny") {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Accès réservé à l’administrateur</h1>
        <a className="inline-block px-4 py-2 rounded-2xl bg-amber-500 text-white" href="/login">Se connecter</a>
      </div>
    );
  }
  return <>{children}</>;
}
