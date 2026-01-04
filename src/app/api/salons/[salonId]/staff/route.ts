import { NextRequest, NextResponse } from 'next/server';
import { StaffService } from '@/server/services/staff.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { salonId: string } }
) {
  try {
    const { salonId } = await params;
    const staffList = await StaffService.getStaffList(salonId);

    return NextResponse.json({
      success: true,
      data: staffList,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: error.message === 'Salon ID is required' ? 400 : 500 }
    );
  }
}
