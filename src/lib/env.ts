/**
 * Chargement "safe" des variables publiques (ne jette jamais côté client).
 * Si une variable manque, la valeur sera une chaîne vide "".
 * Assure-toi que .env.local contient bien NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export const PUBLIC_SUPABASE_URL =
  (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";

export const PUBLIC_SUPABASE_ANON_KEY =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";
