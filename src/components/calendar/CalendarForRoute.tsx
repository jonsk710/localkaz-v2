"use client";
import { useParams } from "next/navigation";
import ReadOnlyCalendar from "./ReadOnlyCalendar"; // import relatif

export default function CalendarForRoute() {
  const p = useParams() as any;
  const id = p?.id ? String(p.id) : "";
  if (!id) {
    return (
      <section className="mt-6 rounded-2xl border p-4 bg-yellow-50">
        <div className="font-semibold">⚠️ ID d’annonce introuvable dans l’URL.</div>
      </section>
    );
  }
  return <ReadOnlyCalendar listingId={id} showTitle={true} compact={true} />;
}
