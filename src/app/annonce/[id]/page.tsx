import { notFound } from "next/navigation";
import { getSupabaseServerPublic } from "@/lib/supabase/server-public";
import dynamic from "next/dynamic";
const ChatStartForm = dynamic(() => import("@/components/chat/ChatStartForm"), { ssr: false });

type Props = { params: { id: string } };
export const revalidate = 0;

export default async function AnnoncePage({ params }: Props) {
  const id = params.id;
  const supa = getSupabaseServerPublic();

  const { data, error } = await supa
    .from("listings")
    .select(`
      id, title, description, price, currency, image_url, created_at,
      is_active, is_approved, contact_email
    `)
    .eq("id", id)
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.is_active || !data.is_approved) notFound();

  const email = data.contact_email || "—";

  return (
    <section className="space-y-4">
      <a href="/" className="text-sm underline text-gray-600">← Retour aux annonces</a>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{data.title}</h1>
        <div className="text-gray-600 text-sm">Publiée le {new Date(data.created_at).toLocaleDateString()}</div>
      </header>

      {data.image_url && (
        <img
          src={data.image_url}
          alt={data.title}
          className="w-full max-h-[420px] object-cover rounded-xl border border-gray-200"
        />
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 space-y-3">
          <div className="text-lg">
            {data.price != null ? <b>{data.price} {data.currency ?? "EUR"}</b> : "Prix sur demande"}
          </div>

          <div className="prose prose-sm max-w-none">
            {data.description ? (
              <p style={{ whiteSpace: "pre-wrap" }}>{data.description}</p>
            ) : (
              <p className="text-gray-600">Pas de description.</p>
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Contact direct (info) : {email}</div>
            <ChatStartForm listingId={data.id} defaultEmail="" />
          </div>
        </aside>
      </div>
    </section>
  );
}
