import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { StaffService } from '@/server/services/staff.service';

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

    await StaffService.updateStaff(salonId, staffId, body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
