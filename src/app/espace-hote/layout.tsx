import type { ReactNode } from "react";

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-4">
      <nav className="flex gap-2 text-sm">
        <a href="/espace-hote" className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">Tableau de bord</a>
        <a href="/espace-hote/annonces" className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">Mes annonces</a>
        <a href="/espace-hote/nouvelle" className="px-3 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50">Nouvelle annonce</a>
        <a href="/espace-hote/messages" className="px-3 py-1 rounded border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100">Messages</a>
      </nav>
      {children}
    </section>
  );
}
