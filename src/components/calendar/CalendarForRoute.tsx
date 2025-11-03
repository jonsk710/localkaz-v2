"use client";
import { useParams } from "next/navigation";
import ReadOnlyCalendar from "@/components/calendar/ReadOnlyCalendar";

export default function CalendarForRoute() {
  const p = useParams() as any;
  // Les dossiers dynamiques s'appellent [id], donc p.id doit exister
  const id = p?.id ? String(p.id) : "";
  if (!id) return null;
  return <ReadOnlyCalendar listingId={id} />;
}
