import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export async function POST(req: Request) {
  try {
    const { booking_id } = await req.json();
    const supa = getSupabaseServerPublic();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { error } = await supa.rpc("host_decline_booking_as", {
      p_actor: user.id,
      p_booking_id: booking_id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
