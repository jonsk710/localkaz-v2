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

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const isAdmin = cookies().get("admin")?.value === "1" || (await _.headers.get("x-admin-secret")) === process.env.ADMIN_PASSWORD;
  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  const id = ctx.params.id;
  const client = await getClient();
  const { error } = await client.from("communes").delete().eq("id", id);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok:true });
}
