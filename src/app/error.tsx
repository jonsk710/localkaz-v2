'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-2xl shadow border border-slate-200">
      <h2 className="text-xl font-bold mb-2">Erreur</h2>
      <p className="text-slate-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
