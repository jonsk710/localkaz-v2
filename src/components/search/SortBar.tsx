"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "recent", label: "Plus récent" },
  { value: "price_asc", label: "Prix ↑" },
  { value: "price_desc", label: "Prix ↓" },
  { value: "title_az", label: "Titre A–Z" },
] as const;

export default function SortBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const current = (sp.get("sort") || "recent") as typeof OPTIONS[number]["value"];

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(sp.toString());
    next.set("sort", e.target.value);
    router.replace(`?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
      <label className="text-sm text-gray-700">Trier par</label>
      <select
        className="px-2 py-1 rounded-lg border border-gray-200 text-sm"
        value={current}
        onChange={onChange}
        aria-label="Trier les annonces"
      >
        {OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
