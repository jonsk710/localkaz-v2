import Link from "next/link";
import { cookies } from "next/headers";

export default function TopNav() {
  const isAdmin = cookies().get("admin")?.value === "1";

  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <nav className="max-w-6xl mx-auto h-14 px-4 flex items-center gap-6">
        <Link href="/" className="font-semibold">Localkaz</Link>
        <Link href="/annonces">Annonces</Link>
        <Link href="/carte">Carte</Link>
        <Link href="/contact">Contact</Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/espace-hote" className="font-medium">Espace hôte</Link>
          {isAdmin && <Link href="/admin" className="font-medium">Admin</Link>}
        </div>
      </nav>
    </header>
  );
}
