import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { ApiResponse } from '@/types';

export const createChatApi = () => {
  return {
    getRooms: (params?: any): Promise<ApiResponse<any[]>> =>
      apiClient.get(endpoints.chat.rooms.path(), params),

    getRoom: (roomId: string): Promise<ApiResponse<any>> =>
      apiClient.get(endpoints.chat.room.path(roomId)),

    getMessages: (roomId: string, params?: any): Promise<ApiResponse<any[]>> =>
      apiClient.get(endpoints.chat.messages.path(roomId), params),

    markAsRead: (roomId: string) =>
      apiClient.post(endpoints.chat.markAsRead.path(roomId), {}),
  };
};
