import { NextResponse } from 'next/server'
export async function POST() {
  // Ancien "code admin" neutralisé : on ne fait rien
  return NextResponse.json({ ok: true })
}
