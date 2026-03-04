'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first-name') as string
  const lastName = formData.get('last-name') as string
  const location = formData.get('location') as string

  const data = {
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        location: location,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Supabase signup error:', error.message)
    const cookieStore = await cookies()
    cookieStore.set('flash_error', error.message, { path: '/', maxAge: 30, httpOnly: true, sameSite: 'lax' })
    return redirect('/register')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
