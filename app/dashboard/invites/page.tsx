'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { useOrganization } from '@/context/OrganizationContext';

export default function InvitesPage() {
  const { orgRole } = useOrganization();
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInvites = async () => {
    const { data, error } = await supabase.from('org_invites').select('*').order('created_at', { ascending: false });
    if (data) setInvites(data);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await supabase.from('org_invites').insert([{
      invited_email: email,
      role: 'member'
    }]);

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setEmail('');
      fetchInvites();
    }
    setIsLoading(false);
  };

  const handleRevoke = async (id: string) => {
    await supabase.from('org_invites').delete().eq('id', id);
    fetchInvites();
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite?token=${token}`);
    alert('Invite link copied to clipboard!');
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
        <p className="text-sm text-[#78716c] mt-1">Generate unique invite links to add team members to your workspace.</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm max-w-2xl">
        <h2 className="text-lg font-bold text-[#2d2621] mb-4">Create New Invite</h2>
        <form onSubmit={handleCreateInvite} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="colleague@example.com"
            className="flex-1 px-4 py-2 border border-[#e7e5e4] rounded-md focus:outline-none focus:ring-2 focus:ring-[#78716c]"
          />
          <button
            type="submit"
            disabled={isLoading || !email}
            className="flex items-center gap-2 bg-[#2d2621] hover:bg-[#443a32] text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Generate Link
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#e7e5e4] shadow-sm">
        <h2 className="text-lg font-bold text-[#2d2621] mb-6">Active Invites</h2>
        <div className="divide-y divide-[#e7e5e4]">
          {invites.length === 0 ? (
            <p className="text-sm text-[#78716c] py-4 text-center">No active invites. Generate one above to get started.</p>
          ) : (
             invites.map((invite) => (
              <div key={invite.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2d2621]">{invite.invited_email}</p>
                  <div className="flex gap-4 text-xs text-[#78716c] mt-1">
                    <span>Role: {invite.role}</span>
                    <span>Status: {invite.accepted_at ? 'Accepted' : 'Pending'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!invite.accepted_at && (
                    <button
                      onClick={() => copyToClipboard(invite.token)}
                      title="Copy Invite Link"
                      className="p-2 text-[#78716c] hover:text-[#2d2621] hover:bg-[#f5f5f4] rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRevoke(invite.id)}
                    title="Revoke / Delete"
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
