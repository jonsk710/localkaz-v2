import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold">Localkaz</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/annonces" className="hover:underline">Annonces</Link>
          <Link href="/carte" className="hover:underline">Carte</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <span className="w-px h-4 bg-gray-300 inline-block" />
          <Link href="/espace-hote" className="hover:underline">Espace hôte</Link>
          <Link href="/admin" className="hover:underline font-medium">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
