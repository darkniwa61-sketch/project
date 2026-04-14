'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/lib/auth/onboarding'
import { supabase } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const [orgName, setOrgName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // If user arrived from an invite link and registered, route them back!
    const pendingToken = sessionStorage.getItem('pending_invite_token');
    if (pendingToken) {
      router.push(`/invite?token=${pendingToken}`);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("You must be logged in to create a workspace.")

      await completeOnboarding({
        userId: session.user.id,
        orgName,
      })
      
      // Onboarding complete, redirect to dashboard
      // Note: we might need a sharp reload to ensure the middleware picks up the new JWT immediately
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error("Onboarding error:", err)
      setError(err.message || "Failed to create your workspace. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-stone-950 rounded-xl shadow-lg p-8 border border-stone-800">
        <h1 className="text-2xl font-bold text-white mb-2">Create Your Workspace</h1>
        <p className="text-sm text-stone-400 mb-6">
          Welcome! Before managing inventory or activities, you need to create an organization workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-stone-300 mb-1">
              Organization / Company Name
            </label>
            <input
              id="orgName"
              type="text"
              required
              placeholder="e.g. Acme Corp"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-stone-900 border border-stone-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-md border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !orgName.trim()}
            className="w-full bg-white hover:bg-stone-200 text-black font-semibold py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Workspace...' : 'Start Managing Inventory →'}
          </button>
        </form>
      </div>
    </div>
  )
}
