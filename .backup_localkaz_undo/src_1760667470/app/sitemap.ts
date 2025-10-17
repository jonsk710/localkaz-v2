import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/carte`, lastModified: new Date() },
  ];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anon) {
    try {
      const s = createClient(url, anon);
      const { data } = await s
        .from("annonces")
        .select("id, slug, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(2000);

      const rows = Array.isArray(data) ? data : [];
      for (const a of rows) {
        const path = a.slug ? `/a/${a.slug}` : `/annonce/${a.id}`;
        const lm = a.created_at ? new Date(a.created_at) : new Date();
        urls.push({ url: `${base}${path}`, lastModified: lm });
      }
    } catch {}
  }

  return urls;
}
