import Tabs from "@/components/ui/Tabs";
import AdminTable from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-gray-600">Gestion des annonces (approbation, statut, etc.).</p>
      </div>

      <Tabs items={[
        { href: "/admin", label: "Admin" },
        { href: "/host", label: "Hôte" },
      ]} />

      <div className="card p-4">
        <AdminTable />
      </div>
    </section>
  );
}
