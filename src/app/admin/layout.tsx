import Link from "next/link";
import { headers } from "next/headers";

function AdminTopNav() {
  // On affiche la barre Admin quel que soit l'état ; les pages sont protégées côté API.
  return (
    <div className="border-b bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="font-semibold">Admin</Link>
          <Link href="/admin/annonces" className="hover:underline">Annonces</Link>
          <Link href="/admin/communes" className="hover:underline">Communes</Link>
          <Link href="/admin/contenu" className="hover:underline">Contenu</Link>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="text-sm border rounded px-2 py-1">Se déconnecter</button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // headers() dispo si tu veux ajouter des banners selon cookie, mais pas nécessaire ici
  headers();
  return (
    <section>
      <AdminTopNav />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </div>
    </section>
  );
}
