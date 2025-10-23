import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server-admin";

export async function POST(req: Request) {
  const { email, role } = await req.json().catch(() => ({})) as { email?: string; role?: "host" | "admin" };
  if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });

  const admin = getSupabaseAdminClient();

  // @ts-ignore
  let page = 1, perPage = 1000, found: any = null;
  // @ts-ignore
  while (true) {
    // @ts-ignore
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const users = data?.users ?? [];
    found = users.find((u: any) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (found || users.length < perPage) break;
    page++;
  }
  if (!found) return NextResponse.json({ error: `user not found for email ${email}` }, { status: 404 });

  const newApp = { ...(found.app_metadata ?? {}), role };
  const newUser = { ...(found.user_metadata ?? {}), role };

  // @ts-ignore
  const { error: updErr } = await admin.auth.admin.updateUserById(found.id, {
    app_metadata: newApp,
    user_metadata: newUser,
  });
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, user: { id: found.id, email, role } });
}
