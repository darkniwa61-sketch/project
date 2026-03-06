import { createClient } from '@/utils/supabase/server'

export type UserRole = 'admin' | 'staff'

export type UserProfile = {
  id: string
  email: string
  role: UserRole
  can_add_item: boolean
  can_edit_item: boolean
  can_delete_item: boolean
  created_at: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  // 1. Get current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  // 2. Fetch their role and permissions from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error("Error fetching user profile:", profileError)
    return null
  }

  return profile as UserProfile
}

export async function requireAdmin() {
    const profile = await getUserProfile()
    if (!profile || profile.role !== 'admin') {
         throw new Error('Unauthorized: Admin access required')
    }
    return profile
}
