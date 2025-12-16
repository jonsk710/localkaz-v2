export const revalidate = 0;
import dynamic from "next/dynamic";
const OldAdminDashboard = dynamic(() => import("@/components/admin/AdminTable"), { ssr: false });
export default function AdminPage(){
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <OldAdminDashboard />
    </main>
  );
}
