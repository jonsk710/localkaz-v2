import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";
import { sendEmail, url } from "@/lib/email/resend";

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(req: Request) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide (JSON attendu)" }, { status: 400 }); }

    const { conversation_id, content } = body || {};
    const msg = String(content || "").trim();
    if (!conversation_id || msg.length < 1) {
      return NextResponse.json({ error: "Champs invalides" }, { status: 400 });
    }

    const supa = getSupabaseServerPublic();

    // Auth serveur
    const { data: u } = await supa.auth.getUser();
    const user = u?.user;
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Vérifier ownership + infos conv
    const { data: conv, error: cerr } = await supa
      .from("conversations")
      .select("id, host_id, listing_id, guest_email, public_token")
      .eq("id", conversation_id)
      .maybeSingle();
    if (cerr) return NextResponse.json({ error: cerr.message }, { status: 400 });
    if (!conv || conv.host_id !== user.id) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    // 🔒 Rate-limit côté hôte: 60 / 10 min / conversation / IP
    const ip = getClientIp(req);
    const bucket = `host:${user.id}:${conversation_id}:${ip}`;
    const { data: okRL, error: rlErr } = await supa.rpc("rl_check_and_hit", {
      p_bucket: bucket, p_limit: 60, p_window_seconds: 600
    });
    if (rlErr) return NextResponse.json({ error: rlErr.message }, { status: 400 });
    if (!okRL) return NextResponse.json({ error: "Trop de messages. Réessayez plus tard." }, { status: 429 });

    // Insert message
    const { error: merr } = await supa.from("messages").insert({
      conversation_id,
      sender_role: "host",
      sender_id: user.id,
      content: msg,
    });
    if (merr) return NextResponse.json({ error: merr.message }, { status: 400 });

    // Email invité (best-effort)
    if (conv.guest_email && conv.public_token) {
      const { data: listing } = await supa.from("listings").select("title").eq("id", conv.listing_id).maybeSingle();
      const title = listing?.title || "Annonce";
      const chatUrl = url(`/chat/${conv.public_token}`);
      await sendEmail({
        to: conv.guest_email,
        subject: `Nouvelle réponse de l’hôte — “${title}”`,
        text: `L’hôte a répondu.\nVoir la conversation : ${chatUrl}\n\n${msg}`,
        html: `<p>L’hôte a répondu concernant « <b>${title}</b> ».</p><p><a href="${chatUrl}">Voir la conversation</a></p><pre>${msg}</pre>`
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed. Use POST." }, { status: 405 });
}
