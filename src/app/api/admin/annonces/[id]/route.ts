import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

function isAdmin(req: Request) {
  const c = cookies();
  const isCookie = c.get("admin")?.value === "1";
  const isHeader = req.headers.get("x-admin-secret") === process.env.ADMIN_PASSWORD;
  return isCookie || isHeader;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase service non configuré" }, { status: 500 });
  const body = await req.json().catch(()=> ({}));
  const update:any = {};
  for (const k of ["title","commune","price","description","host_name","is_published"]) {
    if (k in body) update[k] = body[k];
  }
  if ("tags" in body) update.tags = Array.isArray(body.tags) ? body.tags : [];
  if ("photos" in body) update.photos = Array.isArray(body.photos) ? body.photos : [];
  const { data, error } = await supabaseAdmin
    .from("annonces")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase service non configuré" }, { status: 500 });
  const { error } = await supabaseAdmin.from("annonces").delete().eq("id", params.id);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}
