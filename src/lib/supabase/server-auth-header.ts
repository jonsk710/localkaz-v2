import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseFromAuthHeader(authHeader?: string): SupabaseClient {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  return createClient(url, anon, {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
