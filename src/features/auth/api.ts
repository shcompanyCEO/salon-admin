import { supabase } from '@/lib/supabase';
import {
  RegisterOwnerParams,
  CheckDuplicateParams,
  CheckDuplicateResponse,
} from './types';

export const authApi = {
  checkDuplicate: async ({
    type,
    value,
  }: CheckDuplicateParams): Promise<CheckDuplicateResponse> => {
    const { data, error } = await supabase.functions.invoke('check-duplicate', {
      body: { type, value },
    });

    if (error) throw error;
    return data;
  },

  registerOwner: async (params: RegisterOwnerParams) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-owner`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '회원가입에 실패했습니다');
    }

    return result;
  },
};
