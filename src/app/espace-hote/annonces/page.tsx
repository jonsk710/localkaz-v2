import HostOnly from "../../../components/HostOnly";
import HostListings from "./_HostListings";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <HostOnly>
        <HostListings />
      </HostOnly>
    </main>
  );
}
