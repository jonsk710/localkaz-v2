'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ReserveAction({ title, commune, price }:{
  title: string; commune?: string; price?: number;
}) {
  const [loading, setLoading] = useState(false);
  async function reserve() {
    try {
      setLoading(true);
      const res = await fetch("/api/reserver", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ title, commune, price })
      });
      const json = await res.json();
      if (json.ok) {
        alert("Demande envoyee");
      } else {
        alert("Erreur: " + (json.error || "inconnue"));
      }
    } catch {
      alert("Erreur reseau");
    } finally {
      setLoading(false);
    }
  }
  return <Button onClick={reserve} disabled={loading}>{loading ? "Envoi…" : "Reserver"}</Button>;
}
