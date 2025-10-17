import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ ok:false, data:[], error:"Supabase non configuré" }, { status:200 });
  const s = createClient(url, anon);
  const { data, error } = await s
    .from("annonces")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true, data });
}
