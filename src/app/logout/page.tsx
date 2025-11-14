"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
export default function Logout(){
  useEffect(() => {
    const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    supa.auth.signOut().finally(() => { window.location.href = "/"; });
  }, []);
  return null;
}
