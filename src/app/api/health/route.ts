import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "(absent)";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "absent";
  const service = process.env.SUPABASE_SERVICE_ROLE ? "present" : "absent";

  try {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: pingErr } = await supa.from("listings").select("id").limit(1);
    return NextResponse.json({
      ok: !pingErr,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,     // on n'affiche pas la clé
        SUPABASE_SERVICE_ROLE: service           // idem
      },
      db: pingErr ? { error: pingErr.message } : { message: "listings accessible" }
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
        SUPABASE_SERVICE_ROLE: service
      },
      error: e?.message || "unknown"
    }, { status: 500 });
  }
}
