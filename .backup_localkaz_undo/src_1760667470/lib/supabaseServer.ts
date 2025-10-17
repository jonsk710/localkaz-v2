import { createClient } from "@supabase/supabase-js";

/** Admin/service role — UNIQUEMENT côté serveur (API routes, actions server) */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const service = process.env.SUPABASE_SERVICE_ROLE || "";

export const supabaseAdmin = (url && service) ? createClient(url, service) : null;

/** Client serveur (anon) pratique pour fetch côté server components */
export function serverClient() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return (url && anon) ? createClient(url, anon) : null;
}

export default supabaseAdmin;
