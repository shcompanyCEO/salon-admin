// 사용자 역할
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SALON_MANAGER = 'SALON_MANAGER',
  DESIGNER = 'DESIGNER',
  CUSTOMER = 'CUSTOMER',
}

// 언어 타입
export type Locale = 'ko' | 'en' | 'th';

// 살롱 카테고리
export enum SalonCategory {
  HAIR = 'HAIR',
  NAIL = 'NAIL',
  MAKEUP = 'MAKEUP',
  MASSAGE = 'MASSAGE',
  CLINIC = 'CLINIC',
}

// 서비스 타입
export enum ServiceType {
  CUT = 'CUT',
  COLOR = 'COLOR',
  PERM = 'PERM',
  CLINIC = 'CLINIC',
  TREATMENT = 'TREATMENT',
}

// 예약 상태
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

// 사용자 인터페이스
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  salonId?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// 살롱 인터페이스
export interface Salon {
  id: string;
  name: string;
  category: SalonCategory;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  businessHours: BusinessHours[];
  images: string[];
  instagramUrl?: string;
  isWifiAvailable: boolean;
  isParkingAvailable: boolean;
  isApproved: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 영업시간
export interface BusinessHours {
  dayOfWeek: number; // 0: 일요일, 1: 월요일, ..., 6: 토요일
  openTime: string; // "09:00"
  closeTime: string; // "20:00"
  isOpen: boolean;
}

// 디자이너 인터페이스
export interface Designer {
  id: string;
  userId: string;
  salonId: string;
  name: string;
  description: string;
  experience: number; // 경력 (년)
  profileImage?: string;
  portfolioImages: string[];
  specialties: ServiceType[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  permissions: DesignerPermission[];
  createdAt: Date;
  updatedAt: Date;
}

// 디자이너 권한
export interface DesignerPermission {
  module: string; // 'bookings', 'customers', 'reviews', 'sales'
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

// 서비스 인터페이스
export interface Service {
  id: string;
  salonId: string;
  type: ServiceType;
  name: string;
  description: string;
  price: number;
  duration: number; // 분
  isActive: boolean;
}

// 예약 인터페이스
export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  salonId: string;
  designerId: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  source: 'ONLINE' | 'PHONE' | 'WALK_IN'; // 예약 출처
  createdAt: Date;
  updatedAt: Date;
}

// 고객 인터페이스
export interface Customer {
  id: string;
  customerNumber: string; // 자동 생성된 고객 번호
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  lastVisit?: Date;
  totalVisits: number;
  salonId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 리뷰 인터페이스
export interface Review {
  id: string;
  customerId: string;
  customerName: string;
  salonId: string;
  designerId: string;
  bookingId: string;
  rating: number; // 1-5
  comment: string;
  images: string[];
  response?: ReviewResponse;
  createdAt: Date;
  updatedAt: Date;
}

// 리뷰 응답
export interface ReviewResponse {
  responderId: string;
  responderName: string;
  responderRole: 'SALON_MANAGER' | 'DESIGNER';
  comment: string;
  createdAt: Date;
}

// 채팅 메시지
export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  images?: string[];
  isRead: boolean;
  createdAt: Date;
}

// 채팅방
export interface ChatRoom {
  id: string;
  customerId: string;
  customerName: string;
  salonId: string;
  salonName: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 매출 통계
export interface SalesStats {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalBookings: number;
  byService: ServiceSales[];
  byDesigner?: DesignerSales[];
}

export interface ServiceSales {
  serviceType: ServiceType;
  serviceName: string;
  count: number;
  revenue: number;
}

export interface DesignerSales {
  designerId: string;
  designerName: string;
  totalRevenue: number;
  totalBookings: number;
  byService: ServiceSales[];
}

// 알림
export interface Notification {
  id: string;
  userId: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'BOOKING_REMINDER' | 'REVIEW_NEW' | 'CHAT_NEW';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// 페이지네이션
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API 응답
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
