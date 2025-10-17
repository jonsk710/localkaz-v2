import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

function isAdmin(req: Request) {
  const c = cookies();
  const isCookie = c.get("admin")?.value === "1";
  const isHeader = req.headers.get("x-admin-secret") === process.env.ADMIN_PASSWORD;
  return isCookie || isHeader;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string) {
  if (!supabaseAdmin) return base;
  let candidate = base || "annonce";
  let i = 1;
  while (true) {
    const { data } = await supabaseAdmin.from("annonces").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase service non configuré" }, { status: 500 });
  const { data, error } = await supabaseAdmin
    .from("annonces")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase service non configuré" }, { status: 500 });

  const body = await req.json().catch(()=> ({}));
  const title = String(body.title||"").trim();
  if (!title) return NextResponse.json({ ok:false, error:"Titre requis" }, { status: 400 });

  const payload: any = {
    title,
    commune: body.commune ? String(body.commune).trim() : null,
    price: Number(body.price||0),
    description: body.description ? String(body.description).trim() : null,
    tags: Array.isArray(body.tags) ? body.tags.map((t:string)=>String(t)) : [],
    photos: Array.isArray(body.photos) ? body.photos : [],
    host_name: body.host_name ? String(body.host_name).trim() : null,
    is_published: !!body.is_published,
  };

  const base = slugify(title);
  payload.slug = await uniqueSlug(base);

  const { data, error } = await supabaseAdmin
    .from("annonces")
    .insert(payload)
    .select("*")
    .single();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}
