/**
 * React Query - Mutation 함수 정의
 * POST, PUT, PATCH, DELETE 요청에 사용되는 뮤테이션들
 */

import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from './client';
import { queryKeys } from './endpoints';
import { ApiResponse, User } from '@/types';
import { signInWithEmail, signOut as supabaseSignOut } from '../auth';
import { useAuthStore } from '@/store/authStore';

// ============================================
// 인증 Mutations
// ============================================

interface LoginResponse {
  user: User;
  token: string;
}
//로그인
export const useLogin = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<LoginResponse>,
      Error,
      { email: string; password: string }
    >,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const result = await signInWithEmail(email, password);

      if (result.error || !result.user || !result.token) {
        return {
          success: false,
          error: result.error || '로그인에 실패했습니다',
        } as ApiResponse<LoginResponse>;
      }

      return {
        success: true,
        data: {
          user: result.user,
          token: result.token,
        },
      } as ApiResponse<LoginResponse>;
    },
    ...options,
  });
};

//로그아웃
export const useLogout = (
  options?: Omit<
    UseMutationOptions<ApiResponse<void>, Error, void>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Supabase 로그아웃
      const result = await supabaseSignOut();

      if (result.error) {
        return {
          success: false,
          error: result.error,
        } as ApiResponse<void>;
      }

      // authStore에서 상태 초기화 및 localStorage 삭제
      // Note: useAuthStore.getState().logout()로 호출
      const { logout } = useAuthStore.getState();
      logout();

      return {
        success: true,
      } as ApiResponse<void>;
    },
    onSuccess: () => {
      // 로그아웃 시 모든 React Query 캐시 초기화
      queryClient.clear();
    },
    ...options,
  });
};
//회원가입
export const useRegister = (
  options?: Omit<UseMutationOptions<ApiResponse<any>, Error, any>, 'mutationFn'>
) => {
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/auth/register', data),
    ...options,
  });
};

//비밀번호 찾기
export const useForgotPassword = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post('/auth/forgot-password', { email }),
    ...options,
  });
};

//비밀번호 재설정
export const useResetPassword = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<any>,
      Error,
      { token: string; password: string }
    >,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      apiClient.post('/auth/reset-password', { token, password }),
    ...options,
  });
};

// ============================================
// 살롱 Mutations
// ============================================

//살롱 생성
export const useCreateSalon = (
  options?: Omit<UseMutationOptions<ApiResponse<any>, Error, any>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/salons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salons });
    },
    ...options,
  });
};

//살롱 수정
export const useUpdateSalon = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { id: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/salons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salons });
    },
    ...options,
  });
};

//살롱 삭제
export const useDeleteSalon = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/salons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salons });
    },
    ...options,
  });
};

export const useApproveSalon = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/salons/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salons });
    },
    ...options,
  });
};

// ============================================
// 디자이너 Mutations
// ============================================

export const useCreateDesigner = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { salonId: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, data }: { salonId: string; data: any }) =>
      apiClient.post(`/salons/${salonId}/designers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designers });
      queryClient.invalidateQueries({ queryKey: queryKeys.salons });
    },
    ...options,
  });
};

//디자이너 수정
export const useUpdateDesigner = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { id: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/designers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designers });
    },
    ...options,
  });
};

//디자이너 삭제
export const useDeleteDesigner = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/designers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designers });
    },
    ...options,
  });
};

// ============================================
// 서비스 Mutations
// ============================================

//서비스 생성
export const useCreateService = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { salonId: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, data }: { salonId: string; data: any }) =>
      apiClient.post(`/salons/${salonId}/services`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
      queryClient.invalidateQueries({ queryKey: queryKeys.salons });
    },
    ...options,
  });
};

//서비스 수정
export const useUpdateService = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { id: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
    ...options,
  });
};

//서비스 삭제
export const useDeleteService = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
    ...options,
  });
};

// ============================================
// 예약 Mutations
// ============================================

//예약 생성
export const useCreateBooking = (
  options?: Omit<UseMutationOptions<ApiResponse<any>, Error, any>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.post('/bookings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    ...options,
  });
};

//예약 수정
export const useUpdateBooking = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { id: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    ...options,
  });
};

//예약 취소
export const useCancelBooking = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    ...options,
  });
};

//예약 완료
export const useCompleteBooking = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/bookings/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
    ...options,
  });
};

// ============================================
// 고객 Mutations
// ============================================

//고객 생성
export const useCreateCustomer = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { salonId: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ salonId, data }: { salonId: string; data: any }) =>
      apiClient.post(`/salons/${salonId}/customers`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
    ...options,
  });
};

//고객 수정
export const useUpdateCustomer = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { id: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.put(`/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
    ...options,
  });
};

//고객 삭제
export const useDeleteCustomer = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
    },
    ...options,
  });
};

// ============================================
// 리뷰 Mutations
// ============================================

//리뷰 답변
export const useRespondToReview = (
  options?: Omit<
    UseMutationOptions<
      ApiResponse<any>,
      Error,
      { id: string; comment: string }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      apiClient.post(`/reviews/${id}/respond`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews });
    },
    ...options,
  });
};

// ============================================
// 채팅 Mutations
// ============================================

//채팅 메시지 보내기
export const useSendMessage = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, { roomId: string; data: any }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: any }) =>
      apiClient.post(`/chat/rooms/${roomId}/messages`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat });
    },
    ...options,
  });
};

//채팅 읽음 표시
export const useMarkChatAsRead = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, string>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) =>
      apiClient.post(`/chat/rooms/${roomId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat });
    },
    ...options,
  });
};

// ============================================
// 파일 업로드 Mutations
// ============================================

//이미지 업로드
export const useUploadImage = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, File>,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.upload('/upload/image', formData);
    },
    ...options,
  });
};

//이미지 여러장 업로드
export const useUploadImages = (
  options?: Omit<
    UseMutationOptions<ApiResponse<any>, Error, File[]>,
    'mutationFn'
  >
) => {
  return useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      return apiClient.upload('/upload/images', formData);
    },
    ...options,
  });
};
