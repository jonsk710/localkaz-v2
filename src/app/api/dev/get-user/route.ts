import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";

/**
 * POST /api/dev/get-user
 * body: { "email": string }
 * renvoie id / email / role
 */
export async function POST(req: Request) {
  try {
    const { email } = (await req.json().catch(() => ({}))) as { email?: string };
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    const admin = getSupabaseAdminClient();

    let page = 1;
    const perPage = 1000;
    let user: any = null;
    // @ts-ignore
    while (true) {
      // @ts-ignore
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      const users = data?.users ?? [];
      user = users.find((u: any) => (u.email || "").toLowerCase() === email.toLowerCase());
      if (user || users.length < perPage) break;
      page++;
    }
    if (!user) return NextResponse.json({ error: `user not found for email ${email}` }, { status: 404 });

    const role =
      (user.app_metadata?.role as string | undefined) ??
      (user.user_metadata?.role as string | undefined) ??
      null;

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
