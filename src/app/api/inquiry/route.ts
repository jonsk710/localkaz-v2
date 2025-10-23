import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

export async function POST(req: Request) {
  try {
    const { listing_id, guest_email, guest_name, message } = await req.json();

    if (!listing_id || !message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
    }

    const supa = getSupabaseServerPublic();

    const { error } = await supa.from("inquiries").insert({
      listing_id,
      guest_email: guest_email || null,
      guest_name: guest_name || null,
      message: message.trim(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
