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

  const { code } = await request.json()

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('accept_org_invite', {
    p_code: code.trim().toUpperCase(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const result = data as any

  return NextResponse.json({
    success:         true,
    organization_id: result?.organization_id,
    role:            result?.role,
  })
}
