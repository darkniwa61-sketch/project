// middleware.ts (project root)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Not logged in → redirect to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Decode JWT and check for org_id claim
  const payload = JSON.parse(
    Buffer.from(session.access_token.split('.')[1], 'base64').toString()
  )

  // Logged in but no org yet → redirect to onboarding
  if (!payload?.org_id && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding'],
}