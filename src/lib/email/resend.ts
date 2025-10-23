let resend: any = null;

// ✅ On n'active l'envoi QUE si une clé est présente
const HAS_KEY = !!process.env.RESEND_API_KEY;

try {
  if (HAS_KEY) {
    // charge "resend" uniquement si nécessaire
    // (évite les erreurs en dev sans clé)
    const { Resend } = require("resend");
    resend = new Resend(process.env.RESEND_API_KEY);
  }
} catch {
  // ignore require errors en dev
}

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  const from = params.from || process.env.EMAIL_FROM || "LocalKaz <noreply@example.com>";

  // 📴 Pas de clé → on ne fait rien et on log en dev
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email] SKIPPED (no RESEND_API_KEY):", { to: params.to, subject: params.subject });
    }
    return { ok: true, skipped: true };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e: any) {
    console.error("sendEmail error:", e?.message || e);
    return { ok: false, error: e?.message || String(e) };
  }
}

export function url(path: string) {
  const base = process.env.SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + path;
}
