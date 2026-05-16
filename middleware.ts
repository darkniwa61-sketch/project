// middleware.ts (project root)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { ratelimit } from '@/lib/ratelimit'

export async function middleware(req: NextRequest) {
  // ── RATE LIMITING ──────────────────────────────────────
  // Identify user by IP or User ID (if session exists)
  // Note: We'll check session later, so for now we use IP as a primary identifier 
  // or a placeholder if we want to be more specific.
  // To be most efficient, we can check session FIRST, then rate limit.
  
  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1'
  
  // Create a base response so we can modify it
  let res = NextResponse.next()

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

  // Use session ID for logged-in users, otherwise fallback to IP
  const identifier = session?.user?.id || ip
  // ── RATE LIMITING ──────────────────────────────────────
  // Only apply rate limiting if Upstash env vars are configured
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { success, limit, remaining, reset } = await ratelimit.limit(identifier)
      res.headers.set('X-RateLimit-Limit', limit.toString())
      res.headers.set('X-RateLimit-Remaining', remaining.toString())
      res.headers.set('X-RateLimit-Reset', reset.toString())

      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: res.headers,
        })
      }
    } catch (err) {
      console.error('[Middleware] Ratelimit failed, continuing without it:', err)
    }
  }

  // ── SESSION & ONBOARDING LOGIC ─────────────────────────
  const isPublicRoute = 
    req.nextUrl.pathname === '/login' || 
    req.nextUrl.pathname === '/register' ||
    req.nextUrl.pathname === '/forgot-password' ||
    req.nextUrl.pathname === '/reset-password'

  const isApiRoute = req.nextUrl.pathname.startsWith('/api/')

  // Not logged in → Auth handling
  if (!session) {
    if (isPublicRoute) {
      return res // Allow public routes
    }
    
    if (isApiRoute) {
      return new NextResponse('Unauthorized', { status: 401, headers: res.headers })
    }

    // Redirect to login for everything else (dashboard, onboarding)
    const loginRes = NextResponse.redirect(new URL('/login', req.url))
    res.headers.forEach((value, key) => loginRes.headers.set(key, value))
    return loginRes
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/onboarding', 
    '/login', 
    '/register', 
    '/api/:path*',
    '/forgot-password',
    '/reset-password'
  ],
}