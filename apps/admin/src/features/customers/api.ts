import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export const createCustomersApi = (client?: SupabaseClient<any>) => {
  return {
    getCustomers: (salonId: string): Promise<ApiResponse<any[]>> =>
      apiClient.get(endpoints.salons.customers.path(salonId)),

    getCustomer: (salonId: string, id: string): Promise<ApiResponse<any>> =>
      apiClient.get(endpoints.salons.customers.path(salonId), { id }),

    createCustomer: (salonId: string, customer: any) =>
      apiClient.post(endpoints.salons.customers.path(salonId), {
        action: 'create_customer',
        ...customer,
      }),

    updateCustomer: (salonId: string, id: string, updates: any) =>
      apiClient.post(endpoints.salons.customers.path(salonId), {
        action: 'update_customer',
        id,
        updates,
      }),

    deleteCustomer: (salonId: string, id: string) =>
      apiClient.post(endpoints.salons.customers.path(salonId), {
        action: 'delete_customer',
        id,
      }),
  };
};
