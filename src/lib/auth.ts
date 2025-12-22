/**
 * Supabase 인증 서비스
 */

import { supabase } from './supabase';
import { User, UserRole } from '@/types';

interface AuthResponse {
  user: User | null;
  token: string | null;
  error?: string;
}

/**
 * 이메일/비밀번호로 로그인
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Supabase 인증
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        user: null,
        token: null,
        error: authError.message,
      };
    }

    if (!authData.user || !authData.session) {
      return {
        user: null,
        token: null,
        error: '로그인에 실패했습니다',
      };
    }

    // users 테이블에서 추가 정보 조회
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      // users 테이블에 데이터가 없는 경우, auth.users의 기본 정보로 User 객체 생성
      // 기본 role을 SALON_MANAGER로 설정 (임시)
      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
        phone: authData.user.user_metadata?.phone || '',
        role: (authData.user.user_metadata?.role as UserRole) || UserRole.SALON_MANAGER,
        profileImage: authData.user.user_metadata?.avatar_url,
        createdAt: new Date(authData.user.created_at),
        updatedAt: new Date(authData.user.updated_at || authData.user.created_at),
        isActive: true,
      };

      return {
        user,
        token: authData.session.access_token,
      };
    }

    // users 테이블 데이터를 User 타입으로 변환
    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || '',
      // Normalize role to uppercase and fallback to SALON_MANAGER if missing
      role: (userData.role?.toUpperCase() as UserRole) || UserRole.SALON_MANAGER,
      salonId: userData.salon_id,
      profileImage: userData.profile_image,
      createdAt: new Date(userData.created_at),
      updatedAt: new Date(userData.updated_at),
      isActive: userData.is_active ?? true,
    };

    return {
      user,
      token: authData.session.access_token,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      user: null,
      token: null,
      error: '로그인 중 오류가 발생했습니다',
    };
  }
}

/**
 * 이메일/비밀번호로 회원가입
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: {
    name: string;
    phone?: string;
    role?: UserRole;
  }
): Promise<AuthResponse> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata.name,
          phone: metadata.phone,
          role: metadata.role || UserRole.CUSTOMER,
        },
      },
    });

    if (authError) {
      return {
        user: null,
        token: null,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        user: null,
        token: null,
        error: '회원가입에 실패했습니다',
      };
    }

    // users 테이블에 사용자 정보 저장
    const { error: insertError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: authData.user.email!,
      name: metadata.name,
      phone: metadata.phone || '',
      role: metadata.role || UserRole.CUSTOMER,
      is_active: true,
    });

    if (insertError) {
      console.error('Error inserting user data:', insertError);
    }

    const user: User = {
      id: authData.user.id,
      email: authData.user.email!,
      name: metadata.name,
      phone: metadata.phone || '',
      role: metadata.role || UserRole.CUSTOMER,
      createdAt: new Date(authData.user.created_at),
      updatedAt: new Date(authData.user.created_at),
      isActive: true,
    };

    return {
      user,
      token: authData.session?.access_token || null,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      user: null,
      token: null,
      error: '회원가입 중 오류가 발생했습니다',
    };
  }
}

/**
 * 로그아웃
 */
export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (error) {
    console.error('Signout error:', error);
    return { error: '로그아웃 중 오류가 발생했습니다' };
  }
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Get session error:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * 비밀번호 재설정 이메일 보내기
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다' };
  }
}

/**
 * 비밀번호 업데이트
 */
export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    console.error('Update password error:', error);
    return { error: '비밀번호 업데이트 중 오류가 발생했습니다' };
  }
}
