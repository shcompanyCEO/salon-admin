import { createClient } from '@supabase/supabase-js';

// TODO: Replace with centralized Supabase client if available in server context
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Bypass RLS with Admin Key
const supabase = createClient(supabaseUrl, supabaseKey);

export class StaffService {
  static async getStaffList(salonId: string) {
    if (!salonId) {
      throw new Error('Salon ID is required');
    }

    const { data: users, error } = await supabase
      .from('users')
      .select(
        `
        id,
        name,
        email,
        phone,
        role,
        salon_id,
        profile_image,
        is_active,
        created_at,
        updated_at,
        staff_profiles (
          bio,
          years_of_experience,
          specialties,
          permissions
        )
      `
      )
      .eq('salon_id', salonId)
      .in('role', ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'])
      .eq('is_active', true);

    if (error) {
      throw new Error(error.message);
    }

    if (!users) {
      return [];
    }

    return users.map(this.transformToStaff);
  }

  static async updateStaff(salonId: string, staffId: string, updates: any) {
    const profileUpdates: any = {};

    // Handle permissions update
    if (updates.permissions) {
      // Convert Array back to Object (if it comes as array)
      if (Array.isArray(updates.permissions)) {
        const permsObject: Record<string, any> = {};
        updates.permissions.forEach((p: any) => {
          permsObject[p.module] = {
            view: p.canRead,
            create: p.canWrite,
            edit: p.canWrite,
            delete: p.canDelete,
          };
        });
        profileUpdates.permissions = permsObject;
      } else {
        profileUpdates.permissions = updates.permissions;
      }
    }

    // Handle other updates if needed (e.g. isActive)
    if (typeof updates.isActive !== 'undefined') {
      // Users table update needed for isActive
      const { error: userError } = await supabase
        .from('users')
        .update({ is_active: updates.isActive })
        .eq('id', staffId);

      if (userError) throw userError;
    }

    // Update staff_profiles if permissions or other profile fields
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from('staff_profiles')
        .upsert(
          { user_id: staffId, ...profileUpdates },
          { onConflict: 'user_id' }
        );

      if (profileError) throw profileError;
    }

    return { success: true };
  }

  private static transformToStaff(user: any) {
    const profile = user.staff_profiles?.[0] || user.staff_profiles || {};

    return {
      id: user.id,
      userId: user.id,
      salonId: user.salon_id,
      name: user.name,
      description: profile.bio || '',
      experience: profile.years_of_experience || 0,
      profileImage: user.profile_image,
      portfolioImages: [],
      specialties: profile.specialties || [],
      rating: 0,
      reviewCount: 0,

      isActive: user.is_active,
      permissions: Object.entries(profile.permissions || {}).map(
        ([key, val]: [string, any]) => ({
          module: key,
          canRead: val.view || false,
          canWrite: val.edit || val.create || false,
          canDelete: val.delete || false,
        })
      ),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      phone: user.phone,
      email: user.email,
      role: user.role,
    };
  }
}
