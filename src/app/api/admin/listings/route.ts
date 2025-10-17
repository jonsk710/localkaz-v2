import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";

function supabaseFromToken(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
}

async function ensureAdmin(token?: string | null) {
  if (process.env.DEV_ADMIN_BYPASS === "1") return { ok: true as const, user: null };

  if (token) {
    const supa = supabaseFromToken(token);
    const { data, error } = await supa.auth.getUser();
    if (error || !data.user) return { ok: false as const, reason: "unauthenticated" };
    const role =
      (data.user.app_metadata as any)?.role ??
      (data.user.user_metadata as any)?.role ??
      null;
    if (role !== "admin") return { ok: false as const, reason: "forbidden" };
    return { ok: true as const, user: data.user };
  }

  const supa = getSupabaseServerClient();
  const { data, error } = await supa.auth.getUser();
  if (error || !data.user) return { ok: false as const, reason: "unauthenticated" };
  const role =
    (data.user.app_metadata as any)?.role ??
    (data.user.user_metadata as any)?.role ??
    null;
  if (role !== "admin") return { ok: false as const, reason: "forbidden" };
  return { ok: true as const, user: data.user };
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7)
    : null;

  const auth = await ensureAdmin(token);
  if (!auth.ok) {
    const status = auth.reason === "unauthenticated" ? 401 : 403;
    return NextResponse.json({ error: auth.reason }, { status });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("admin_listings_view")
    .select(`id, title, description, price, currency, is_active, is_approved, created_at, updated_at, host_id, host_email, host_name`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}
