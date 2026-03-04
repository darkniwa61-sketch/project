'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error('Supabase login error:', error.message)
    const cookieStore = await cookies()
    cookieStore.set('flash_error', error.message, { path: '/', maxAge: 30, httpOnly: true, sameSite: 'lax' })
    return redirect('/login')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
