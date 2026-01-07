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
