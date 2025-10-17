import "./globals.css";
import type { ReactNode } from "react";
import MainNav from "@/components/ui/MainNav";

export const metadata = {
  title: "LocalKaz",
  description: "Locations locales en Guadeloupe",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-gray-50">
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-extrabold text-lg text-gray-900 no-underline">LocalKaz</a>
            <MainNav />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
