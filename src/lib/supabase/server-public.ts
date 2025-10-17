import { createClient } from "@supabase/supabase-js";

/** Client Supabase côté serveur, sans cookies, avec la clé ANON.
 *  Sert pour les pages publiques (RLS fait le filtre).
 */
export function getSupabaseServerPublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}
