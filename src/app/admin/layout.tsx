import GuardAdmin from "@/components/auth/GuardAdmin";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <GuardAdmin>{children}</GuardAdmin>;
}
