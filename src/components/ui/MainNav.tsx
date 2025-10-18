"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

const ITEMS: Item[] = [
  { href: "/",        label: "Annonces" },
  { href: "/carte",   label: "Carte" },
  { href: "/contact", label: "Contact" },
  { href: "/host",    label: "Espace Hôte" },
  { href: "/admin",   label: "Admin" },
];

export default function MainNav() {
  // Sécurise la valeur pour TypeScript (jamais null après ce point)
  const pathname = usePathname() ?? "";

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm">
      {ITEMS.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={[
              "inline-flex items-center rounded-full px-3 py-1.5 border",
              active
                ? "bg-brand-50 border-brand-200 text-brand-800"
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
            ].join(" ")}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
