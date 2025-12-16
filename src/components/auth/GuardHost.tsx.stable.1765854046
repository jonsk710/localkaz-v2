"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type SimpleUser = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
    [key: string]: any;
  };
};

type Props = {
  children: ReactNode;
};

// Ici on ne met QUE les vrais comptes hôtes de test
const DEV_HOST_ALLOWLIST = ["test-host@localkaz.test"];

export default function GuardHost({ children }: Props) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const computeIsHost = (u: SimpleUser | null): boolean => {
      if (!u) return false;
      const email = u.email?.toLowerCase() ?? "";
      const role = u.user_metadata?.role;

      // Règle : hôte = role === "host"
      // ou email dans la allowlist de vrais comptes hôtes
      if (role === "host") return true;
      if (DEV_HOST_ALLOWLIST.includes(email)) return true;
      return false;
    };

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const u = (data as any)?.user ?? null;
      setUser(u);
      setIsHost(computeIsHost(u));
      setLoading(false);
    };

    loadUser();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const u = (session as any)?.user ?? null;
      setUser(u);
      setIsHost(computeIsHost(u));
      setLoading(false);
    });

    return () => {
      cancelled = true;
      (data as any)?.subscription?.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm text-slate-500">Vérification des droits...</p>
      </div>
    );
  }

  if (!user || !isHost) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm">
          <h1 className="mb-2 text-lg font-semibold text-slate-900">
            Accès réservé aux hôtes
          </h1>
          <p className="mb-4 text-sm text-slate-600">
            Tu dois être connecté avec un compte hôte pour accéder à cet
            espace.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
