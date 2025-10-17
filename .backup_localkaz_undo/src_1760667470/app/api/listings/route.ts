import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ ok:true, data: [] });
  const { data, error } = await supabaseAdmin.from("listings").select("*").order("created_at",{ ascending:false });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}

export async function POST(req: Request) {
  const isAdmin = cookies().get("admin")?.value === "1" || (await req.headers.get("x-admin-secret")) === process.env.ADMIN_PASSWORD;
  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase non configure" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const insert = {
    title: body.title ?? null,
    commune: body.commune ?? null,
    price: body.price ?? null,
    score_tags: Array.isArray(body.scoreTags) ? body.scoreTags : [],
    perks: Array.isArray(body.perks) ? body.perks : [],
  };
  if (!insert.title) return NextResponse.json({ ok:false, error:"title requis" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("listings").insert(insert).select().single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}
