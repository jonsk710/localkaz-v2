"use client";
import Link from "next/link";

export default function LoginChoicePage() {
  return (
    <section className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Se connecter</h1>
      <p className="text-gray-600">Choisissez votre type d’accès :</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/espace-hote/login"
          className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 p-4 no-underline text-center"
        >
          <div className="text-lg font-semibold">Espace Hôte</div>
          <div className="text-sm text-gray-600">Publier et gérer mes annonces</div>
        </Link>
        <Link
          href="/admin/login"
          className="rounded-xl border border-gray-200 bg-white hover:bg-gray-50 p-4 no-underline text-center"
        >
          <div className="text-lg font-semibold">Admin</div>
          <div className="text-sm text-gray-600">Gestion et modération</div>
        </Link>
      </div>
    </section>
  );
}
