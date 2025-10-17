import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, ArrowLeft, Star } from "lucide-react";
import ReserveAction from "@/components/ReserveAction";
import { supabaseAdmin } from "@/lib/supabaseServer";

type Stay = { id:string; title:string; commune:string; scoreTags:string[]; perks:string[]; price:number };

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let s: Stay | null = null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("listings").select("*").eq("id", params.id).maybeSingle();
    if (data) s = { id:data.id, title:data.title, commune:data.commune||"", scoreTags:data.score_tags||[], perks:data.perks||[], price:Number(data.price||0) };
  }
  return { title: s ? `${s.title} — ${s.commune} | LocalKaz` : "Logement introuvable — LocalKaz" };
}

export default async function StayPage({ params }: { params: { id: string } }) {
  let stay: Stay | null = null;
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("listings").select("*").eq("id", params.id).maybeSingle();
    if (data) stay = { id:data.id, title:data.title, commune:data.commune||"", scoreTags:data.score_tags||[], perks:data.perks||[], price:Number(data.price||0) };
  }
  if (!stay) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-amber-50 text-slate-800">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-white/60">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Home className="w-5 h-5 text-amber-500" />
            LocalKaz
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Link href="/"><Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button></Link>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-56 w-full rounded-3xl bg-gradient-to-br from-blue-200 to-yellow-100 shadow" />
            <Card className="p-0 overflow-hidden rounded-3xl shadow">
              <CardContent className="p-6 space-y-3">
                <h1 className="text-2xl font-extrabold">{stay.title}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" /> {stay.commune}
                </div>
                <div className="flex flex-wrap gap-2">
                  {stay.perks.map(p => (
                    <span key={p} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{p}</span>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stay.price}€</div>
                    <div className="text-xs text-gray-500">par nuit</div>
                  </div>
                  <ReserveAction title={stay.title} commune={stay.commune} price={stay.price}/>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {stay.scoreTags.map(t => (
                  <span key={t} className="text-xs bg-white rounded-full shadow px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3" /> {t}
                  </span>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
