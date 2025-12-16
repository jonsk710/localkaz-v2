"use client";

import Link from "next/link";

export default function HostDashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        Espace Hôte — Tableau de bord
      </h1>
      <p className="mb-6 text-sm text-slate-600">
        Bienvenue dans ton espace hôte. Utilise les raccourcis ci-dessous pour
        gérer tes annonces et tes messages.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Mes annonces
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Consulte et modifie les annonces déjà créées.
          </p>
          <Link
            href="/espace-hote/annonces"
            className="inline-flex rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
          >
            Voir mes annonces
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Nouvelle annonce
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Crée une nouvelle annonce avec localisation sur la carte.
          </p>
          <Link
            href="/espace-hote/nouvelle-annonce"
            className="inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Créer une annonce
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Messages
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Réponds aux visiteurs qui t&apos;ont contacté depuis une annonce.
          </p>
          <Link
            href="/espace-hote/messages"
            className="inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Ouvrir les messages
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">
            Rappels
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Pense à garder ton calendrier à jour pour éviter les demandes en
            doublon.
          </p>
          <Link
            href="/espace-hote/annonces"
            className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200"
          >
            Gérer mes disponibilités
          </Link>
        </div>
      </div>
    </div>
  );
}
