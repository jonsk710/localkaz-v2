import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(req: Request) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide (JSON attendu)" }, { status: 400 }); }

    const token = body?.token as string;
    const content = String(body?.content ?? "").trim();
    const guest_email = body?.guest_email || null;
    const guest_name  = body?.guest_name  || null;

    if (!token || content.length < 1) return NextResponse.json({ error: "Champs invalides" }, { status: 400 });

    const supa = getSupabaseServerPublic();

    // 🔒 Rate-limit par IP+token: 30 / 10 min
    const ip = getClientIp(req);
    const bucket = `guest:${ip}:${token}`;
    const { data: okMsg, error: rlErr } = await supa.rpc("rl_check_and_hit", { p_bucket: bucket, p_limit: 30, p_window_seconds: 600 });
    if (rlErr) return NextResponse.json({ error: rlErr.message }, { status: 400 });
    if (!okMsg) return NextResponse.json({ error: "Trop de messages. Réessayez plus tard." }, { status: 429 });

    // Proxy vers RPC sécurisée
    const { data, error } = await supa.rpc("guest_send_message", {
      p_public_token: token,
      p_content: content,
      p_guest_email: guest_email,
      p_guest_name: guest_name,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, id: Array.isArray(data) ? data[0] : data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed. Use POST." }, { status: 405 });
}
