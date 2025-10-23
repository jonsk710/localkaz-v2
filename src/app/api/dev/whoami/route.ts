import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();

  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set() {}, // whoami ne modifie pas les cookies
        remove() {},
      }
    }
  );

  const { data } = await supa.auth.getUser();
  const u = data.user ?? null;
  const role = (u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role ?? null;

  return NextResponse.json({ ok: true, user: u ? { id: u.id, email: u.email, role } : null });
}
