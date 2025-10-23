export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { getSupabaseFromAuthHeader } from "@/lib/supabase/server-auth-header";

export async function POST(req: Request) {
  try {
    const { id, is_active, is_approved } = await req.json();
    if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

    const authHeader = req.headers.get("authorization") || "";
    const supa = authHeader ? getSupabaseFromAuthHeader(authHeader) : getSupabaseServerAuth();

    const { data: { user }, error: authErr } = await supa.auth.getUser();
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 401 });
    if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { error } = await supa.rpc("admin_set_listing_status", {
      p_id: id,
      p_is_approved: typeof is_approved === "boolean" ? is_approved : null,
      p_is_active: typeof is_active === "boolean" ? is_active : null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 });
}
