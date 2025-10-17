import type { ReactNode } from "react";
import AuthHeader from "@/components/common/AuthHeader";

export const metadata = {
  title: "LocalKaz",
  description: "Locations locales en Guadeloupe",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "ui-sans-serif, system-ui, Arial, sans-serif" }}>
        <AuthHeader />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
