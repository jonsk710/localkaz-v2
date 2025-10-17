import Tabs from "@/components/ui/Tabs";
export default function ContenuAdmin() {
  return (
    <section className="space-y-4">
      <Tabs items={[
        { href: "/admin", label: "Admin" },
        { href: "/admin/annonces", label: "Annonces" },
        { href: "/admin/communes", label: "Communes" },
        { href: "/admin/contenu", label: "Contenu" },
      ]} />
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Contenu — à venir</h2>
        <p className="text-gray-600 text-sm">Pages statiques, SEO, médias.</p>
      </div>
    </section>
  );
}
