'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Layout } from '@/components/layout/Layout';
import { Check, Info } from 'lucide-react';
import { useIndustries } from '../hooks/useSalonServices';
import ServiceList from './components/ServiceList';

export default function SalonServicesPageView() {
  const { user } = useAuthStore();

  const { data, isLoading, toggleIndustry } = useIndustries(
    user?.salonId || ''
  );

  const industries = data?.all || [];
  const selectedIndustryIds = data?.selected || [];

  const handleToggleIndustry = async (industryId: string) => {
    try {
      const isSelected = selectedIndustryIds.includes(industryId);
      await toggleIndustry({ industryId, isSelected });

      if (!isSelected) {
        alert(
          '업종이 추가되었습니다. 직원 관리 메뉴에서 해당 업종의 기본 직급이 자동으로 생성되었는지 확인해보세요.'
        );
      }
    } catch (error) {
      console.error(error);
      alert('업종 변경 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8">로딩 중...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">서비스 관리</h1>
          <p className="text-gray-500">
            우리 매장의 업종과 시술 메뉴를 관리하세요.
          </p>
        </div>

        {/* Industry Configuration Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              매장 업종 설정
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                다중 선택 가능
              </span>
            </h2>
          </div>

          <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-md mb-6 flex items-start gap-2">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              새로운 업종을 추가하면, 해당 업종에 필요한{' '}
              <strong>기본 직급(예: 디자이너, 아티스트 등)</strong>이 자동으로
              생성됩니다.
              <br />
              이미 직급이 존재하는 경우 중복해서 생성되지 않습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {industries.map((industry) => {
              const isSelected = selectedIndustryIds.includes(industry.id);
              return (
                <button
                  key={industry.id}
                  onClick={() => handleToggleIndustry(industry.id)}
                  className={`
                  relative flex items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                  }
                `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-semibold text-base">
                      {industry.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-primary-600">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Services List Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {user?.salonId ? (
            <ServiceList salonId={user.salonId} />
          ) : (
            <div className="text-center py-4">
              살롱 정보를 불러오는 중입니다...
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
