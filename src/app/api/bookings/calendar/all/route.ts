import { NextResponse } from "next/server";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "from, to requis (YYYY-MM-DD)" }, { status: 400 });

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY!;
  const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/get_booked_ranges_all`;

  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "apikey": KEY, "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
    body: JSON.stringify({ p_from: from, p_to: to })
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() || "get_booked_ranges_all failed" }, { status: 400 });
  return NextResponse.json({ ranges: await res.json() });
}
