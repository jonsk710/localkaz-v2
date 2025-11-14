import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listing, check_in, check_out, note } = body || {};
    const supa = getSupabaseServerPublic();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data, error } = await supa.rpc("request_reservation_as", {
      p_actor: user.id,
      p_listing_id: listing,
      p_from: check_in,
      p_to: check_out,
      p_note: note ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, booking_id: data });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
