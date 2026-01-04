/**
 * API 엔드포인트 및 Query Key 정의
 * Query Key는 React Query의 캐싱과 무효화에 사용됩니다.
 */

export const endpoints = {
  // 인증
  auth: {
    login: () => ['/auth/login'] as const,
    logout: () => ['/auth/logout'] as const,
    register: () => ['/auth/register'] as const,
    forgotPassword: () => ['/auth/forgot-password'] as const,
    resetPassword: () => ['/auth/reset-password'] as const,
    me: () => ['auth', 'me'] as const,
  },

  // 살롱
  salons: {
    all: (params?: any) => ['/salons', params] as const,
    detail: (id: string) => ['/salons', id] as const,
    approve: (id: string) => [`/salons/${id}/approve`] as const,

    // 살롱 내 직원(Staff)
    staff: (salonId: string, params?: any) =>
      [`/salons/${salonId}/staff`, params] as const,

    // 살롱 내 서비스
    services: (salonId: string, params?: any) =>
      [`/salons/${salonId}/services`, params] as const,

    // 살롱 내 고객
    customers: (salonId: string, params?: any) =>
      [`/salons/${salonId}/customers`, params] as const,

    // 살롱 매출
    sales: (salonId: string, params: any) =>
      [`/salons/${salonId}/sales`, params] as const,
  },

  // 직원(Staff)
  staff: {
    all: (params?: any) => ['/staff', params] as const,
    detail: (id: string) => ['/staff', id] as const,
    sales: (staffId: string, params: any) =>
      [`/staff/${staffId}/sales`, params] as const,
  },

  // 서비스
  services: {
    all: (params?: any) => ['/services', params] as const,
    detail: (id: string) => ['/services', id] as const,
  },

  // 예약
  bookings: {
    all: (params?: any) => ['/bookings', params] as const,
    detail: (id: string) => ['/bookings', id] as const,
    cancel: (id: string) => [`/bookings/${id}/cancel`] as const,
    complete: (id: string) => [`/bookings/${id}/complete`] as const,
  },

  // 고객
  customers: {
    all: (params?: any) => ['/customers', params] as const,
    detail: (id: string) => ['/customers', id] as const,
  },

  // 리뷰
  reviews: {
    all: (params?: any) => ['/reviews', params] as const,
    detail: (id: string) => ['/reviews', id] as const,
    respond: (id: string) => [`/reviews/${id}/respond`] as const,
  },

  // 채팅
  chat: {
    rooms: (params?: any) => ['/chat/rooms', params] as const,
    room: (roomId: string) => ['/chat/rooms', roomId] as const,
    messages: (roomId: string, params?: any) =>
      [`/chat/rooms/${roomId}/messages`, params] as const,
    markAsRead: (roomId: string) => [`/chat/rooms/${roomId}/read`] as const,
  },

  // 파일 업로드
  upload: {
    image: () => ['/upload/image'] as const,
    images: () => ['/upload/images'] as const,
  },
} as const;

/**
 * Query Key Factory
 * 특정 도메인의 모든 쿼리를 무효화할 때 사용
 */
export const queryKeys = {
  auth: ['auth'] as const,
  salons: ['salons'] as const,
  staff: ['staff'] as const,
  services: ['services'] as const,
  bookings: ['bookings'] as const,
  customers: ['customers'] as const,
  reviews: ['reviews'] as const,
  chat: ['chat'] as const,
  upload: ['upload'] as const,
  designers: ['designers'] as const,
} as const;
