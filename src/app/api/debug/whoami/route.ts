export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServerAuth } from "@/lib/supabase/server-auth";
import { getSupabaseFromAuthHeader } from "@/lib/supabase/server-auth-header";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const supa = authHeader ? getSupabaseFromAuthHeader(authHeader) : getSupabaseServerAuth();
  const { data: { user }, error } = await supa.auth.getUser();
  return NextResponse.json({ user: user ? { id: user.id, email: user.email } : null, error: error?.message || null });
}
