import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function POST(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
        remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }) },
      },
    }
  )

  const { email, role } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('create_org_invite', {
    p_invited_email: email,
    p_role:          role ?? 'member',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const result = data as any

  // Build the full invite URL
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${result?.token}`

  return NextResponse.json({ inviteUrl, expiresAt: result?.expires_at })
}
