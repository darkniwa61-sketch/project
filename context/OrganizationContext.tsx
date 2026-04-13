'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
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

  useEffect(() => {
    loadOrgFromSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) loadOrgFromSession()
        else {
          setOrgId(null)
          setOrgRole(null)
          setOrgName(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadOrgFromSession() {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const payload = JSON.parse(atob(session.access_token.split('.')[1]))
      const currentOrgId = payload?.org_id as string | undefined

      if (!currentOrgId) return

      setOrgId(currentOrgId)
      setOrgRole(payload?.org_role ?? null)

      // Fetch org name for display
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', currentOrgId)
        .single()

      setOrgName(org?.name ?? null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Switches the active organization for multi-org users.
   * Refreshes the session so the JWT carries the new org_id.
   * NOTE: for a full org-switcher you'll need a server action that
   * updates a cookie/DB flag so the JWT hook returns the chosen org.
   */
  async function switchOrg(newOrgId: string) {
    // TODO: call a server action / edge function that sets the
    // user's preferred_org_id and then refreshes the session.
    console.warn('switchOrg: implement preferred org persistence first')
  }

  return (
    <OrganizationContext.Provider
      value={{ orgId, orgRole, orgName, isLoading, switchOrg }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export const useOrganization = () => useContext(OrganizationContext)
