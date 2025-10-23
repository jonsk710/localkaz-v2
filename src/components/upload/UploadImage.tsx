"use client";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Props = {
  onUploaded: (publicUrl: string) => void;
  label?: string;
  maxSizePx?: number;   // défaut 1600
  quality?: number;     // 0..1 défaut 0.85
};

function extFromMime(mime: string) {
  if (mime.includes("webp")) return "webp";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("png")) return "png";
  return "webp";
}

async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<{ blob: Blob; mime: string }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = url;
  });

  const w = img.width, h = img.height;
  if (!w || !h) throw new Error("Image invalide");

  let nw = w, nh = h;
  if (w > h && w > maxSize) { nw = maxSize; nh = Math.round((maxSize / w) * h); }
  else if (h >= w && h > maxSize) { nh = maxSize; nw = Math.round((maxSize / h) * w); }

  const canvas = document.createElement("canvas");
  canvas.width = nw; canvas.height = nh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(img, 0, 0, nw, nh);

  const targetMime = "image/webp";
  const blob: Blob = await new Promise((resolve) => canvas.toBlob(b => resolve(b as Blob), targetMime, quality));
  if (!blob) throw new Error("Échec conversion image");
  return { blob, mime: targetMime };
}

export default function UploadImage({ onUploaded, label = "Téléverser une image", maxSizePx = 1600, quality = 0.85 }: Props) {
  const url  = (process.env.NEXT_PUBLIC_SUPABASE_URL as string) || "";
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) || "";
  const supa = useMemo(() => createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } }), [url, anon]);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr(null);
    if (!file.type.startsWith("image/")) { setErr("Fichier non image"); return; }
    if (file.size > 15 * 1024 * 1024) { setErr("Fichier trop lourd (max 15 Mo)"); return; }

    setBusy(true);
    try {
      const { data: { user }, error: uerr } = await supa.auth.getUser();
      if (uerr) throw new Error(uerr.message);
      if (!user) throw new Error("Connexion requise");

      const resized = await resizeImage(file, maxSizePx, quality);
      const ext = extFromMime(resized.mime);
      const filename = crypto.randomUUID() + "." + ext;
      const path = `hosts/${user.id}/temp/${filename}`;

      const { error } = await supa.storage.from("listings")
        .upload(path, resized.blob, {
          cacheControl: "3600",
          contentType: resized.mime,
          upsert: false,
        });
      if (error) throw new Error(error.message);

      const { data } = supa.storage.from("listings").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      onUploaded(publicUrl);
    } catch (e:any) {
      setErr(e.message || String(e));
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  }

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*" onChange={pick}
               disabled={busy}
               className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-gray-200 file:bg-white file:text-sm hover:file:bg-gray-50" />
        {busy && <span className="text-sm text-gray-600">Traitement…</span>}
      </div>
      {err && <p className="text-red-700 text-sm mt-1">❌ {err}</p>}
      <p className="text-xs text-gray-500 mt-1">Redimensionnement automatique (≤ {maxSizePx}px), WebP, qualité {Math.round((quality||0)*100)}%.</p>
    </div>
  );
}
