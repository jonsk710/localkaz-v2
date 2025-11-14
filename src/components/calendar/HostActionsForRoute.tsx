"use client";
import { useParams } from "next/navigation";
import HostCalendarActions from "./HostCalendarActions";

export default function HostActionsForRoute() {
  const p = useParams() as any;
  const id = p?.id ? String(p.id) : "";
  if (!id) return null;
  return <HostCalendarActions listingId={id} />;
}
