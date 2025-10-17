import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Gallery from "@/components/Gallery";

type A = {
  id: string; slug: string; title: string; commune: string | null; price: number;
  description: string | null; tags: string[] | null; photos: string[] | null; host_name: string | null; is_published: boolean;
};

async function fetchAnnonce(slug: string): Promise<A | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const s = createClient(url, anon);
  const { data } = await s
    .from("annonces")
    .select("id,slug,title,commune,price,description,tags,photos,host_name,is_published")
    .eq("slug", slug)
    .maybeSingle();
  const a = (data as any) || null;
  if (!a || a.is_published !== true) return null;
  return a;
}

export default async function Page({ params }: { params: { slug: string } }) {
  const a = await fetchAnnonce(params.slug);
  if (!a) notFound();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <a href="/" className="text-sm underline text-gray-600">← Retour</a>
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3"><Gallery photos={(a.photos as any) || []} alt={a.title} /></div>
        <aside className="md:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold">{a.title}</h1>
          <div className="text-gray-600">{a.commune ?? "Guadeloupe"}</div>
          <div className="text-xl font-semibold">{a.price} € / nuit</div>
          {Array.isArray(a.tags) && a.tags.length>0 && (
            <div className="flex flex-wrap gap-2">{a.tags.map(t => <span key={t} className="px-2 py-1 rounded-full bg-gray-100 text-sm">{t}</span>)}</div>
          )}
          {a.host_name && <div className="text-sm text-gray-600">Hôte : <span className="font-medium">{a.host_name}</span></div>}
        </aside>
      </div>
      {a.description && (
        <section className="bg-white border rounded-2xl p-4">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{a.description}</p>
        </section>
      )}
    </main>
  );
}
