"use client";

import dynamic from "next/dynamic";

// On charge explicitement la version avec boutons “Filtrer / Réinitialiser”
const RadiusFilter = dynamic(() => import("./RadiusFilter"), { ssr: false });

export default function SearchFilters() {
  return (
    <section className="space-y-3">
      <RadiusFilter />
    </section>
  );
}
