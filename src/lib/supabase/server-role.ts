import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export type Role = "admin" | "host" | null;

export async function getUserAndRole() {
  const cookieStore = cookies();
  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
      },
    }
  );
  const { data } = await supa.auth.getUser();
  const user = data.user ?? null;
  const role: Role =
    ((user?.app_metadata as any)?.role as Role) ??
    ((user?.user_metadata as any)?.role as Role) ??
    null;
  return { user, role };
}

export async function assertRole(required: Exclude<Role, null>) {
  const { user, role } = await getUserAndRole();
  return { ok: !!user && role === required, role, user };
}
