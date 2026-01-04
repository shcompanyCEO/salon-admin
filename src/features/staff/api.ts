import { ApiResponse } from '@/types';
import { Staff } from './types';

export const staffApi = {
  getStaffList: async (salonId: string): Promise<ApiResponse<Staff[]>> => {
    const response = await fetch(`/api/salons/${salonId}/staff`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff list');
    }
    return response.json();
  },

  updateStaff: async (
    salonId: string,
    staffId: string,
    updates: Partial<Staff>
  ) => {
    const response = await fetch(`/api/salons/${salonId}/staff/${staffId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update staff');
    }
    return response.json();
  },
};
