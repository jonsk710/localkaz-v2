import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ error: "from, to requis (YYYY-MM-DD)" }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";
    if (!SUPABASE_URL || !KEY) {
      return NextResponse.json({ error: "Supabase non configuré: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY" }, { status: 500 });
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_booked_ranges_all`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ p_from: from, p_to: to })
    });

    const text = await res.text();
    let data: any = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || text || "get_booked_ranges_all failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ ranges: Array.isArray(data) ? data : [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unexpected error" }, { status: 500 });
  }
}
