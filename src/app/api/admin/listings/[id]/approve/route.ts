import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";

type Params = { params: { id: string } };

async function ensureAdmin() {
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

export async function POST(_req: Request, { params }: Params) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    const status = auth.reason === "unauthenticated" ? 401 : 403;
    return NextResponse.json({ error: auth.reason }, { status });
  }

  const id = params.id;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  const { data, error } = await admin
    .from("listings")
    .update({ is_approved: true, is_active: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, listing: data }, { status: 200 });
}
