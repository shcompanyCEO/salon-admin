import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types';

export const createReviewsApi = () => {
  return {
    getReviews: (params?: any): Promise<ApiResponse<any[]>> =>
      apiClient.get(endpoints.reviews.all.path(), params),

    getReview: (id: string): Promise<ApiResponse<any>> =>
      apiClient.get(endpoints.reviews.detail.path(id)),

    respondToReview: (id: string, response: string) =>
      apiClient.post(endpoints.reviews.respond.path(id), { response }),
  };
};
