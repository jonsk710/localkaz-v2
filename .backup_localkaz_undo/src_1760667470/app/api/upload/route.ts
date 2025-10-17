import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const isAdmin =
    cookies().get("admin")?.value === "1" ||
    (await req.headers.get("x-admin-secret")) === process.env.ADMIN_PASSWORD;

  if (!isAdmin) return NextResponse.json({ ok:false, error:"Unauthorized" }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ok:false, error:"Supabase non configuré" }, { status: 500 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  if (!file) return NextResponse.json({ ok:false, error:"file manquant" }, { status: 400 });

  const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "photos";
  const storageAdmin = supabaseAdmin.storage;

  // 1) Vérifier/Créer le bucket s'il n'existe pas
  const { data: buckets, error: listErr } = await storageAdmin.listBuckets();
  if (listErr) return NextResponse.json({ ok:false, error: listErr.message }, { status: 500 });

  let isPublic = true;
  const exists = buckets?.some(b => {
    if (b.name === BUCKET) { isPublic = !!(b as any).public; }
    return b.name === BUCKET;
  });

  if (!exists) {
    const { error: createErr } = await storageAdmin.createBucket(BUCKET, { public: true });
    if (createErr) return NextResponse.json({ ok:false, error: createErr.message }, { status: 500 });
    isPublic = true;
  }

  // 2) Upload du fichier
  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const safeName = file.name.replace(/\s+/g, "_");
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;

  const { error: upErr } = await storageAdmin.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (upErr) return NextResponse.json({ ok:false, error: upErr.message }, { status: 500 });

  // 3) URL finale (publique si bucket public, sinon URL signée 1 an)
  const storage = storageAdmin.from(BUCKET);
  let finalUrl: string | undefined;
  const pub = storage.getPublicUrl(path).data.publicUrl;
  if (isPublic && pub) {
    finalUrl = pub;
  } else {
    const sign = await storage.createSignedUrl(path, 60 * 60 * 24 * 365);
    if (sign.error) return NextResponse.json({ ok:false, error: sign.error.message }, { status: 500 });
    finalUrl = sign.data.signedUrl;
  }

  return NextResponse.json({ ok:true, url: finalUrl, path, bucket: BUCKET });
}
