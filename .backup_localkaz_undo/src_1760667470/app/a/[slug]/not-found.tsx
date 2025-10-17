export default function NotFoundSlug() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Annonce introuvable</h1>
      <p className="text-gray-600">Cette annonce n’existe pas ou n’est pas publiée.</p>
      <a href="/" className="inline-block px-4 py-2 rounded-2xl bg-amber-500 text-white">Retour à l’accueil</a>
    </main>
  );
}
