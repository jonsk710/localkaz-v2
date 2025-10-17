import HostOnly from '@/components/HostOnly';
import Link from 'next/link';

export default function EspaceHoteHome() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Espace hôte</h1>
      <HostOnly>
        <div className="space-x-3">
          <Link href="/espace-hote/nouvelle" className="rounded bg-black text-white px-4 py-2">Créer une annonce</Link>
          <Link href="/espace-hote/annonces" className="rounded border px-4 py-2">Mes annonces</Link>
        </div>
      </HostOnly>
    </main>
  );
}
