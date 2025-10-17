import Tabs from "@/components/ui/Tabs";
import HostDashboard from "@/components/host/HostDashboard";

export default function HostPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Espace Hôte</h1>
        <p className="text-gray-600">Créez et gérez vos annonces.</p>
      </div>

      <Tabs items={[
        { href: "/host", label: "Hôte" },
        { href: "/admin", label: "Admin" },
      ]} />

      <div className="card p-4">
        <HostDashboard />
      </div>
    </section>
  );
}
