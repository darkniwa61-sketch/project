'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useOrganization } from '@/context/OrganizationContext'

interface OrgOption {
  organization_id: string
  name:            string
  role:            string
  is_active:       boolean
}

interface OrgSwitcherProps {
  externalOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function OrgSwitcher({ externalOpen, onOpenChange }: OrgSwitcherProps = {}) {
  const { orgName, orgRole, switchOrg }   = useOrganization()
  const [orgs, setOrgs]                   = useState<OrgOption[]>([])
  const [isOpen, setIsOpen]               = useState(false)
  const [isSwitching, setIsSwitching]     = useState(false)
  const [switchingId, setSwitchingId]     = useState<string | null>(null)
  const dropdownRef                       = useRef<HTMLDivElement>(null)

  // Sync with external controller
  useEffect(() => {
    if (externalOpen !== undefined) setIsOpen(externalOpen)
  }, [externalOpen])

  function toggleOpen() {
    const next = !isOpen
    setIsOpen(next)
    onOpenChange?.(next)
  }

  function closeDropdown() {
    setIsOpen(false)
    onOpenChange?.(false)
  }

  useEffect(() => {
    loadOrgs()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  async function loadOrgs() {
    const { data, error } = await supabase.rpc('get_my_organizations')
    if (!error && data) setOrgs(data)
  }

  async function handleSwitch(orgId: string, alreadyActive: boolean) {
    if (isSwitching) return
    
    // If already active, just close the dropdown and do nothing else
    if (alreadyActive) {
      closeDropdown()
      return
    }

    setIsSwitching(true)
    setSwitchingId(orgId)
    console.log('[OrgSwitcher] Switching to:', orgId)

    try {
      await switchOrg(orgId)
      await loadOrgs()       // refresh the list so is_active updates
      
      // Forces a page refresh to ensure all components see the new org_id in headers/cookies
      window.location.reload() 
      
      closeDropdown()
    } catch (err) {
      console.error('[OrgSwitcher] switch failed:', err)
    } finally {
      setIsSwitching(false)
      setSwitchingId(null)
    }
  }

  const roleBadgeStyle = (role: string): React.CSSProperties => ({
    fontSize:     11,
    padding:      '1px 7px',
    borderRadius: 20,
    background:   role === 'owner'
      ? 'var(--color-background-warning)'
      : role === 'admin'
        ? 'var(--color-background-info)'
        : 'var(--color-background-secondary)',
    color: role === 'owner'
      ? 'var(--color-text-warning)'
      : role === 'admin'
        ? 'var(--color-text-info)'
        : 'var(--color-text-secondary)',
  })

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* Trigger button */}
      <button
        onClick={toggleOpen}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          padding:      '6px 12px',
          background:   'var(--color-background-secondary)',
          border:       '0.5px solid var(--color-border-secondary)',
          borderRadius: 'var(--border-radius-md)',
          cursor:       'pointer',
          fontSize:     14,
          fontWeight:   500,
          color:        'var(--color-text-primary)',
          minWidth:     160,
          justifyContent: 'space-between',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Org avatar */}
          <span style={{
            width:        24,
            height:       24,
            borderRadius: '50%',
            background:   'var(--color-background-info)',
            color:        'var(--color-text-info)',
            fontSize:     11,
            fontWeight:   500,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            flexShrink:   0,
          }}>
            {orgName?.charAt(0).toUpperCase() ?? '?'}
          </span>
          <span style={{
            maxWidth:     140,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {orgName ?? 'Select org'}
          </span>
        </span>
        {/* Chevron */}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position:     'absolute',
          top:          'calc(100% + 6px)',
          left:         0,
          minWidth:     240,
          background:   'var(--color-background-primary)',
          border:       '0.5px solid var(--color-border-secondary)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow:    '0 4px 16px rgba(0,0,0,0.08)',
          zIndex:       50,
          overflow:     'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding:      '10px 14px 8px',
            borderBottom: '0.5px solid var(--color-border-tertiary)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your organizations
            </p>
          </div>

          {/* Org list */}
          <div style={{ padding: '6px 0' }}>
            {orgs.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', padding: '8px 14px', margin: 0 }}>
                No organizations found
              </p>
            )}
            {orgs.map(org => (
              <button
                key={org.organization_id}
                onClick={() => handleSwitch(org.organization_id, org.is_active)}
                className="org-switcher-item"
                style={{
                  width:          '100%',
                  display:        'flex',
                  alignItems:     'center',
                  gap:            10,
                  padding:        '8px 14px',
                  background:     org.is_active ? 'var(--color-background-secondary)' : 'transparent',
                  border:         'none',
                  cursor:         org.is_active ? 'default' : 'pointer',
                  textAlign:      'left',
                  opacity:        switchingId === org.organization_id ? 0.6 : 1,
                  transition:     'background 0.1s',
                  cursor:         'pointer',
                  userSelect:     'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--color-background-secondary)'
                }}
                onMouseLeave={e => {
                  if (!org.is_active) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Avatar */}
                <span style={{
                  width:          28,
                  height:         28,
                  borderRadius:   '50%',
                  background:     org.is_active ? 'var(--color-background-info)' : 'var(--color-background-tertiary)',
                  color:          org.is_active ? 'var(--color-text-info)' : 'var(--color-text-secondary)',
                  fontSize:       12,
                  fontWeight:     500,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}>
                  {org.name.charAt(0).toUpperCase()}
                </span>

                {/* Name + role */}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    display:      'block',
                    fontSize:     13,
                    fontWeight:   org.is_active ? 500 : 400,
                    color:        'var(--color-text-primary)',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                  }}>
                    {org.name}
                  </span>
                </span>

                {/* Role badge */}
                <span style={roleBadgeStyle(org.role)}>{org.role}</span>

                {/* Active checkmark */}
                {org.is_active && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="var(--color-text-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}

                {/* Switching spinner */}
                {switchingId === org.organization_id && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>switching...</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
