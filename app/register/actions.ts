'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email     = formData.get('email') as string
  const password  = formData.get('password') as string
  const firstName = formData.get('first-name') as string
  const lastName  = formData.get('last-name') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name:  lastName,
      }
    }
  })

  if (error) {
    const cookieStore = await cookies()
    cookieStore.set('flash_error', error.message, { path: '/', maxAge: 30, httpOnly: true, sameSite: 'lax' })
    return redirect('/register')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
