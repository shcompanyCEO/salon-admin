/**
 * React Query - Query 함수 정의
 * GET 요청에 사용되는 쿼리들
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import { endpoints } from './endpoints';
import { ApiResponse } from '@/types';

// ============================================
// 살롱 Queries
// ============================================

export const useSalons = (params?: any, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.salons.all(params),
    queryFn: () => apiClient.get('/salons', params),
    ...options,
  });
};

export const useSalon = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.salons.detail(id),
    queryFn: () => apiClient.get(`/salons/${id}`),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// 디자이너 Queries
// ============================================

export const useDesigners = (
  salonId: string,
  params?: any,
  options?: UseQueryOptions
) => {
  return useQuery({
    queryKey: endpoints.salons.designers(salonId, params),
    queryFn: () => apiClient.get(`/salons/${salonId}/designers`, params),
    enabled: !!salonId,
    ...options,
  });
};

export const useDesigner = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.designers.detail(id),
    queryFn: () => apiClient.get(`/designers/${id}`),
    enabled: !!id,
    ...options,
  });
};

export const useDesignerSales = (
  designerId: string,
  params: any,
  options?: UseQueryOptions
) => {
  return useQuery({
    queryKey: endpoints.designers.sales(designerId, params),
    queryFn: () => apiClient.get(`/designers/${designerId}/sales`, params),
    enabled: !!designerId,
    ...options,
  });
};

// ============================================
// 서비스 Queries
// ============================================

export const useServices = (
  salonId: string,
  params?: any,
  options?: UseQueryOptions
) => {
  return useQuery({
    queryKey: endpoints.salons.services(salonId, params),
    queryFn: () => apiClient.get(`/salons/${salonId}/services`, params),
    enabled: !!salonId,
    ...options,
  });
};

export const useService = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.services.detail(id),
    queryFn: () => apiClient.get(`/services/${id}`),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// 예약 Queries
// ============================================

export const useBookings = (params?: any, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.bookings.all(params),
    queryFn: () => apiClient.get('/bookings', params),
    ...options,
  });
};

export const useBooking = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.bookings.detail(id),
    queryFn: () => apiClient.get(`/bookings/${id}`),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// 고객 Queries
// ============================================

export const useCustomers = (
  salonId: string,
  params?: any,
  options?: UseQueryOptions
) => {
  return useQuery({
    queryKey: endpoints.salons.customers(salonId, params),
    queryFn: () => apiClient.get(`/salons/${salonId}/customers`, params),
    enabled: !!salonId,
    ...options,
  });
};

export const useCustomer = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.customers.detail(id),
    queryFn: () => apiClient.get(`/customers/${id}`),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// 리뷰 Queries
// ============================================

export const useReviews = (params?: any, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.reviews.all(params),
    queryFn: () => apiClient.get('/reviews', params),
    ...options,
  });
};

export const useReview = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.reviews.detail(id),
    queryFn: () => apiClient.get(`/reviews/${id}`),
    enabled: !!id,
    ...options,
  });
};

// ============================================
// 매출 Queries
// ============================================

export const useSalonSales = (
  salonId: string,
  params: any,
  options?: UseQueryOptions
) => {
  return useQuery({
    queryKey: endpoints.salons.sales(salonId, params),
    queryFn: () => apiClient.get(`/salons/${salonId}/sales`, params),
    enabled: !!salonId,
    ...options,
  });
};

// ============================================
// 채팅 Queries
// ============================================

export const useChatRooms = (params?: any, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.chat.rooms(params),
    queryFn: () => apiClient.get('/chat/rooms', params),
    ...options,
  });
};

export const useChatRoom = (roomId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: endpoints.chat.room(roomId),
    queryFn: () => apiClient.get(`/chat/rooms/${roomId}`),
    enabled: !!roomId,
    ...options,
  });
};

export const useChatMessages = (
  roomId: string,
  params?: any,
  options?: UseQueryOptions
) => {
  return useQuery({
    queryKey: endpoints.chat.messages(roomId, params),
    queryFn: () => apiClient.get(`/chat/rooms/${roomId}/messages`, params),
    enabled: !!roomId,
    ...options,
  });
};
