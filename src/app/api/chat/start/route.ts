import { NextResponse } from "next/server";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";
import { sendEmail, url } from "@/lib/email/resend";

function isUUID(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
}
function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

export async function POST(req: Request) {
  try {
    let body: any = null;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Requête invalide (JSON attendu)" }, { status: 400 }); }

    const { listing_id, guest_email, guest_name, message } = body || {};
    const msg = String(message ?? "").trim();
    if (!listing_id || msg.length < 3) return NextResponse.json({ error: "Champs invalides" }, { status: 400 });

    const supa = getSupabaseServerPublic();

    // 🔒 Rate-limit par IP+listing: 5 requêtes / 10 min
    const ip = getClientIp(req);
    const bucket = `start:${ip}:${listing_id}`;
    const { data: okStart, error: rlErr } = await supa.rpc("rl_check_and_hit", { p_bucket: bucket, p_limit: 5, p_window_seconds: 600 });
    if (rlErr) return NextResponse.json({ error: rlErr.message }, { status: 400 });
    if (!okStart) return NextResponse.json({ error: "Trop de demandes, réessayez plus tard." }, { status: 429 });

    // Upsert conversation + 1er message
    const { data, error } = await supa.rpc("upsert_conversation_guest", {
      p_listing_id: listing_id,
      p_guest_email: guest_email || null,
      p_guest_name: guest_name || null,
      p_first_message: msg,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const row: any = Array.isArray(data) ? data[0] : data;
    const token: string | undefined = row?.public_token ?? row?.publicToken ?? row?.token;
    const conversation_id: string | undefined = row?.conversation_id ?? row?.conversationId ?? row?.conversation;
    if (!isUUID(token)) return NextResponse.json({ error: "Token RPC invalide (attendu UUID)" }, { status: 500 });

    // Emails best-effort (no-op si pas de clé)
    const { data: listing } = await supa.from("listings").select("title, contact_email").eq("id", listing_id).maybeSingle();
    const title = listing?.title || "Annonce";
    const hostEmail = listing?.contact_email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
    const chatUrl = url(`/chat/${token}`);
    if (hostEmail) {
      await sendEmail({
        to: hostEmail,
        subject: `💬 Nouveau message — “${title}”`,
        text: `Nouvelle demande pour "${title}". Lien visiteur: ${chatUrl}\n\nMessage:\n${msg}`,
        html: `<p>Nouvelle demande pour « <b>${title}</b> ».</p><p><a href="${chatUrl}">${chatUrl}</a></p><pre>${msg}</pre>`,
      });
    }
    if (guest_email) {
      await sendEmail({
        to: guest_email,
        subject: `Votre message a été envoyé — “${title}”`,
        text: `Merci ! Suivre la conversation : ${chatUrl}`,
        html: `<p>Merci !</p><p><a href="${chatUrl}">Suivre la conversation</a></p>`,
      });
    }

    return NextResponse.json({ ok: true, token, conversation_id });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: false, error: "Method not allowed. Use POST." }, { status: 405 });
}
