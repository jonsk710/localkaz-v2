import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const cookieStore = cookies();

  // On stocke temporairement les cookies écrits par Supabase
  const jar: Array<{ name: string; value: string; options?: any }> = [];

  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value; },
        set(name, value, options) { jar.push({ name, value, options }); },
        remove(name, options) { jar.push({ name, value: "", options: { ...options, maxAge: 0 } }); },
      }
    }
  );

  const { error, data } = await supa.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ error: error.message }, { status: 401 });

  const u = data.user;
  const role = (u?.app_metadata as any)?.role ?? (u?.user_metadata as any)?.role ?? null;

  // Réponse finale JSON…
  const res = NextResponse.json({ ok: true, user: { id: u?.id, email: u?.email, role } });
  // …dans laquelle on **re-joue** les Set-Cookie collectés
  for (const c of jar) res.cookies.set({ name: c.name, value: c.value, ...c.options });

  return res;
}
