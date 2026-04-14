// lib/auth/onboarding.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export interface OnboardingParams {
  userId:    string
  orgName:   string
  fullName?: string
}

export interface OnboardingResult {
  organization_id: string
}

export async function completeOnboarding(
  params: OnboardingParams
): Promise<OnboardingResult> {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.rpc('handle_new_organization', {
    p_user_id:   params.userId,
    p_org_name:  params.orgName,
    p_full_name: params.fullName ?? undefined,
  })

  if (error) {
    console.error('[onboarding] RPC failed:', error.message)
    throw new Error(error.message)
  }

  // Force token refresh so org_id is in the JWT immediately
  const { error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) {
    console.warn('[onboarding] Session refresh failed:', refreshError.message)
  }

  return data as unknown as OnboardingResult
}