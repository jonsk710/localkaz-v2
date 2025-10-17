import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function getClient() {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export async function GET() {
  const client = await getClient();
  const { data, error } = await client.from("communes").select("*").order("name", { ascending: true });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data: data ?? [] });
}

export async function POST(req: Request) {
  const isAdmin = cookies().get("admin")?.value === "1" || (await req.headers.get("x-admin-secret")) === process.env.ADMIN_PASSWORD;
  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = (body.name ?? "").toString().trim();
  const blurb = (body.blurb ?? "").toString().trim();
  const top_pct = Number(body.top_pct);
  const left_pct = Number(body.left_pct);
  let tags: string[] = [];
  if (Array.isArray(body.tags)) tags = body.tags.map((t: any)=>String(t).trim()).filter(Boolean);
  else if (typeof body.tags === "string") tags = body.tags.split(",").map((s: string)=>s.trim()).filter(Boolean);
  if (!name || Number.isNaN(top_pct) || Number.isNaN(left_pct)) {
    return NextResponse.json({ ok:false, error:"Champs requis: name, top_pct, left_pct" }, { status: 400 });
  }
  const client = await getClient();
  const { data, error } = await client.from("communes").insert({ name, blurb, top_pct, left_pct, tags }).select("*").single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}
