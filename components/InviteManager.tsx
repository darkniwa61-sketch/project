'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useOrganization } from '@/context/OrganizationContext'

interface PendingInvite {
  id:             string
  invited_email:  string
  role:           string
  token:          string
  expires_at:     string
  created_at:     string
}

export default function InviteManager() {
  const { orgRole }                       = useOrganization()
  const [email, setEmail]                 = useState('')
  const [role, setRole]                   = useState<'admin' | 'member'>('member')
  const [inviteLink, setInviteLink]       = useState('')
  const [copied, setCopied]               = useState(false)
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState('')

  useEffect(() => {
    if (['owner', 'admin'].includes(orgRole?.toLowerCase() ?? '')) {
      loadPendingInvites()
    }
  }, [orgRole])

  // Only owners and admins should see this component
  if (!['owner', 'admin'].includes(orgRole?.toLowerCase() ?? '')) return null

  async function loadPendingInvites() {
    const { data, error } = await supabase.rpc('get_org_invites')
    if (!error && data) setPendingInvites(data)
  }

  async function handleGenerateInvite() {
    setIsLoading(true)
    setError('')
    setInviteLink('')

    const res = await fetch('/api/invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, role }),
    })

    const data = await res.json()
    setIsLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setInviteLink(data.inviteUrl)
    setEmail('')
    loadPendingInvites()
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRevokeInvite(inviteId: string) {
    await supabase.from('org_invites').delete().eq('id', inviteId)
    loadPendingInvites()
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
        Invite teammates
      </h3>

      {/* Invite form */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="email"
          placeholder="colleague@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'member')}>
          <option value="member">Member</option>
          {orgRole === 'owner' && <option value="admin">Admin</option>}
        </select>
        <button onClick={handleGenerateInvite} disabled={isLoading || !email}>
          {isLoading ? 'Generating...' : 'Generate link'}
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--color-text-danger)', fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Generated link */}
      {inviteLink && (
        <div style={{
          background:   'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius-md)',
          padding:      '12px 14px',
          marginBottom: 20,
          display:      'flex',
          gap:          8,
          alignItems:   'center',
        }}>
          <code style={{ flex: 1, fontSize: 12, wordBreak: 'break-all' }}>
            {inviteLink}
          </code>
          <button onClick={handleCopyLink} style={{ whiteSpace: 'nowrap' }}>
            {copied ? 'Copied ✓' : 'Copy link'}
          </button>
        </div>
      )}

      {/* Pending invites list */}
      {pendingInvites.length > 0 && (
        <>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Pending invites
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingInvites.map(invite => (
              <div key={invite.id} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          8,
                padding:      '10px 14px',
                background:   'var(--color-background-primary)',
                border:       '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
              }}>
                <span style={{ flex: 1, fontSize: 14 }}>{invite.invited_email}</span>
                <span style={{
                  fontSize:     11,
                  padding:      '2px 8px',
                  borderRadius: 20,
                  background:   'var(--color-background-info)',
                  color:        'var(--color-text-info)',
                }}>
                  {invite.role}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                  Expires {new Date(invite.expires_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleRevokeInvite(invite.id)}
                  style={{ fontSize: 12, color: 'var(--color-text-danger)' }}
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
