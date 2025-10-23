import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export async function GET() {
  try {
    const supa = getSupabaseServerPublic();
    const { data: u, error: uerr } = await supa.auth.getUser();
    if (uerr) return NextResponse.json({ error: uerr.message }, { status: 400 });
    const user = u?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supa
      .from("conversations")
      .select("id, listing_id, last_message_at, created_at, listings(title)")
      .eq("host_id", user.id)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ items: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
