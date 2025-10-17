import AdminTable from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Dashboard Admin — Annonces
      </h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Gestion des annonces (approbation, statut, etc.) — <a href="/login">Se connecter</a>
      </p>
      <AdminTable />
    </main>
  );
}
