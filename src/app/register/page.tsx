'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Scissors, Check, X, Loader2 } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { supabase } from '@/lib/supabase';

// Default industries matching the DB seed
const INDUSTRIES = [
  { label: '헤어샵', value: 'HAIR' },
  { label: '네일샵', value: 'NAIL' },
  { label: '에스테틱', value: 'ESTHETIC' },
  { label: '마사지', value: 'MASSAGE' },
  { label: '바버샵', value: 'BARBERSHOP' },
];

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  shopName: string;
  countryCode: string;
  phone: string;
  industryNames: string[]; // Multi-select
}

type CheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Duplicate Check States
  const [emailStatus, setEmailStatus] = useState<CheckStatus>('idle');
  const [shopNameStatus, setShopNameStatus] = useState<CheckStatus>('idle');
  const [emailMessage, setEmailMessage] = useState('');
  const [shopNameMessage, setShopNameMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      countryCode: '+82', // Default to Korea
      industryNames: [],
    },
  });

  // Watch for validation
  const industryNames = watch('industryNames');
  const email = watch('email');
  const shopName = watch('shopName');

  const toggleIndustry = (value: string) => {
    const current = industryNames || [];
    if (current.includes(value)) {
      setValue(
        'industryNames',
        current.filter((i) => i !== value)
      );
    } else {
      setValue('industryNames', [...current, value]);
    }
  };

  const checkDuplicate = async (type: 'email' | 'shopName', value: string) => {
    if (!value) return;

    // Trigger basic validation first
    const isValid = await trigger(type);
    if (!isValid) return;

    const setStatus = type === 'email' ? setEmailStatus : setShopNameStatus;
    const setMessage = type === 'email' ? setEmailMessage : setShopNameMessage;

    setStatus('checking');
    setMessage('');

    try {
      const { data, error } = await supabase.functions.invoke(
        'check-duplicate',
        {
          body: { type, value },
        }
      );

      if (error) throw error;

      if (data.available) {
        setStatus('available');
        setMessage(data.message || '사용 가능합니다.');
      } else {
        setStatus('taken');
        setMessage(data.message || '이미 사용 중입니다.');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />;
      case 'available':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'taken':
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'taken':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setError('');

    // Pre-flight validation checks
    if (emailStatus !== 'available') {
      setError('이메일 중복 확인을 해주세요.');
      return;
    }
    if (shopNameStatus !== 'available') {
      setError('매장 이름 중복 확인을 해주세요.');
      return;
    }

    // Manual validation for industries
    if (!data.industryNames || data.industryNames.length === 0) {
      setError('최소 하나의 업종을 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('비밀번호가 일치하지 않습니다');
      }

      let cleanPhone = data.phone.replace(/-/g, '');
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
            industryNames: data.industryNames,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '회원가입에 실패했습니다');
      }

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
            {/* Email with Duplicate Check */}
            <div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="이메일"
                    type="email"
                    placeholder="email@example.com"
                    className="mb-0" // Remove default mb-4 for alignment
                    {...register('email', {
                      required: '이메일을 입력해주세요',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: '올바른 이메일 형식이 아닙니다',
                      },
                      onChange: () => {
                        setEmailStatus('idle'); // Reset checking on change
                        setEmailMessage('');
                      },
                    })}
                    error={errors.email?.message}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => checkDuplicate('email', email)}
                  disabled={emailStatus === 'checking' || !email}
                  className="mb-[2px] h-[42px]" // Align with input
                >
                  {emailStatus === 'checking' ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    '중복확인'
                  )}
                </Button>
              </div>
              {emailMessage && (
                <p
                  className={`text-xs mt-1 ${getStatusColor(
                    emailStatus
                  )} flex items-center gap-1`}
                >
                  {getStatusIcon(emailStatus)} {emailMessage}
                </p>
              )}
            </div>

            <Input
              label="이름 (원장님 성함)"
              type="text"
              placeholder="홍길동"
              {...register('name', {
                required: '이름을 입력해주세요',
              })}
              error={errors.name?.message}
            />

            {/* Shop Name with Duplicate Check */}
            <div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="매장 이름"
                    type="text"
                    placeholder="헤어샵_강남점"
                    className="mb-0"
                    {...register('shopName', {
                      required: '매장 이름을 입력해주세요',
                      pattern: {
                        value: /^[a-zA-Z0-9_가-힣]+$/,
                        message:
                          '한글, 영문, 숫자, 밑줄(_)만 사용 가능합니다 (띄어쓰기, 하이픈 불가)',
                      },
                      onChange: () => {
                        setShopNameStatus('idle');
                        setShopNameMessage('');
                      },
                    })}
                    error={errors.shopName?.message}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => checkDuplicate('shopName', shopName)}
                  disabled={shopNameStatus === 'checking' || !shopName}
                  className="mb-[2px] h-[42px]"
                >
                  {shopNameStatus === 'checking' ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    '중복확인'
                  )}
                </Button>
              </div>
              {shopNameMessage && (
                <p
                  className={`text-xs mt-1 ${getStatusColor(
                    shopNameStatus
                  )} flex items-center gap-1`}
                >
                  {getStatusIcon(shopNameStatus)} {shopNameMessage}
                </p>
              )}
            </div>

            {/* Industry Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                업종 (다중 선택 가능)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map((ind) => {
                  const isSelected = industryNames?.includes(ind.value);
                  return (
                    <button
                      key={ind.value}
                      type="button"
                      onClick={() => toggleIndustry(ind.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-md border text-sm font-medium transition-all
                        ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {ind.label}
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
              {industryNames?.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  * 최소 하나 이상 선택해주세요.
                </p>
              )}
            </div>

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
              disabled={
                emailStatus !== 'available' || shopNameStatus !== 'available'
              }
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
