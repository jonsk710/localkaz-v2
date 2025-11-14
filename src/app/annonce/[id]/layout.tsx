import type { ReactNode } from "react";

export default function LayoutAnnonceId({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <div className="mt-6">
        </div>
    </div>
  );
}
