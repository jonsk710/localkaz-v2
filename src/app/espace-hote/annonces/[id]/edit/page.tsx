import GuardHost from "@/components/auth/GuardHost";
import HostActionsForRoute from "@/components/calendar/HostActionsForRoute";
import CalendarForRoute from "@/components/calendar/CalendarForRoute";
import EditListingClient from "./_EditListingClient";

export default function EditPage() {
  return (
    <GuardHost><main className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">Éditer mon annonce</h1>
      <EditListingClient />
      <CalendarForRoute />
  
  <div className="mt-8"><HostActionsForRoute /></div>
<div className="mt-8"></div>
  <div className="mt-8"></div>
</main></GuardHost>
  );
}
