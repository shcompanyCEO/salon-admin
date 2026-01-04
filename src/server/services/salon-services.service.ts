import { supabase } from '@/lib/supabase';

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

export interface ServiceMenu {
  id: string;
  category_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  base_price?: number;
  description?: string;
  is_active: boolean;
}

export class SalonServicesService {
  // --- Industries ---
  static async getIndustries() {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async getSalonIndustries(salonId: string) {
    const { data, error } = await supabase
      .from('salon_industries')
      .select('industry_id')
      .eq('salon_id', salonId);

    if (error) throw new Error(error.message);
    return data.map((item) => item.industry_id);
  }

  static async addSalonIndustry(salonId: string, industryId: string) {
    const { error } = await supabase.from('salon_industries').insert({
      salon_id: salonId,
      industry_id: industryId,
    });
    if (error) throw new Error(error.message);
  }

  static async removeSalonIndustry(salonId: string, industryId: string) {
    const { error } = await supabase
      .from('salon_industries')
      .delete()
      .eq('salon_id', salonId)
      .eq('industry_id', industryId);
    if (error) throw new Error(error.message);
  }

  // --- Categories ---
  static async getCategories(salonId: string) {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  static async createCategory(
    salonId: string,
    name: string,
    displayOrder: number
  ) {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        salon_id: salonId,
        name,
        display_order: displayOrder,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteCategory(categoryId: string) {
    const { error } = await supabase
      .from('service_categories')
      .update({ is_active: false, deleted_at: new Date() })
      .eq('id', categoryId);

    if (error) throw new Error(error.message);
  }

  // --- Services ---
  static async getServices(categoryId: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  static async createService(
    salonId: string,
    categoryId: string,
    serviceData: any
  ) {
    const { data, error } = await supabase
      .from('services')
      .insert({
        salon_id: salonId,
        category_id: categoryId,
        name: serviceData.name,
        duration_minutes: serviceData.duration,
        pricing_type: 'FIXED',
        base_price: parseFloat(serviceData.price) || 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteService(serviceId: string) {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId);

    if (error) throw new Error(error.message);
  }
}
