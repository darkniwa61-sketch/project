'use client';

import { useState } from 'react';
import { UserProfile, UserRole } from '@/utils/auth/profiles';
import { updateUserRole, updateUserPermissions } from './actions';
import { Loader2 } from 'lucide-react';

export function UserManagementTable({ initialProfiles }: { initialProfiles: UserProfile[] }) {
  const [profiles, setProfiles] = useState<UserProfile[]>(initialProfiles);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setLoadingId(userId);
    setError(null);
    try {
      await updateUserRole(userId, newRole);
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handlePermissionToggle = async (
    userId: string,
    field: 'can_add_item' | 'can_edit_item' | 'can_delete_item',
    currentValue: boolean
  ) => {
    setLoadingId(userId);
    setError(null);
    try {
      await updateUserPermissions(userId, { [field]: !currentValue });
       setProfiles(profiles.map(p => p.id === userId ? { ...p, [field]: !currentValue } : p));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto p-0">
      {error && <div className="p-4 bg-red-50 text-red-600 text-sm border-b">{error}</div>}
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-[#78716c] bg-[#fafafa] uppercase border-b border-[#e7e5e4]">
          <tr>
            <th className="px-6 py-4 font-medium">User Email</th>
            <th className="px-6 py-4 font-medium">Role</th>
            <th className="px-6 py-4 font-medium text-center">Can Add</th>
            <th className="px-6 py-4 font-medium text-center">Can Edit</th>
            <th className="px-6 py-4 font-medium text-center">Can Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e7e5e4]">
          {profiles.map((profile) => (
            <tr key={profile.id} className="bg-white hover:bg-[#fafafa]/50 transition-colors">
              <td className="px-6 py-4 font-medium text-[#2d2621]">
                {profile.email}
              </td>
              <td className="px-6 py-4">
                <select
                  disabled={loadingId === profile.id}
                  value={profile.role}
                  onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                  className="bg-white border border-[#e7e5e4] text-[#2d2621] text-sm rounded-lg focus:ring-[#2d2621] focus:border-[#2d2621] block w-full p-2"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                  disabled={profile.role === 'admin' || loadingId === profile.id}
                  checked={profile.role === 'admin' ? true : profile.can_add_item}
                  onChange={() => handlePermissionToggle(profile.id, 'can_add_item', profile.can_add_item)}
                  className="w-4 h-4 text-[#2d2621] bg-white border-[#e7e5e4] rounded focus:ring-0 disabled:opacity-50"
                />
              </td>
              <td className="px-6 py-4 text-center">
                <input
                  type="checkbox"
                   disabled={profile.role === 'admin' || loadingId === profile.id}
                  checked={profile.role === 'admin' ? true : profile.can_edit_item}
                   onChange={() => handlePermissionToggle(profile.id, 'can_edit_item', profile.can_edit_item)}
                  className="w-4 h-4 text-[#2d2621] bg-white border-[#e7e5e4] rounded focus:ring-0 disabled:opacity-50"
                />
              </td>
              <td className="px-6 py-4 text-center">
                 <input
                  type="checkbox"
                   disabled={profile.role === 'admin' || loadingId === profile.id}
                  checked={profile.role === 'admin' ? true : profile.can_delete_item}
                   onChange={() => handlePermissionToggle(profile.id, 'can_delete_item', profile.can_delete_item)}
                  className="w-4 h-4 text-[#2d2621] bg-white border-[#e7e5e4] rounded focus:ring-0 disabled:opacity-50"
                />
              </td>
              <td className="px-2 py-4 text-center w-8">
                  {loadingId === profile.id && <Loader2 className="w-4 h-4 text-[#78716c] animate-spin" />}
              </td>
            </tr>
          ))}
          {profiles.length === 0 && (
            <tr>
               <td colSpan={5} className="px-6 py-8 text-center text-[#78716c]">
                 No users found.
               </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
