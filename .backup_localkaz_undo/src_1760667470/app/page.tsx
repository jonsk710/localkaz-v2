import AnnoncesExplorer from '../components/AnnoncesExplorer';

type Annonce = {
  id: string;
  title: string;
  price: number;
  commune: string;
  photos?: string[];
  tags?: string[];
};

// Page dynamique côté serveur (évite la pré-génération statique qui casserait le fetch)
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let annonces: Annonce[] = [];

  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL;
    const url = base ? `${base}/api/annonces` : `/api/annonces`;
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      annonces = Array.isArray(json?.data) ? json.data : [];
    }
  } catch {
    // on garde une liste vide si l'API tombe
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Dernières annonces</h1>
      <AnnoncesExplorer annonces={annonces} />
    </main>
  );
}
