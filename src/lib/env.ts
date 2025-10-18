function required(key: keyof NodeJS.ProcessEnv): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env: ${key}`);
  return v;
}

export const PUBLIC_SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL");
export const PUBLIC_SUPABASE_ANON_KEY = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
export const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE ?? "";
