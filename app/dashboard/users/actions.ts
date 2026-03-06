'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin, UserRole } from '@/utils/auth/profiles';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: UserRole) {
  await requireAdmin(); // Throws if current user is not admin

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update role: ' + error.message);
  }
  
  revalidatePath('/dashboard/users');
}

export async function updateUserPermissions(
  userId: string,
  permissions: { can_add_item?: boolean; can_edit_item?: boolean; can_delete_item?: boolean }
) {
  await requireAdmin(); // Exclusively for admins

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin
    .from('profiles')
    .update(permissions)
    .eq('id', userId);

  if (error) {
    throw new Error('Failed to update permissions: ' + error.message);
  }

  revalidatePath('/dashboard/users');
}
