'use server';

import { createClient } from '@supabase/supabase-js';
import { StaffRepository } from '@salon-admin/api-core';

interface CreateStaffParams {
  salonId: string;
  email: string;
  name: string;
  role: string;
  password?: string;
  accessToken: string;
}

export async function createStaff({
  salonId, // We need salonId for quota check
  email,
  name,
  role,
  password,
  accessToken,
}: CreateStaffParams) {
  if (!accessToken) {
    return { error: 'You must be logged in to create staff.' };
  }

  // Admin Client for User Management
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Anon Client for Repository (Quota Check)
  // Or reuse admin? Admin is safer for bypassing RLS if needed, but repository is built on standard client?
  // Let's use basic fetch for quota repository to respect RLS?
  // Actually, we can just use the Admin client to query raw count if needed, or instantiate repository with Admin client.
  // Repository expects a client.
  const staffRepo = new StaffRepository(supabaseAdmin);

  try {
    // 1. Check Quota
    // We need to fetch salon plan. Let's assume FREE for now as column might be new.
    // Or fetch salon detail.
    // Is there a SalonRepository?
    // Let's query directly for simplicity or instantiate salon repo if exists.

    // Check salon plan
    const { data: salon, error: salonError } = await supabaseAdmin
      .from('salons')
      .select('plan_type')
      .eq('id', salonId)
      .single();

    if (salonError) throw new Error('Failed to fetch salon info');

    const planType = salon?.plan_type || 'FREE';

    if (planType === 'FREE') {
      const staffCount = await staffRepo.getStaffCount(salonId);
      if (staffCount >= 5) {
        return {
          error: 'LIMIT_REACHED: Free plan allows up to 5 staff members.',
        };
      }
    }

    // 2. Create User
    const tempPassword = password || 'salon1234!'; // Default if not provided

    // Check if input is username (no @) and append valid domain
    let finalEmail = email;
    if (!finalEmail.includes('@')) {
      finalEmail = `${email}@salon.local`;
    }

    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: finalEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          user_type: 'ADMIN_USER',
          salon_id: salonId,
          is_approved: true, // Auto approve invited/created staff
        },
      });

    if (createError) throw createError;

    return { success: true, message: 'Staff created successfully!' };
  } catch (err: any) {
    console.error('Create Staff Error:', err);
    return { error: err.message };
  }
}
