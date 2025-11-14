import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export async function POST(req: Request) {
  try {
    const { booking, action } = await req.json();
    if (!booking || !action) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }
    const supa = getSupabaseServerPublic();
    const { data, error } = await supa
      .rpc("host_decide_reservation", { p_booking: booking, p_action: action })
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, booking: data });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
