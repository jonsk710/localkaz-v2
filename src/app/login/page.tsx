"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
};

const ADMIN_EMAILS = ["test-admin@localkaz.test"];

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectAccordingToRole = (user: AuthUser | null) => {
    const role = user?.user_metadata?.role;
    const email = user?.email?.toLowerCase() ?? "";
    const isAdmin = role === "admin" || ADMIN_EMAILS.includes(email);

    if (isAdmin) {
      router.replace("/admin");
    } else if (role === "host") {
      router.replace("/espace-hote");
    } else {
      router.replace("/");
    }
  };

  // Si déjà connecté -> redirection immédiate
  useEffect(() => {
    const checkLoggedIn = async () => {
      const { data } = await supabase.auth.getUser();
      const user = (data as any)?.user as AuthUser | null;
      if (user) {
        redirectAccordingToRole(user);
      }
    };

    checkLoggedIn();
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        setError("Email ou mot de passe incorrect.");
        setSubmitting(false);
        return;
      }

      const user = data.user as unknown as AuthUser;
      redirectAccordingToRole(user);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Réessaie.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Connexion</h1>
        <p className="mb-6 text-sm text-slate-600">
          Connecte-toi avec ton compte LocalKaz.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
