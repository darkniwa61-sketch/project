'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function resetPasswordForEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const origin = (await headers()).get('origin')

  // We can securely check if the user exists using the Supabase Admin Client
  // since this is a server action and we have the service role key.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    return redirect(`/forgot-password?error=${encodeURIComponent("Server configuration error. Please contact support.")}`)
  }

  // Create admin client
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Query users by email using the admin API
  const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (userError) {
    console.error('Error fetching users:', userError)
    return redirect(`/forgot-password?error=${encodeURIComponent("An error occurred while checking your account.")}`)
  }

  // Check if any user in the system has this email
  const userExists = users.some(u => u.email === email)

  if (!userExists) {
    // Return an error if the user doesn't exist
    return redirect(`/forgot-password?error=${encodeURIComponent("No account found with that email address.")}`)
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
  })

  if (error) {
    console.error('Supabase password reset error:', error.message)
    return redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/login?success=Check+your+email+for+the+password+reset+link.')
}
