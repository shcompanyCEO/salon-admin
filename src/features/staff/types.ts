import { UserRole } from '@/types';

export interface StaffPermission {
  module: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface Staff {
  id: string;
  userId: string;
  salonId: string;
  name: string;
  description: string;
  experience: number;
  profileImage?: string;
  portfolioImages: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  permissions: StaffPermission[];
  createdAt: Date;
  updatedAt: Date;
  phone?: string;
  role?: UserRole;
}
