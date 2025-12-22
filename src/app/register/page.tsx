'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Scissors } from 'lucide-react';
import { Select } from '@/components/ui/Select';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  shopName: string;
  countryCode: string;
  phone: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      countryCode: '+82', // Default to Korea
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setIsLoading(true);

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('비밀번호가 일치하지 않습니다');
      }

      // Remove leading 0 from phone if present when using country code (optional, but good practice)
      // e.g. 010-1234 -> +82101234
      let cleanPhone = data.phone.replace(/-/g, ''); // Remove hyphens
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }

      const fullPhoneNumber = `${data.countryCode}${cleanPhone}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/register-owner`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: data.name,
            shopName: data.shopName,
            phone: fullPhoneNumber,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다');
      }

      // Success
      alert('회원가입이 완료되었습니다!\n로그인 페이지로 이동합니다.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900">Salon Admin</h1>
          <p className="text-secondary-600 mt-2">
            새로운 샵을 등록하고 시작하세요
          </p>
        </div>

        {/* Register form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-secondary-900 mb-6">
            회원가입 (원장님 전용)
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="email@example.com"
              {...register('email', {
                required: '이메일을 입력해주세요',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: '올바른 이메일 형식이 아닙니다',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="이름 (원장님 성함)"
              type="text"
              placeholder="홍길동"
              {...register('name', {
                required: '이름을 입력해주세요',
              })}
              error={errors.name?.message}
            />

            <Input
              label="매장 이름"
              type="text"
              placeholder="헤어샵_강남점"
              {...register('shopName', {
                required: '매장 이름을 입력해주세요',
                pattern: {
                  value: /^[a-zA-Z0-9_가-힣]+$/,
                  message:
                    '한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다 (띄어쓰기, 하이픈 불가)',
                },
              })}
              error={errors.shopName?.message}
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                매장 전화번호
              </label>
              <div className="flex gap-2">
                <div className="w-32">
                  <Select
                    options={[
                      { value: '+82', label: 'KR (+82)' },
                      { value: '+66', label: 'TH (+66)' },
                    ]}
                    {...register('countryCode')}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="tel"
                    placeholder="010-1234-5678"
                    className="mt-0" // Reset Input margin if needed
                    {...register('phone', {
                      required: '전화번호를 입력해주세요',
                    })}
                    error={errors.phone?.message}
                  />
                </div>
              </div>
            </div>

            <Input
              label="비밀번호"
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: '비밀번호를 입력해주세요',
                minLength: {
                  value: 6,
                  message: '비밀번호는 최소 6자 이상이어야 합니다',
                },
              })}
              error={errors.password?.message}
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: '비밀번호를 다시 입력해주세요',
                validate: (val: string) => {
                  if (watch('password') != val) {
                    return '비밀번호가 일치하지 않습니다';
                  }
                },
              })}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              회원가입 완료
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              이미 계정이 있으신가요?{' '}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                로그인하기
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
