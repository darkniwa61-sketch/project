'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Copy, Check, Plus, Trash2, RefreshCw } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';

interface Invite {
  id:           string;
  code:         string;
  role:         string;
  expires_at:   string;
  accepted_at:  string | null;
  created_at:   string;
}

export default function InvitesPage() {
  const { orgRole } = useOrganization();
  const [role, setRole]           = useState<'member' | 'admin'>('member');
  const [invites, setInvites]     = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');
  const [newCode, setNewCode]     = useState('');
  const [copiedId, setCopiedId]   = useState<string | null>(null);

  const fetchInvites = async () => {
    const { data } = await supabase
      .from('org_invites')
      .select('*')
      .is('accepted_at', null)
      .order('created_at', { ascending: false });
    if (data) setInvites(data as Invite[]);
  };

  useEffect(() => { fetchInvites(); }, []);

  const handleGenerateCode = async () => {
    setIsLoading(true);
    setError('');
    setNewCode('');

    const res  = await fetch('/api/invite', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ role }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) { setError(data.error); return; }

    setNewCode(data.code);
    fetchInvites();
  };

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    await supabase.from('org_invites').delete().eq('id', id);
    if (newCode) {
      const revoked = invites.find(i => i.id === id);
      if (revoked?.code === newCode) setNewCode('');
    }
    fetchInvites();
  };

  if (orgRole !== 'owner' && orgRole !== 'admin') {
    return (
      <div className="p-6 text-center text-[#78716c]">
        You do not have permission to manage invites.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2621]">Invite Members</h1>
        <p className="text-sm text-[#78716c] mt-1">
          Generate a 6-character invite code and share it with your teammate.
        </p>
      </div>

      {/* Generate Code */}
      <div className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm max-w-lg">
        <h2 className="text-lg font-bold text-[#2d2621] mb-4">Generate Invite Code</h2>

        <div className="flex gap-3 mb-4">
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'member' | 'admin')}
            className="px-3 py-2 border border-[#e7e5e4] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78716c] bg-white"
          >
            <option value="member">Member</option>
            {orgRole === 'owner' && <option value="admin">Admin</option>}
          </select>

          <button
            onClick={handleGenerateCode}
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#2d2621] hover:bg-[#443a32] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isLoading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Plus className="w-4 h-4" /> Generate Code</>
            }
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Show generated code */}
        {newCode && (
          <div className="flex items-center gap-3 bg-[#f5f5f4] border border-[#e7e5e4] rounded-lg px-5 py-4">
            <span className="flex-1 text-3xl font-bold tracking-[0.3em] text-[#2d2621] font-mono">
              {newCode}
            </span>
            <button
              onClick={() => copyCode(newCode, 'new')}
              className="flex items-center gap-1.5 text-sm text-[#78716c] hover:text-[#2d2621] transition-colors"
            >
              {copiedId === 'new'
                ? <><Check className="w-4 h-4 text-green-500" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy</>
              }
            </button>
          </div>
        )}

        {newCode && (
          <p className="text-xs text-[#78716c] mt-2">
            Share this code with your teammate. It expires in 7 days and can only be used once.
          </p>
        )}
      </div>

      {/* Active invites list */}
      <div className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm max-w-lg">
        <h2 className="text-lg font-bold text-[#2d2621] mb-4">Pending Codes</h2>
        {invites.length === 0 ? (
          <p className="text-sm text-[#78716c] py-2 text-center">No pending invite codes.</p>
        ) : (
          <div className="divide-y divide-[#e7e5e4]">
            {invites.map(invite => (
              <div key={invite.id} className="py-3 flex items-center gap-4">
                {/* Code */}
                <span className="font-mono font-bold text-lg tracking-widest text-[#2d2621] w-24">
                  {invite.code}
                </span>
                {/* Role badge */}
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f4] text-[#78716c] border border-[#e7e5e4]">
                  {invite.role}
                </span>
                {/* Expiry */}
                <span className="text-xs text-[#78716c] flex-1">
                  Expires {new Date(invite.expires_at).toLocaleDateString()}
                </span>
                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => copyCode(invite.code, invite.id)}
                    title="Copy code"
                    className="p-1.5 text-[#78716c] hover:text-[#2d2621] hover:bg-[#f5f5f4] rounded transition-colors"
                  >
                    {copiedId === invite.id
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    title="Revoke"
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
