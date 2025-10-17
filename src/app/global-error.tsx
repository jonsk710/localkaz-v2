'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error(error);
  return (
    <html>
      <body>
        <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
          <p className="text-gray-600">Desole, une erreur s’est produite.</p>
          <button onClick={() => reset()} className="inline-block px-4 py-2 rounded-2xl bg-amber-500 text-white">
            Reessayer
          </button>
          <a href="/" className="ml-2 inline-block px-4 py-2 rounded-2xl border">Retour a l’accueil</a>
        </main>
      </body>
    </html>
  );
}
