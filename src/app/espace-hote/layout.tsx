"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GuardHost from "@/components/auth/GuardHost";

const TABS = [
  { href: "/espace-hote", label: "Tableau de bord", exact: true },
  { href: "/espace-hote/annonces", label: "Mes annonces" },
  { href: "/espace-hote/nouvelle-annonce", label: "Nouvelle annonce" },
  { href: "/espace-hote/messages", label: "Messages" },
];

export default function HostLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <GuardHost>
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full border px-3 py-1 text-sm ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-800 hover:bg-slate-50 border-slate-200"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </GuardHost>
  );
}
