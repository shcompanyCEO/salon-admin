import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { salonId: string; staffId: string } }
) {
  try {
    const { salonId, staffId } = await params;
    const body = await req.json();

    console.log(`Updating staff ${staffId} in salon ${salonId}`, body);

    const updates: any = {};

    // Handle permissions update
    if (body.permissions) {
      // Convert Array back to Object
      const permsObject: Record<string, any> = {};
      body.permissions.forEach((p: any) => {
        permsObject[p.module] = {
          view: p.canRead,
          create: p.canWrite,
          edit: p.canWrite,
          delete: p.canDelete,
        };
      });
      updates.permissions = permsObject;
    }

    // Handle other updates if needed (e.g. isActive, bio)
    if (typeof body.isActive !== 'undefined') {
      // Users table update needed for isActive
      const { error: userError } = await supabase
        .from('users')
        .update({ is_active: body.isActive })
        .eq('id', staffId);

      if (userError) throw userError;
    }

    // Update staff_profiles if permissions or other profile fields
    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await supabase
        .from('staff_profiles')
        .update(updates)
        .eq('user_id', staffId);

      if (profileError) throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
