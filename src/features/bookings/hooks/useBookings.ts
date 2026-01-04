import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api';
import { Booking } from '../types';

export const useBookings = (
  salonId: string,
  options?: { enabled?: boolean }
) => {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings', salonId],
    queryFn: () => bookingsApi.getBookings(salonId),
    enabled: !!salonId && options?.enabled,
  });

  const createBookingMutation = useMutation({
    mutationFn: ({ booking }: { booking: Partial<Booking> }) =>
      bookingsApi.createBooking(salonId, booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', salonId] });
    },
  });

  return {
    ...bookingsQuery,
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
  };
};
