'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleInvite = async () => {
      try {
        if (!token) throw new Error("Missing invite token in URL.");

        // Check auth status
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          // Store token and redirect to register so they don't lose the token!
          sessionStorage.setItem('pending_invite_token', token);
          router.push('/register');
          return;
        }

        // We are logged in! Call the RPC
        // @ts-ignore - Suppressing until 'supabase gen types' is run to pick up Migration 004
        const { data, error: rpcError } = await supabase.rpc('handle_join_organization', {
          p_token: token
        });

        if (rpcError) {
          throw new Error(rpcError.message);
        }

        setSuccess(true);
        
        // Force session refresh to obtain new org_id claim
        await supabase.auth.refreshSession();
        
        // Redirect to dashboard shortly after
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);

      } catch (err: any) {
        console.error("Invite error:", err);
        setError(err.message || "Failed to process the invite.");
        setIsLoading(false);
      }
    };

    handleInvite();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-stone-950 rounded-xl shadow-lg p-8 border border-stone-800 text-center">
        {isLoading ? (
          <div>
             <h1 className="text-2xl font-bold text-white mb-4">Verifying Invite...</h1>
             <p className="text-stone-400">Please wait while we validate your secure token.</p>
          </div>
        ) : error ? (
          <div>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Invite Failed</h1>
            <p className="text-red-400 text-sm mb-6 bg-red-500/10 p-3 rounded-md border border-red-500/20">{error}</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : success ? (
          <div>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Invite Accepted!</h1>
            <p className="text-stone-400 text-sm mb-6">You have been successfully added to the organization. Redirecting...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">Loading...</div>}>
      <InviteContent />
    </Suspense>
  )
}
