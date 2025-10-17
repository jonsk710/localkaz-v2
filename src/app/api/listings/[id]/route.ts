import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const isAdmin = cookies().get("admin")?.value === "1" || (await req.headers.get("x-admin-secret")) === process.env.ADMIN_PASSWORD;
  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase non configure" }, { status: 500 });

  const body = await req.json().catch(() => ({}));
  const update = {
    title: body.title,
    commune: body.commune,
    price: body.price,
    score_tags: Array.isArray(body.scoreTags) ? body.scoreTags : undefined,
    perks: Array.isArray(body.perks) ? body.perks : undefined,
  };
  const { data, error } = await supabaseAdmin.from("listings").update(update).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const isAdmin = cookies().get("admin")?.value === "1";
  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase non configure" }, { status: 500 });

  const { error } = await supabaseAdmin.from("listings").delete().eq("id", params.id);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}
