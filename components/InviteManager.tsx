'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useOrganization } from '@/context/OrganizationContext'
import { Copy, Check, Plus, Trash2, RefreshCw } from 'lucide-react'

interface PendingInvite {
  id:          string
  code:        string
  role:        string
  expires_at:  string
  created_at:  string
}

export default function InviteManager() {
  const { orgRole }                           = useOrganization()
  const [role, setRole]                       = useState<'admin' | 'member'>('member')
  const [newCode, setNewCode]                 = useState('')
  const [copiedId, setCopiedId]               = useState<string | null>(null)
  const [pendingInvites, setPendingInvites]   = useState<PendingInvite[]>([])
  const [isLoading, setIsLoading]             = useState(false)
  const [error, setError]                     = useState('')

  useEffect(() => {
    if (['owner', 'admin'].includes(orgRole?.toLowerCase() ?? '')) {
      loadPendingInvites()
    }
  }, [orgRole])

  if (!['owner', 'admin'].includes(orgRole?.toLowerCase() ?? '')) return null

  async function loadPendingInvites() {
    const { data } = await supabase.rpc('get_org_invites')
    if (data) setPendingInvites(data)
  }

  async function handleGenerateCode() {
    setIsLoading(true)
    setError('')
    setNewCode('')

    const res  = await fetch('/api/invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ role }),
    })
    const data = await res.json()
    setIsLoading(false)

    if (!res.ok) { setError(data.error); return }

    setNewCode(data.code)
    loadPendingInvites()
  }

  async function copyCode(code: string, id: string) {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleRevokeInvite(inviteId: string) {
    await supabase.from('org_invites').delete().eq('id', inviteId)
    loadPendingInvites()
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
        Invite teammates
      </h3>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <select
          value={role}
          onChange={e => setRole(e.target.value as 'admin' | 'member')}
          style={{ padding: '6px 10px', borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', fontSize: 13 }}
        >
          <option value="member">Member</option>
          {orgRole === 'owner' && <option value="admin">Admin</option>}
        </select>

        <button
          onClick={handleGenerateCode}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6,
            background: 'var(--color-text-primary)',
            color: 'var(--color-background-primary)',
            border: 'none', cursor: 'pointer', fontSize: 13,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading
            ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
            : <><Plus size={13} /> Generate code</>
          }
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--color-text-danger)', fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Generated code display */}
      {newCode && (
        <div style={{
          background:   'var(--color-background-secondary)',
          borderRadius: 'var(--border-radius-md)',
          padding:      '14px 18px',
          marginBottom: 20,
          display:      'flex',
          alignItems:   'center',
          gap:          12,
        }}>
          <span style={{ flex: 1, fontSize: 28, fontWeight: 700, letterSpacing: '0.25em', fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
            {newCode}
          </span>
          <button
            onClick={() => copyCode(newCode, 'new')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {copiedId === 'new' ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      )}

      {/* Pending list */}
      {pendingInvites.length > 0 && (
        <>
          <h4 style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Pending codes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingInvites.map(invite => (
              <div key={invite.id} style={{
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                padding:      '10px 14px',
                background:   'var(--color-background-primary)',
                border:       '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
              }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, letterSpacing: '0.2em', color: 'var(--color-text-primary)', width: 80 }}>
                  {invite.code}
                </span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--color-background-info)', color: 'var(--color-text-info)' }}>
                  {invite.role}
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', flex: 1 }}>
                  Expires {new Date(invite.expires_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => copyCode(invite.code, invite.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}
                >
                  {copiedId === invite.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button
                  onClick={() => handleRevokeInvite(invite.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-danger)', display: 'flex' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
