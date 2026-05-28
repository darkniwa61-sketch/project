'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/lib/auth/onboarding'
import { supabase } from '@/lib/supabase/client'

type Mode = 'choose' | 'code' | 'create'

export default function OnboardingPage() {
  const [mode, setMode]           = useState<Mode>('code')
  const [orgName, setOrgName]     = useState('')
  const [code, setCode]           = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const router = useRouter()

  /* ── Join via invite code ─────────────────────────────── */
  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const res  = await fetch('/api/invite/redeem', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code: code.trim().toUpperCase() }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Invalid or expired code.')
      setIsLoading(false)
      return
    }

    await supabase.auth.refreshSession()
    window.location.href = '/dashboard'
  }

  /* ── Create new workspace ─────────────────────────────── */
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('You must be logged in.')

      await completeOnboarding({ userId: session.user.id, orgName })
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace.')
      setIsLoading(false)
    }
  }

  /* ── UI ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b12] p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-xl">

        {/* ── CHOOSE screen ── */}
        {mode === 'choose' && (
          <div className="bg-[#111827] rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
            <div className="px-8 pt-10 pb-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
              <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to ST. Joseph Amity</h1>
              <p className="text-sm text-white/50 mt-2">How would you like to set up your management workspace?</p>
            </div>

            <div className="grid grid-cols-2 divide-x divide-white/5">
              {/* Option A — enter code */}
              <button
                onClick={() => { setMode('code'); setError(null) }}
                className="flex flex-col items-center gap-4 p-10 text-center hover:bg-white/[0.02] transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#06b6d4]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🔑</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-lg group-hover:text-[#06b6d4] transition-colors">I have a code</span>
                  <span className="text-xs text-white/40 mt-1 block">Join an existing organization</span>
                </div>
              </button>

              {/* Option B — create workspace */}
              <button
                onClick={() => { setMode('create'); setError(null) }}
                className="flex flex-col items-center gap-4 p-10 text-center hover:bg-white/[0.02] transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏢</span>
                </div>
                <div>
                  <span className="block font-bold text-white text-lg group-hover:text-[#06b6d4] transition-colors">Business Setup</span>
                  <span className="text-xs text-white/40 mt-1 block">Start a new ST. Joseph Amity workspace</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── ENTER CODE screen ── */}
        {mode === 'code' && (
          <div className="bg-[#111827] rounded-3xl shadow-2xl border border-white/5 p-10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-50"></div>
            
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Organization</h1>
            <p className="text-sm text-white/50 mb-8">
              Enter your professional 6-digit access code to join the team.
            </p>

            <form onSubmit={handleJoinWithCode} className="space-y-6">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="PRO-INV"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="w-full px-6 py-5 bg-black/40 border border-white/10 rounded-2xl text-white text-4xl font-black font-mono tracking-[0.4em] text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all placeholder:text-white/5 placeholder:text-xl placeholder:tracking-normal placeholder:font-normal"
              />

              {error && (
                <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length < 6}
                className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-[#0a0b12] font-black py-4 rounded-2xl transition-all disabled:opacity-30 disabled:grayscale shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] uppercase tracking-widest text-sm"
              >
                {isLoading ? 'Processing...' : 'Authenticate & Join →'}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-white/40 mb-3">Don't have a code yet?</p>
              <button
                onClick={() => { setMode('create'); setError(null) }}
                className="text-sm font-bold text-[#06b6d4] hover:text-white transition-colors underline underline-offset-8 decoration-white/10"
              >
                Register a new organization instead
              </button>
            </div>
          </div>
        )}

        {/* ── CREATE WORKSPACE screen ── */}
        {mode === 'create' && (
          <div className="bg-[#111827] rounded-3xl shadow-2xl border border-white/5 p-10 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06b6d4] to-transparent opacity-50"></div>

            <button
              onClick={() => { setMode('code'); setError(null) }}
              className="text-xs text-white/40 hover:text-[#06b6d4] mb-8 flex items-center gap-2 transition-colors uppercase font-bold tracking-widest"
            >
              ← Back to Join
            </button>

            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Business Setup</h1>
            <p className="text-sm text-white/50 mb-8">
              Initialize a new ST. Joseph Amity workspace for your business.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div>
                <label htmlFor="orgName" className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-widest ml-1">
                  Organization Identity
                </label>
                <input
                  id="orgName"
                  type="text"
                  required
                  placeholder="e.g. Global Tech Solutions"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !orgName.trim()}
                className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-[#0a0b12] font-black py-4 rounded-2xl transition-all disabled:opacity-30 disabled:grayscale shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] uppercase tracking-widest text-sm"
              >
                {isLoading ? 'Creating Workspace...' : 'Initialize Management System →'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

