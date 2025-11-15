'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useTranslation } from '@/locales/useTranslation';
import { Designer, ServiceType } from '@/types';
import { Plus, Star, Edit, Trash2 } from 'lucide-react';

export default function DesignersPage() {
  const { t } = useTranslation();
  const [showNewDesignerModal, setShowNewDesignerModal] = useState(false);

  // Mock data
  const [designers] = useState<Designer[]>([
    {
      id: 'd1',
      userId: 'u1',
      salonId: 's1',
      name: '김철수',
      description: '10년 경력의 헤어 디자이너',
      experience: 10,
      profileImage: undefined,
      portfolioImages: [],
      specialties: [ServiceType.CUT, ServiceType.PERM],
      rating: 4.8,
      reviewCount: 156,
      isActive: true,
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'd2',
      userId: 'u2',
      salonId: 's1',
      name: '이영희',
      description: '컬러 전문 디자이너',
      experience: 8,
      profileImage: undefined,
      portfolioImages: [],
      specialties: [ServiceType.COLOR, ServiceType.TREATMENT],
      rating: 4.9,
      reviewCount: 203,
      isActive: true,
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'd3',
      userId: 'u3',
      salonId: 's1',
      name: '박민수',
      description: '올라운더 디자이너',
      experience: 12,
      profileImage: undefined,
      portfolioImages: [],
      specialties: [ServiceType.CUT, ServiceType.COLOR, ServiceType.PERM],
      rating: 4.7,
      reviewCount: 189,
      isActive: false,
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const serviceTypeLabels = {
    [ServiceType.CUT]: t('service.cut'),
    [ServiceType.COLOR]: t('service.color'),
    [ServiceType.PERM]: t('service.perm'),
    [ServiceType.CLINIC]: t('service.clinic'),
    [ServiceType.TREATMENT]: t('service.treatment'),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {t('designer.title')}
            </h1>
            <p className="text-secondary-600 mt-1">
              디자이너 정보를 관리하고 권한을 설정하세요
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowNewDesignerModal(true)}
          >
            <Plus size={20} className="mr-2" />
            {t('designer.addDesigner')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {designers.filter(d => d.isActive).length}
              </p>
              <p className="text-sm text-secondary-600 mt-1">활성 디자이너</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {(designers.reduce((sum, d) => sum + d.rating, 0) / designers.length).toFixed(1)}
              </p>
              <p className="text-sm text-secondary-600 mt-1">평균 평점</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {designers.reduce((sum, d) => sum + d.reviewCount, 0)}
              </p>
              <p className="text-sm text-secondary-600 mt-1">총 리뷰 수</p>
            </div>
          </Card>
        </div>

        {/* Designers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designers.map((designer) => (
            <Card key={designer.id}>
              <div className="space-y-4">
                {/* Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-primary-700">
                        {designer.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {designer.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        경력 {designer.experience}년
                      </p>
                      <div className="flex items-center mt-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-secondary-900">
                          {designer.rating}
                        </span>
                        <span className="text-sm text-secondary-500 ml-1">
                          ({designer.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={designer.isActive ? 'success' : 'default'}>
                    {designer.isActive ? t('designer.active') : t('designer.inactive')}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary-600">
                  {designer.description}
                </p>

                {/* Specialties */}
                <div>
                  <p className="text-xs font-medium text-secondary-700 mb-2">
                    {t('designer.specialties')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {designer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="info" size="sm">
                        {serviceTypeLabels[specialty]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t border-secondary-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit size={16} className="mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* New Designer Modal */}
      <Modal
        isOpen={showNewDesignerModal}
        onClose={() => setShowNewDesignerModal(false)}
        title={t('designer.addDesigner')}
        size="lg"
      >
        <form className="space-y-4">
          <Input
            label={t('designer.name')}
            required
            placeholder="디자이너 이름을 입력하세요"
          />

          <Input
            label="설명"
            placeholder="디자이너 소개를 입력하세요"
          />

          <Input
            type="number"
            label={t('designer.experience')}
            required
            placeholder="경력 (년)"
            min="0"
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              {t('designer.specialties')}
            </label>
            <div className="space-y-2">
              {Object.values(ServiceType).map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    value={type}
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    {serviceTypeLabels[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              {t('designer.permissions')}
            </label>
            <div className="space-y-2">
              {['예약 관리', '고객 관리', '리뷰 관리', '매출 확인'].map((permission) => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    {permission}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowNewDesignerModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
