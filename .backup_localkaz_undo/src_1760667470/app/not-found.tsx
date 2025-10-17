export default function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-gray-600">Desole, la page demandee n’existe pas.</p>
      <a href="/" className="inline-block px-4 py-2 rounded-2xl bg-amber-500 text-white">Retour a l’accueil</a>
    </main>
  );
}
