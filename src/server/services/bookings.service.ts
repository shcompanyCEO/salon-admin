import { Booking, BookingStatus } from '@/types';

// Mock Data (Moved from frontend)
const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: '홍길동',
    customerPhone: '010-1234-5678',
    salonId: 's1',
    staffId: 'd1',
    serviceId: 'sv1',
    serviceName: '커트',
    date: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    status: BookingStatus.CONFIRMED,
    price: 35000,
    source: 'ONLINE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    customerId: 'c2',
    customerName: '김영희',
    customerPhone: '010-2345-6789',
    salonId: 's1',
    staffId: 'd2',
    serviceId: 'sv2',
    serviceName: '염색',
    date: new Date(),
    startTime: '14:00',
    endTime: '16:00',
    status: BookingStatus.PENDING,
    price: 120000,
    source: 'PHONE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export class BookingService {
  static async getBookings(salonId: string, filters?: any) {
    if (!salonId) {
      throw new Error('Salon ID is required');
    }

    // In a real app, we would query the DB here using supabase
    // For now, return mock data
    return MOCK_BOOKINGS;
  }

  static async createBooking(salonId: string, bookingData: any) {
    // Mock creation
    const newBooking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      salonId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_BOOKINGS.push(newBooking);
    return newBooking;
  }
}
