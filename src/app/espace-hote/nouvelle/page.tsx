import GuardHost from "@/components/auth/GuardHost";
import HostOnly from '@/components/HostOnly';
import NewListingClient from './_NewListingClient';

export default function NouvelleAnnoncePage() {
  return (
    <GuardHost><main className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Créer une annonce</h1>
      <HostOnly>
        <NewListingClient />
      </HostOnly>
    </main></GuardHost>
  );
}
