"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/espace-hote", label: "Tableau de bord" },
  { href: "/espace-hote/messages", label: "Messages" },
];

export default function HostNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 mb-4">
      {items.map((it) => {
        const active = pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`px-3 py-2 rounded-lg border text-sm transition
              ${active ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-200 hover:bg-gray-50"}`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
