import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Server-side: reads org_id and org_role directly from the JWT.
 * Use this in Server Components and Route Handlers.
 * No extra DB query needed.
 */
export async function getServerOrgContext() {
  const supabase = createServerComponentClient<Database>({ cookies })

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
