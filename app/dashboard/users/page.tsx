import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/auth/profiles';
import { UserManagementTable } from './user-management-table';

export const metadata = {
  title: 'User Management - St. Joseph APDC',
};

export default async function UsersPage() {
  // 1. Enforce Admin Access on Page Load
  await requireAdmin();

  // 2. Fetch all profiles
  const supabaseAdmin = createAdminClient();
  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#c26941]">Admin Control</h1>
        <p className="text-[#78716c] mt-1">Manage roles and item permissions for your staff.</p>
      </div>

      <div className="bg-white border text-card-foreground shadow-sm rounded-xl">
        <UserManagementTable initialProfiles={profiles || []} />
      </div>
    </div>
  );
}
