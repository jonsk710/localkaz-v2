"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type TabItem = { href: string; label: string };

export default function Tabs({ items }: { items: TabItem[] }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {items.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`tab ${active ? "tab-active" : "text-gray-700 hover:bg-gray-100"}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
