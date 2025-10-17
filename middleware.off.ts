import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient(
    { req, res },
    {
      supabaseUrl: process.env.SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_ANON_KEY!,
    }
  )

  const url = req.nextUrl

  if (url.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    const { data: profile, error } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (error || profile?.role !== 'admin') {
      url.pathname = '/403'
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = { matcher: ['/admin/:path*'] }
