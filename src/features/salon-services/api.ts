import { apiClient } from '@/lib/api/client';
import { supabase } from '@/lib/supabase';
import {
  Industry,
  SalonIndustry,
  ServiceCategory,
  ServiceMenu,
  IndustriesResponse,
} from './types';

export const salonServicesApi = {
  getIndustries: async (salonId: string): Promise<IndustriesResponse> => {
    const response = await apiClient.get<IndustriesResponse>(
      `/salons/${salonId}/services?type=industries`
    );
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  toggleIndustry: async (
    salonId: string,
    industryId: string,
    action: 'add_industry' | 'remove_industry'
  ) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action,
      industryId,
    });
    return response.data;
  },

  reorderIndustries: async (salonId: string, orderedIndustryIds: string[]) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'reorder_industries',
      orderedIndustryIds,
    });
    return response.data;
  },

  getCategories: async (salonId: string): Promise<ServiceCategory[]> => {
    const response = await apiClient.get<ServiceCategory[]>(
      `/salons/${salonId}/services?type=categories`
    );
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  createCategory: async (
    salonId: string,
    name: string,
    displayOrder: number,
    industryId?: string
  ) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'create_category',
      name,
      displayOrder,
      industryId,
    });
    return response.data;
  },

  deleteCategory: async (salonId: string, id: string) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'delete_category',
      id,
    });
    return response.data;
  },

  updateCategory: async (
    salonId: string,
    categoryId: string,
    updates: {
      name?: string;
      displayOrder?: number;
      industryId?: string | null;
    }
  ) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'update_category',
      id: categoryId,
      updates,
    });
    return response.data;
  },

  getServices: async (
    salonId: string,
    categoryId?: string
  ): Promise<ServiceMenu[]> => {
    const queryParams = new URLSearchParams({ type: 'services' });
    if (categoryId) queryParams.append('categoryId', categoryId);

    const response = await apiClient.get<ServiceMenu[]>(
      `/salons/${salonId}/services?${queryParams.toString()}`
    );
    if (!response.data) throw new Error('No data received');
    return response.data;
  },

  createService: async (
    salonId: string,
    categoryId: string,
    serviceData: any
  ) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'create_service',
      categoryId,
      serviceData,
    });
    return response.data;
  },

  deleteService: async (salonId: string, id: string) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'delete_service',
      id,
    });
    return response.data;
  },

  updateService: async (
    salonId: string,
    id: string,
    updates: { name?: string; price?: number; duration?: number }
  ) => {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'update_service',
      id,
      updates,
    });
    return response.data;
  },

  async updateCategoryOrder(
    salonId: string,
    categories: { id: string; display_order: number }[]
  ) {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'reorder_categories',
      categories,
    });
    return response.data;
  },

  async reorderServices(
    salonId: string,
    services: { id: string; display_order: number }[]
  ) {
    const response = await apiClient.post<any>(`/salons/${salonId}/services`, {
      action: 'reorder_services',
      services,
    });
    return response.data;
  },
};
