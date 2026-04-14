import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

/**
 * Server-side: reads org_id and org_role directly from the JWT.
 * Use this in Server Components and Route Handlers.
 * No extra DB query needed.
 */
export async function getServerOrgContext() {
  const cookieStore = await cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  // Supabase stores the decoded JWT payload here
  const payload = session.access_token
    ? JSON.parse(atob(session.access_token.split('.')[1]))
    : null

  return {
    orgId:   payload?.org_id   as string | undefined,
    orgRole: payload?.org_role as string | undefined,
    userId:  session.user.id,
  }
}
