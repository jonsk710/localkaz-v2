import "leaflet/dist/leaflet.css";
import "./globals.css";
import MainNav from "@/components/ui/MainNav";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const HeaderAuth = dynamic(() => import("@/components/auth/HeaderAuth"), { ssr: false });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  title: "LocalKaz — Locations locales en Guadeloupe",
  description: "Trouvez ou publiez facilement des locations locales en Guadeloupe avec LocalKaz.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white shadow-sm sticky top-0 z-50">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
            <a href="/" className="font-extrabold text-lg text-gray-900 no-underline">
              LocalKaz
            </a>
            <div className="flex items-center gap-4">
              <MainNav />
              <HeaderAuth />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
