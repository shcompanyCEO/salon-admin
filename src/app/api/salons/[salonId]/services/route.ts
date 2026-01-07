import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SalonServicesService } from '@/server/services/salon-services.service';

// Helper to create authenticated client
const createAuthenticatedClient = (req: NextRequest) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const options: any = {};

  if (token) {
    options.global = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options
  );
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const categoryId = searchParams.get('categoryId');

    const supabase = createAuthenticatedClient(req);

    let data;
    if (type === 'industries') {
      const all = await SalonServicesService.getIndustries(supabase);
      const selected = await SalonServicesService.getSalonIndustries(
        supabase,
        salonId
      );
      // selected is now {id, name, displayOrder}[]
      data = { all, selected };
    } else if (type === 'categories') {
      data = await SalonServicesService.getCategories(supabase, salonId);
    } else if (type === 'services') {
      data = await SalonServicesService.getServices(
        supabase,
        salonId,
        categoryId || undefined
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid request type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ salonId: string }> }
) {
  try {
    const { salonId } = await params;
    const body = await req.json();
    const { action, ...data } = body;

    const supabase = createAuthenticatedClient(req);
    let result;

    switch (action) {
      case 'add_industry':
        await SalonServicesService.addSalonIndustry(
          supabase,
          salonId,
          data.industryId
        );
        break;
      case 'remove_industry':
        await SalonServicesService.removeSalonIndustry(
          supabase,
          salonId,
          data.industryId
        );
        break;
      case 'reorder_industries':
        await SalonServicesService.reorderIndustries(
          supabase,
          salonId,
          data.orderedIndustryIds
        );
        break;
      case 'create_category':
        result = await SalonServicesService.createCategory(
          supabase,
          salonId,
          data.name,
          data.displayOrder,
          data.industryId
        );
        break;
      case 'delete_category':
        await SalonServicesService.deleteCategory(supabase, data.id);
        break;
      case 'create_service':
        result = await SalonServicesService.createService(
          supabase,
          salonId,
          data.categoryId,
          data.serviceData
        );
        break;
      case 'delete_service':
        await SalonServicesService.deleteService(supabase, data.id);
        break;
      case 'update_category':
        result = await SalonServicesService.updateCategory(
          supabase,
          data.id,
          data.updates
        );
        break;
      case 'reorder_categories':
        await SalonServicesService.reorderCategories(
          supabase,
          salonId,
          data.categories
        );
        break;
      case 'update_service':
        result = await SalonServicesService.updateService(
          supabase,
          data.id,
          data.updates
        );
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
