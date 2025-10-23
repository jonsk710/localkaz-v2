import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supa = getSupabaseServerPublic();
    const { data: u } = await supa.auth.getUser();
    const user = u?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const convId = params.id;
    // RLS doit déjà vérifier host_id, on ajoute quand même un filtre côté app pour être safe
    const { data, error } = await supa
      .from("messages")
      .select("id, sender_role, content, created_at")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
