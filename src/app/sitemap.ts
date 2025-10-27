import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const items: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];

  if (!url || !key) return items;

  try {
    const supabase = createClient(url, key);
    const { data } = await supabase
      .from("listings")
      .select("id, created_at")
      .eq("is_active", true)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(200);

    const listingUrls: MetadataRoute.Sitemap = (data ?? []).map((row: any) => ({
      url: base + "/annonce/" + row.id,
      lastModified: row.created_at ? new Date(row.created_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return items.concat(listingUrls);
  } catch {
    return items;
  }
}
