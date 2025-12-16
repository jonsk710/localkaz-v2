"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    (async () => {
      await supa.auth.signOut();
      router.replace("/");
    })();
  }, [router]);
  return null;
}
