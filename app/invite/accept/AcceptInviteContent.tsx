'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AcceptInviteContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid invite link — no token found.')
      return
    }
    acceptInvite(token)
  }, [token])

  async function acceptInvite(token: string) {
    // Make sure user is logged in first
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Save token to redirect back after login
      sessionStorage.setItem('pending_invite_token', token)
      router.push(`/login?redirect=/invite/accept?token=${token}`)
      return
    }

    const { data, error } = await supabase.rpc('accept_org_invite', {
      p_token: token,
    })

    if (error) {
      setStatus('error')
      setMessage(error.message)
      return
    }

    // Refresh session so new org_id appears in JWT
    await supabase.auth.refreshSession()

    setStatus('success')
    setMessage('You have joined the organization!')

    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
        {status === 'loading' && <p>Accepting your invite...</p>}
        {status === 'success' && (
          <>
            <h2>✅ Welcome aboard!</h2>
            <p>{message}</p>
            <p style={{ color: '#888', fontSize: 14 }}>Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2>❌ Invite failed</h2>
            <p>{message}</p>
            <a href="/login">Go to login</a>
          </>
        )}
      </div>
    </div>
  )
}
