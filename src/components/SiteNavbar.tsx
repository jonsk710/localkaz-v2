'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/carte", label: "Carte" },
  { href: "/decouvrir", label: "Découvrir" },
  { href: "/contact", label: "Contact" },
  { href: "/aide", label: "Aide" },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-white/60">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-amber-600">LocalKaz</Link>
        <nav className="flex gap-4 text-sm">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-2 py-1 rounded-lg ${pathname===l.href ? "bg-amber-100 text-amber-800" : "hover:bg-white/60"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href='/espace-hote' className="text-sm px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-white/60">Espace hôte</Link>
        </div>
      </div>
    </header>
  );
}
