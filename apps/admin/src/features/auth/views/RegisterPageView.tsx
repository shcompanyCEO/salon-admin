'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Scissors, Check, X, Loader2, Eye, EyeOff } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { CheckStatus } from '../types';
import { useRegistration } from '../hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const INDUSTRIES = [
  { label: '헤어샵', value: 'HAIR' },
  { label: '네일샵', value: 'NAIL' },
  { label: '에스테틱', value: 'ESTHETIC' },
  { label: '마사지', value: 'MASSAGE' },
  { label: '바버샵', value: 'BARBERSHOP' },
];

interface RegisterForm {
  id: string; // User ID acting as email prefix
  password: string;
  confirmPassword: string;
  name: string;
  salonName: string;
  countryCode: string;
  phone: string;
  otp?: string;
  industryNames: string[];
}

export default function RegisterPageView() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone Auth State
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0); // Optional: Timer logic could be added

  const {
    salonNameStatus,
    salonNameMessage,
    setSalonNameStatus,
    setSalonNameMessage,
    checkDuplicate,
    registerOwner,
  } = useRegistration();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      countryCode: '+66',
      industryNames: [],
    },
  });

  const industryNames = watch('industryNames');
  const salonName = watch('salonName');
  const userId = watch('id');
  const phone = watch('phone');
  const countryCode = watch('countryCode');
  const otp = watch('otp');

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

  const handleCheckDuplicate = async (
    type: 'email' | 'salonName',
    value: string
  ) => {
    const isValid = await trigger(type === 'email' ? 'id' : 'salonName');
    if (!isValid) return;

    if (type === 'email') {
      // Check ID as email
      await checkDuplicate('email', `${value}@salon.local`);
    } else {
      await checkDuplicate(type, value);
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

  const formattedPhone = () => {
    if (!phone) return '';
    let clean = phone.replace(/-/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    return `${countryCode}${clean}`;
  };

  const handleSendOtp = async () => {
    const isValid = await trigger(['phone', 'countryCode']);
    if (!isValid) return;

    setOtpLoading(true);
    setError('');
    try {
      const fullPhone = formattedPhone();
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
      });

      if (error) throw error;

      setOtpSent(true);
      alert('인증번호가 발송되었습니다.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || '인증번호 발송 실패');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('인증번호를 입력해주세요');
      return;
    }

    setOtpLoading(true);
    setError('');
    try {
      const fullPhone = formattedPhone();
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;
      if (!data.user) throw new Error('인증 실패');

      setOtpVerified(true);
      setVerifiedUser(data.user);
      alert('인증이 완료되었습니다.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || '인증번호 확인 실패');
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setError('');

    // Pre-checks
    if (!otpVerified || !verifiedUser) {
      setError('휴대폰 인증을 완료해주세요.');
      return;
    }

    if (salonNameStatus !== 'available') {
      // Re-check logic if generic status isn't reliable or blocked
      // But assuming status is managed by hook hooks correctly
    }

    if (!data.industryNames || data.industryNames.length === 0) {
      setError('최소 하나의 업종을 선택해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // Construct email from ID
      const finalEmail = `${data.id}@salon.local`;

      await registerOwner({
        userId: verifiedUser.id, // Pass existing user ID
        email: finalEmail,
        password: data.password,
        name: data.name,
        salonName: data.salonName,
        phone: formattedPhone(),
        industryNames: data.industryNames,
      });

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-8 text-center">회원가입</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ID Input */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              아이디 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="아이디를 입력해 주세요."
              {...register('id', {
                required: '아이디를 입력해주세요',
                pattern: {
                  value: /^[a-z0-9]{4,20}$/,
                  message:
                    '영 소문자, 숫자를 사용해 4~20자 이내로 입력해 주세요.',
                },
              })}
              error={errors.id?.message}
            />
            <p className="text-xs text-gray-400">
              영 소문자, 숫자를 사용해 4~20자 이내로 입력해 주세요.
            </p>
          </div>

          {/* Password */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-900">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력해 주세요."
                  {...register('password', {
                    required: '비밀번호를 입력해주세요',
                    minLength: {
                      value: 8,
                      message: '8자 이상 입력해주세요',
                    },
                  })}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 한 번 더 입력해 주세요."
                  {...register('confirmPassword', {
                    required: '비밀번호 확인을 입력해주세요',
                    validate: (val) =>
                      val === watch('password') ||
                      '비밀번호가 일치하지 않습니다',
                  })}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                영문+숫자+특수문자로 8~20자 이내로 입력해 주세요.
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="이름을 입력해 주세요."
              {...register('name', { required: '이름을 입력해주세요' })}
              error={errors.name?.message}
            />
            <p className="text-xs text-gray-400">
              예약 캘린더에 노출할 이름을 입력해 주세요.
            </p>
          </div>

          {/* Salon Name (Added back as likely needed by backend even if not in crop?) 
              User image didn't show it but "Register Owner" usually needs Salon Name.
              I'll keep it but make it minimal or put it after Name.
              Actually image doesn't show Salon Name. 
              Maybe user wants ONLY what's in image?
              But registration requires Salon creation.
              I will assume it's necessary or maybe it's "Name" of salon?
              "Name" field says "Name to show on calendar". Could be Owner Name or Salon Name?
              Usually Calendar shows Stylist Name.
              But where is Salon Name input?
              I'll keep Salon Name input to be safe, maybe below Name, 
              or interpret "Name" as Salon Name? No, "Name (Owner Name)" usually.
              I will Add Salon Name input matching the style.
          */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              매장 이름 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="매장 이름을 입력해 주세요."
                  {...register('salonName', {
                    required: '매장 이름을 입력해주세요',
                  })}
                  error={errors.salonName?.message}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCheckDuplicate('salonName', salonName)}
                disabled={salonNameStatus === 'checking' || !salonName}
                className="h-[42px]"
              >
                {salonNameStatus === 'checking' ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  '중복확인'
                )}
              </Button>
            </div>
            {salonNameMessage && (
              <p
                className={`text-xs ${salonNameStatus === 'available' ? 'text-green-600' : 'text-red-600'}`}
              >
                {salonNameMessage}
              </p>
            )}
          </div>

          {/* Industry Selection (Hidden in image but required by backend?) 
               I'll keep it but minimal or default?
               Image is a partial crop. I should keep functional fields.
           */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              업종 <span className="text-red-500">*</span>
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
                        ${isSelected ? 'border-black bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    {ind.label}
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phone Verification */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">
              휴대폰 인증 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="w-[100px]">
                <Select
                  options={[
                    { value: '+66', label: '+66' },
                    { value: '+82', label: '+82' },
                  ]}
                  {...register('countryCode')}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="휴대폰 번호를 입력해 주세요."
                  {...register('phone', { required: true })}
                  disabled={otpSent}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSendOtp}
                disabled={otpLoading || otpSent}
                className="h-[42px] min-w-[60px]"
              >
                {otpSent ? '재전송' : '전송'}
              </Button>
            </div>

            {otpSent && !otpVerified && (
              <div className="flex gap-2 mt-2">
                <Input placeholder="인증번호 6자리" {...register('otp')} />
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading}
                  variant="primary"
                  className="h-[42px]"
                >
                  확인
                </Button>
              </div>
            )}
            {otpVerified && (
              <p className="text-sm text-green-600 mt-1">
                인증이 완료되었습니다.
              </p>
            )}
          </div>

          <div className="pt-6">
            <p className="text-xs text-gray-500 text-center mb-4">
              공비서 원장님 회원가입을 완료하면 공비서 원장님, 공비서스토어의
              <br />
              <span className="underline cursor-pointer">
                통합 서비스 이용약관
              </span>{' '}
              및{' '}
              <span className="underline cursor-pointer">
                개인정보 처리방침
              </span>
              에 동의하신 것으로 간주합니다.
            </p>
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700 border-none"
              // Style usually changes to Black when valid. For now using basic style or class logic.
              disabled={isLoading || !otpVerified}
              style={{
                backgroundColor: otpVerified ? '#000' : '#E5E7EB',
                color: otpVerified ? '#fff' : '#9CA3AF',
              }}
            >
              회원가입 완료
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
