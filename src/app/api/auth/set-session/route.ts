import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json()
    if (!access_token || !refresh_token) {
      return NextResponse.json({ ok: false, error: 'missing tokens' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl: process.env.SUPABASE_URL!,
        supabaseKey: process.env.SUPABASE_ANON_KEY!,
      }
    )

    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'unknown' }, { status: 500 })
  }
}
