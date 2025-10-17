import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ ok:true, data: {} });
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").limit(1).single();
  if (error && error.code !== "PGRST116") return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data: data || {} });
}

export async function POST(req: Request) {
  const isAdmin = cookies().get("admin")?.value === "1" || (await req.headers.get("x-admin-secret")) === process.env.ADMIN_PASSWORD;
  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase non configuré" }, { status: 500 });

  const body = await req.json().catch(()=>({}));
  const row = {
    site_name: body.site_name ?? null,
    hero_title: body.hero_title ?? null,
    hero_subtitle: body.hero_subtitle ?? null,
    hero_image_url: body.hero_image_url ?? null,
  };
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ id: 1, ...row }, { onConflict: "id" })
    .select()
    .single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}
