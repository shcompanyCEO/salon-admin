import { IndustriesResponse, ServiceCategory, ServiceMenu } from './types';

export const salonServicesApi = {
  getIndustries: async (salonId: string): Promise<IndustriesResponse> => {
    const res = await fetch(`/api/salons/${salonId}/services?type=industries`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  toggleIndustry: async (
    salonId: string,
    industryId: string,
    action: 'add_industry' | 'remove_industry'
  ) => {
    const res = await fetch(`/api/salons/${salonId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, industryId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  getCategories: async (salonId: string): Promise<ServiceCategory[]> => {
    const res = await fetch(`/api/salons/${salonId}/services?type=categories`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  createCategory: async (
    salonId: string,
    name: string,
    displayOrder: number
  ) => {
    const res = await fetch(`/api/salons/${salonId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_category', name, displayOrder }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  deleteCategory: async (salonId: string, id: string) => {
    const res = await fetch(`/api/salons/${salonId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_category', id }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  getServices: async (
    salonId: string,
    categoryId: string
  ): Promise<ServiceMenu[]> => {
    const res = await fetch(
      `/api/salons/${salonId}/services?type=services&categoryId=${categoryId}`
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  createService: async (
    salonId: string,
    categoryId: string,
    serviceData: any
  ) => {
    const res = await fetch(`/api/salons/${salonId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_service',
        categoryId,
        serviceData,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  deleteService: async (salonId: string, id: string) => {
    const res = await fetch(`/api/salons/${salonId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_service', id }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },
};
