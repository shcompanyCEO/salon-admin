import { SupabaseClient } from '@supabase/supabase-js';

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
  pricing_type: string;
  description?: string;
  is_active: boolean;
}

export class SalonServicesService {
  // --- Industries ---
  static async getIndustries(client: SupabaseClient) {
    const { data, error } = await client
      .from('industries')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async getSalonIndustries(client: SupabaseClient, salonId: string) {
    try {
      // Try to fetch with display_order
      const { data, error } = await client
        .from('salon_industries')
        .select(
          `
        industry_id,
        display_order,
        industries (
          id,
          name
        )
      `
        )
        .eq('salon_id', salonId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      return data.map((item: any) => ({
        id: item.industry_id,
        name: item.industries?.name,
        displayOrder: item.display_order,
      }));
    } catch (error: any) {
      // Fallback: If display_order doesn't exist, fetch without it
      if (error.message?.includes('display_order') || error.code === '42703') {
        const { data, error: retryError } = await client
          .from('salon_industries')
          .select(
            `
          industry_id,
          industries (
            id,
            name
          )
        `
          )
          .eq('salon_id', salonId);
        // .order('created_at'); // Fallback order if needed

        if (retryError) throw new Error(retryError.message);

        return data.map((item: any) => ({
          id: item.industry_id,
          name: item.industries?.name,
          displayOrder: 0, // Default value
        }));
      }
      throw new Error(error.message);
    }
  }

  static async addSalonIndustry(
    client: SupabaseClient,
    salonId: string,
    industryId: string
  ) {
    const { error } = await client.from('salon_industries').insert({
      salon_id: salonId,
      industry_id: industryId,
    });
    if (error) throw new Error(error.message);
  }

  static async removeSalonIndustry(
    client: SupabaseClient,
    salonId: string,
    industryId: string
  ) {
    const { error } = await client
      .from('salon_industries')
      .delete()
      .eq('salon_id', salonId)
      .eq('industry_id', industryId);
    if (error) throw new Error(error.message);
  }
  static async reorderIndustries(
    client: SupabaseClient,
    salonId: string,
    orderedIndustryIds: string[]
  ) {
    // Perform bulk update using upsert or sequential updates
    // For simplicity with ordered list, we update one by one or construct a query
    // Supabase JS doesn't have a simple bulk update for different values easily without RPC
    // We will use Promise.all for now as the list is small (industries < 20 usually)

    const updates = orderedIndustryIds.map((industryId, index) =>
      client
        .from('salon_industries')
        .update({ display_order: index })
        .eq('salon_id', salonId)
        .eq('industry_id', industryId)
    );

    await Promise.all(updates);
  }

  // --- Categories ---
  static async getCategories(client: SupabaseClient, salonId: string) {
    const { data, error } = await client
      .from('service_categories')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  static async createCategory(
    client: SupabaseClient,
    salonId: string,
    name: string,
    displayOrder: number,
    industryId?: string
  ) {
    const { data, error } = await client
      .from('service_categories')
      .insert({
        salon_id: salonId,
        name,
        display_order: displayOrder,
        industry_id: industryId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteCategory(client: SupabaseClient, categoryId: string) {
    // 1. Delete all services in this category first
    const { error: servicesError } = await client
      .from('services')
      .delete()
      .eq('category_id', categoryId);

    if (servicesError) throw new Error(servicesError.message);

    // 2. Delete the category
    const { error } = await client
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw new Error(error.message);
  }

  static async updateCategory(
    client: SupabaseClient,
    categoryId: string,
    updates: {
      name?: string;
      displayOrder?: number;
      industryId?: string | null;
    }
  ) {
    const { data, error } = await client
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // --- Services ---
  static async getServices(
    client: SupabaseClient,
    salonId: string,
    categoryId?: string
  ) {
    let query = client
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data;
  }

  static async createService(
    client: SupabaseClient,
    salonId: string,
    categoryId: string,
    serviceData: any
  ) {
    const { data, error } = await client
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

  static async deleteService(client: SupabaseClient, serviceId: string) {
    const { error } = await client
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) throw new Error(error.message);
  }

  static async updateService(
    client: SupabaseClient,
    serviceId: string,
    updates: { name?: string; price?: number; duration?: number }
  ) {
    const { data, error } = await client
      .from('services')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.price && { base_price: updates.price }),
        ...(updates.duration && { duration_minutes: updates.duration }),
      })
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async reorderCategories(
    client: SupabaseClient,
    salonId: string,
    categories: { id: string; display_order: number }[]
  ) {
    const updates = categories.map((cat) =>
      client
        .from('service_categories')
        .update({ display_order: cat.display_order })
        .eq('id', cat.id)
        .eq('salon_id', salonId)
    );

    await Promise.all(updates);
  }

  static async reorderServices(
    client: SupabaseClient,
    salonId: string,
    services: { id: string; display_order: number }[]
  ) {
    const updates = services.map((service) =>
      client
        .from('services')
        .update({ display_order: service.display_order })
        .eq('id', service.id)
        .eq('salon_id', salonId)
    );

    await Promise.all(updates);
  }
}
