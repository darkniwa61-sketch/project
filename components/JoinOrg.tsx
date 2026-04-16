'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export default function JoinOrg() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setIsJoining(true);
    setMessage(null);

    try {
      const response = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join organization');
      }

      setMessage({ 
        type: 'success', 
        text: 'Successfully joined the organization!' 
      });
      setInviteCode('');
      
      // Refresh to update any org-related state
      setTimeout(() => {
        router.refresh();
      }, 2000);

    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#c26941]" />
        <h3 className="text-lg font-bold text-[#2d2621]">Join New Organization</h3>
      </div>
      
      <p className="text-sm text-[#78716c]">
        Enter a 6-digit invite code to join another organization.
      </p>

      {message && (
        <div className={`p-4 rounded-md flex items-start gap-3 border ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleJoin} className="flex gap-3">
        <div className="flex-1 max-w-[200px]">
          <Input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="ABCDEF"
            maxLength={6}
            className="text-center font-mono font-bold tracking-widest border-[#e7e5e4] focus-visible:ring-[#c26941]"
            disabled={isJoining}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isJoining || inviteCode.length < 6}
          className="bg-[#c26941] hover:bg-[#a65632] text-white"
        >
          {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Join
        </Button>
      </form>
    </div>
  );
}
