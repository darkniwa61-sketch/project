'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first-name') as string
  const lastName = formData.get('last-name') as string
  const mode = formData.get('mode') as string
  const location = formData.get('location') as string | null
  const inviteCode = formData.get('invite-code') as string | null

  // Validate invite code BEFORE creating the user account if joining
  let invite = null;
  if (mode === 'join' && inviteCode) {
    const { data: fetchedInvite, error: inviteError } = await adminClient
      .from('org_invites')
      .select('*')
      .eq('code', inviteCode.trim().toUpperCase())
      .single()

    if (!fetchedInvite || inviteError || fetchedInvite.accepted_at || new Date(fetchedInvite.expires_at) < new Date()) {
      const cookieStore = await cookies()
      cookieStore.set('flash_error', 'Invalid or expired invite code.', { path: '/', maxAge: 30, httpOnly: true, sameSite: 'lax' })
      return redirect('/register')
    }
    invite = fetchedInvite;
  }

  const data = {
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        location: mode === 'create' ? location : undefined,
      }
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Supabase signup error:', error.message)
    const cookieStore = await cookies()
    cookieStore.set('flash_error', error.message, { path: '/', maxAge: 30, httpOnly: true, sameSite: 'lax' })
    return redirect('/register')
  }

  // If the user signed up and we have a valid invite, manually put them into the org
  if (signUpData.user && mode === 'join' && invite) {
    // 1. Insert into user_organizations
    await adminClient.from('user_organizations').insert({
      user_id: signUpData.user.id,
      organization_id: invite.organization_id,
      role: invite.role
    })
    // 2. Mark invite as accepted
    await adminClient.from('org_invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id)
    
    // Note: The profile is created by a database trigger (handle_new_user).
    // It might take a split second. We can try to update active_org_id, 
    // but even if it fails, fallback logic in 005_stateful_switcher will 
    // automatically use their first org on next login anyway.
    try {
      await adminClient.from('profiles').update({ active_org_id: invite.organization_id }).eq('id', signUpData.user.id)
    } catch (e) {
      console.warn("Could not set active_org_id immediately:", e)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
