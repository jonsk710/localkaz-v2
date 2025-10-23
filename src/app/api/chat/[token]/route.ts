import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

function isUUID(v: string) {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
}

// --- body parser robuste (JSON, form, text) ---
async function parseContent(req: Request): Promise<string> {
  let content = "";
  try {
    const ctype = (req.headers.get("content-type") || "").toLowerCase();
    if (ctype.includes("application/json")) {
      const body = await req.json().catch(() => ({} as any));
      content = String(body?.content ?? body?.message ?? "").trim();
    } else if (ctype.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      content = (params.get("content") || params.get("message") || "").trim();
    } else if (ctype.includes("text/plain")) {
      const text = await req.text();
      content = (text || "").trim();
    } else {
      const text = await req.text();
      try {
        const body = JSON.parse(text);
        content = String(body?.content ?? body?.message ?? "").trim();
      } catch {
        content = (text || "").trim();
      }
    }
  } catch {}
  return content;
}

export async function GET(_: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!isUUID(token)) {
    return NextResponse.json({ error: "Token invalide (attendu UUID)" }, { status: 400 });
  }
  const supa = getSupabaseServerPublic();
  const { data, error } = await supa.rpc("guest_list_messages", { p_public_token: token });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ messages: data || [] });
}

export async function POST(req: Request, { params }: { params: { token: string } }) {
  const token = params.token;
  if (!isUUID(token)) {
    return NextResponse.json({ error: "Token invalide (attendu UUID)" }, { status: 400 });
  }
  try {
    const content = await parseContent(req);
    if (!content) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }
    const supa = getSupabaseServerPublic();
    const { error } = await supa.rpc("guest_send_message", {
      p_public_token: token,
      p_content: content,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
