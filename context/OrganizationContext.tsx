'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { supabase } from '@/lib/supabase/client'

interface OrgContextValue {
  orgId:      string | null
  orgRole:    string | null
  orgName:    string | null
  isLoading:  boolean
  switchOrg:  (orgId: string) => Promise<void>
}

const OrganizationContext = createContext<OrgContextValue>({
  orgId:     null,
  orgRole:   null,
  orgName:   null,
  isLoading: true,
  switchOrg: async () => {},
})

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [orgId,     setOrgId]     = useState<string | null>(null)
  const [orgRole,   setOrgRole]   = useState<string | null>(null)
  const [orgName,   setOrgName]   = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadOrgFromSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setOrgId(null); setOrgRole(null); setOrgName(null)
        return
      }

      const payload = JSON.parse(atob(session.access_token.split('.')[1]))
      
      console.log('[OrganizationContext] JWT Payload:', payload)
      
      const currentOrgId = payload?.org_id || payload?.app_metadata?.org_id || payload?.user_metadata?.org_id
      if (!currentOrgId) {
        console.warn('[OrganizationContext] No org_id found in JWT payload. Is the Supabase Auth Hook enabled?')
        return
      }

      setOrgId(currentOrgId)
      
      const role = payload?.org_role || payload?.app_metadata?.org_role || payload?.user_metadata?.org_role
      setOrgRole(role ?? null)

      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', currentOrgId)
        .single()

      setOrgName(org?.name ?? null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrgFromSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) loadOrgFromSession()
        else { setOrgId(null); setOrgRole(null); setOrgName(null) }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadOrgFromSession])

  // Switches the active org, refreshes the JWT, re-loads context
  const switchOrg = useCallback(async (newOrgId: string) => {
    // @ts-ignore - Suppressing until 'supabase gen types' is run to capture Migration 005
    const { error } = await supabase.rpc('switch_active_organization', {
      new_org_id: newOrgId,
    })

    if (error) {
      console.error('[switchOrg] RPC failed:', error.message)
      throw new Error(error.message)
    }

    // Refresh session → JWT hook picks up new preferred_org_id
    await supabase.auth.refreshSession()

    // Re-load org context from the new token
    await loadOrgFromSession()
  }, [loadOrgFromSession])

  return (
    <OrganizationContext.Provider
      value={{ orgId, orgRole, orgName, isLoading, switchOrg }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganization = () => useContext(OrganizationContext)
