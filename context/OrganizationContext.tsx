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

      // --- Step 1: Try reading org_id from JWT claims ---
      let currentOrgId: string | null = null
      let currentRole:  string | null = null

      try {
        const payload = JSON.parse(atob(session.access_token.split('.')[1]))
        currentOrgId = payload?.org_id ?? payload?.app_metadata?.org_id ?? null
        currentRole  = payload?.org_role ?? payload?.app_metadata?.org_role ?? null
        console.log('[OrganizationContext] JWT org_id:', currentOrgId, 'role:', currentRole)
      } catch {
        console.warn('[OrganizationContext] Could not parse JWT payload.')
      }

      // --- Step 2: DB fallback if JWT has no org_id (e.g. Auth Hook not enabled) ---
      if (!currentOrgId) {
        console.warn('[OrganizationContext] No org_id in JWT. Falling back to DB...')

        // Try active_org_id from profiles
        // Cast to any because generated types may not include active_org_id yet
        const { data: profile } = await supabase
          .from('profiles')
          .select('active_org_id')
          .eq('id', session.user.id)
          .single() as any

        if ((profile as any)?.active_org_id) {
          currentOrgId = (profile as any).active_org_id as string
          const { data: membership } = await supabase
            .from('user_organizations')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('organization_id', currentOrgId!)
            .single()
          currentRole = (membership as any)?.role ?? null
        } else {
          // Last resort: grab any org the user belongs to
          const { data: memberships } = await supabase
            .from('user_organizations')
            .select('organization_id, role')
            .eq('user_id', session.user.id)
            .limit(1)
            .single()

          if (memberships) {
            currentOrgId = memberships.organization_id
            currentRole  = memberships.role
          }
        }

        console.log('[OrganizationContext] DB fallback → org_id:', currentOrgId, 'role:', currentRole)
      }

      if (!currentOrgId) {
        console.warn('[OrganizationContext] User has no organization.')
        setOrgId(null); setOrgRole(null); setOrgName(null)
        return
      }

      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', currentOrgId)
        .single()

      setOrgId(currentOrgId)
      setOrgRole(currentRole)
      setOrgName(org?.name ?? null)
    } catch (err) {
      console.error('[OrganizationContext] Load failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial load
    loadOrgFromSession()

    // Auth state changes (login/logout)
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) loadOrgFromSession()
        else { setOrgId(null); setOrgRole(null); setOrgName(null) }
      }
    )

    // Realtime: watch for changes to profiles.active_org_id
    // This fires automatically when switchOrg() updates the DB or when SQL is run directly
    const channel = supabase
      .channel('profile_org_change')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => {
          console.log('[OrganizationContext] Profile updated — reloading org...')
          loadOrgFromSession()
        }
      )
      .subscribe()

    return () => {
      authSubscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [loadOrgFromSession])

  const switchOrg = useCallback(async (newOrgId: string) => {
    // 1. Persist the switch in the DB (profiles.active_org_id)
    // @ts-ignore
    const { error } = await supabase.rpc('switch_active_organization', {
      new_org_id: newOrgId,
    })

    if (error) {
      console.error('[switchOrg] RPC failed:', error.message)
      throw new Error(error.message)
    }

    // 2. Try refreshing the JWT (only works if Auth Hook is configured)
    await supabase.auth.refreshSession()

    // 3. Reload — DB fallback ensures the correct org is picked up regardless
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
