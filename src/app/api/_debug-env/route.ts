import { NextResponse } from "next/server";
export async function GET() {
  const mask = (s?:string|null)=> s ? `${s.slice(0,12)}… (len:${s.length})` : 'MISSING';
  return NextResponse.json({
    url: mask(process.env.NEXT_PUBLIC_SUPABASE_URL||null),
    anon: mask(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||null),
    service: mask(process.env.SUPABASE_SERVICE_ROLE||null),
    bucket: process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'photos'
  });
}
