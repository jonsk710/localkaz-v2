import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Ici, on peut un jour forcer l'accès admin sur /admin, mais
// pour l'instant on laisse passer et on contrôle côté API (ensureAdmin()).
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Si tu veux protéger des chemins statiquement :
// export const config = { matcher: ["/admin/:path*"] };
