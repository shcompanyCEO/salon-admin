import { NextRequest, NextResponse } from 'next/server';
import { SalonServicesService } from '@/server/services/salon-services.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { salonId: string } }
) {
  try {
    const { salonId } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'industries', 'categories', 'services'
    const categoryId = searchParams.get('categoryId');

    let data;
    if (type === 'industries') {
      const all = await SalonServicesService.getIndustries();
      const selected = await SalonServicesService.getSalonIndustries(salonId);
      data = { all, selected };
    } else if (type === 'categories') {
      data = await SalonServicesService.getCategories(salonId);
    } else if (type === 'services' && categoryId) {
      data = await SalonServicesService.getServices(categoryId);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid request type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { salonId: string } }
) {
  try {
    const { salonId } = await params;
    const body = await req.json();
    const { action, ...data } = body;
    // Actions: 'add_industry', 'remove_industry', 'create_category', 'delete_category', 'create_service', 'delete_service'

    let result;

    switch (action) {
      case 'add_industry':
        await SalonServicesService.addSalonIndustry(salonId, data.industryId);
        break;
      case 'remove_industry':
        await SalonServicesService.removeSalonIndustry(
          salonId,
          data.industryId
        );
        break;
      case 'create_category':
        result = await SalonServicesService.createCategory(
          salonId,
          data.name,
          data.displayOrder
        );
        break;
      case 'delete_category':
        await SalonServicesService.deleteCategory(data.id);
        break;
      case 'create_service':
        result = await SalonServicesService.createService(
          salonId,
          data.categoryId,
          data.serviceData
        );
        break;
      case 'delete_service':
        await SalonServicesService.deleteService(data.id);
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
