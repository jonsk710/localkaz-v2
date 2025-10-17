import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// On force le type non-null pour éviter l'erreur TS au build.
// (Ces variables DOIVENT être présentes dans Vercel > Project > Settings > Environment Variables)
export const supabase: SupabaseClient = createClient(url as string, anon as string);
export const supabaseClient = supabase;
export default supabase;
