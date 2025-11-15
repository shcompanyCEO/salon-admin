import { ApiResponse } from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        return state?.token || null;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }

    return null;
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file
  async upload<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();

    const headers: HeadersInit = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API 엔드포인트 헬퍼 함수들
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () => apiClient.post('/auth/logout'),

  register: (data: any) => apiClient.post('/auth/register', data),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),
};

export const salonApi = {
  getSalons: (params?: any) => apiClient.get('/salons', params),

  getSalon: (id: string) => apiClient.get(`/salons/${id}`),

  createSalon: (data: any) => apiClient.post('/salons', data),

  updateSalon: (id: string, data: any) => apiClient.put(`/salons/${id}`, data),

  deleteSalon: (id: string) => apiClient.delete(`/salons/${id}`),

  approveSalon: (id: string) => apiClient.post(`/salons/${id}/approve`),
};

export const designerApi = {
  getDesigners: (salonId: string, params?: any) =>
    apiClient.get(`/salons/${salonId}/designers`, params),

  getDesigner: (id: string) => apiClient.get(`/designers/${id}`),

  createDesigner: (salonId: string, data: any) =>
    apiClient.post(`/salons/${salonId}/designers`, data),

  updateDesigner: (id: string, data: any) =>
    apiClient.put(`/designers/${id}`, data),

  deleteDesigner: (id: string) => apiClient.delete(`/designers/${id}`),
};

//service
export const serviceApi = {
  getServices: (salonId: string, params?: any) =>
    apiClient.get(`/salons/${salonId}/services`, params),

  getService: (id: string) => apiClient.get(`/services/${id}`),

  createService: (salonId: string, data: any) =>
    apiClient.post(`/salons/${salonId}/services`, data),

  updateService: (id: string, data: any) =>
    apiClient.put(`/services/${id}`, data),

  deleteService: (id: string) => apiClient.delete(`/services/${id}`),
};
//booking
export const bookingApi = {
  getBookings: (params?: any) => apiClient.get('/bookings', params),

  getBooking: (id: string) => apiClient.get(`/bookings/${id}`),

  createBooking: (data: any) => apiClient.post('/bookings', data),

  updateBooking: (id: string, data: any) =>
    apiClient.put(`/bookings/${id}`, data),

  cancelBooking: (id: string) => apiClient.post(`/bookings/${id}/cancel`),

  completeBooking: (id: string) => apiClient.post(`/bookings/${id}/complete`),
};
//customer
export const customerApi = {
  getCustomers: (salonId: string, params?: any) =>
    apiClient.get(`/salons/${salonId}/customers`, params),

  getCustomer: (id: string) => apiClient.get(`/customers/${id}`),

  createCustomer: (salonId: string, data: any) =>
    apiClient.post(`/salons/${salonId}/customers`, data),

  updateCustomer: (id: string, data: any) =>
    apiClient.put(`/customers/${id}`, data),

  deleteCustomer: (id: string) => apiClient.delete(`/customers/${id}`),
};

//review
export const reviewApi = {
  getReviews: (params?: any) => apiClient.get('/reviews', params),

  getReview: (id: string) => apiClient.get(`/reviews/${id}`),

  respondToReview: (id: string, comment: string) =>
    apiClient.post(`/reviews/${id}/respond`, { comment }),
};

//sales
export const salesApi = {
  getSalesStats: (salonId: string, params: any) =>
    apiClient.get(`/salons/${salonId}/sales`, params),

  getDesignerSales: (designerId: string, params: any) =>
    apiClient.get(`/designers/${designerId}/sales`, params),
};
//chat
export const chatApi = {
  getRooms: (params?: any) => apiClient.get('/chat/rooms', params),

  getRoom: (roomId: string) => apiClient.get(`/chat/rooms/${roomId}`),

  getMessages: (roomId: string, params?: any) =>
    apiClient.get(`/chat/rooms/${roomId}/messages`, params),

  sendMessage: (roomId: string, data: any) =>
    apiClient.post(`/chat/rooms/${roomId}/messages`, data),

  markAsRead: (roomId: string) => apiClient.post(`/chat/rooms/${roomId}/read`),
};

//file upload
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload('/upload/image', formData);
  },

  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiClient.upload('/upload/images', formData);
  },
};
