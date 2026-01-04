import { ApiResponse } from '@/types';
import { Booking } from './types';

export const bookingsApi = {
  getBookings: async (salonId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await fetch(`/api/salons/${salonId}/bookings`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return response.json();
  },

  createBooking: async (salonId: string, booking: Partial<Booking>) => {
    const response = await fetch(`/api/salons/${salonId}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }
    return response.json();
  },
};
