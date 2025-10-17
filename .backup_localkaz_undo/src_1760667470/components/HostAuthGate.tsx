import { cookies } from "next/headers";
import Link from "next/link";

export default function HostAuthGate({ children }: { children: React.ReactNode }) {
  const has = cookies().has("admin_session");
  if (!has) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
        Non autorisé — <Link className="underline" href="/admin/login">connecte-toi à /admin/login</Link>
      </p>
    );
  }
  return <>{children}</>;
}
