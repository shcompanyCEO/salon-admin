'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import InviteStaffModal from '@/components/staff/InviteStaffModal'; // Import from new path
import { useTranslation } from '@/locales/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { useStaff } from '@/lib/api/queries';
import { ApiResponse, Staff } from '@/types';
import { Plus, Star, Edit, Trash2, Mail } from 'lucide-react';

export default function StaffPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    data: response,
    isLoading,
    error,
  } = useStaff(user?.salonId || '', {
    enabled: !!user?.salonId,
  });

  const [showNewStaffModal, setShowNewStaffModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const staffMembers = (response as ApiResponse<Staff[]>)?.data || [];
  console.log('sean user', user?.salonId);
  console.log('sena staff', staffMembers);

  // In a real app, you would fetch categories to map ID to Name
  // For now, we assume specialties contains Name or we just display ID/Name directly.
  // const categories = useServiceCategories(user?.salonId);
  // const getCategoryName = (id) => categories.find(c => c.id === id)?.name || id;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-secondary-500">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="text-red-500">
            {t('common.error')}: {(error as Error).message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              {t('staff.title')}
            </h1>
            <p className="text-secondary-600 mt-1">
              디자이너 정보를 관리하고 권한을 설정하세요
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowInviteModal(true)}>
              <Mail size={20} className="mr-2" />
              Invite Staff
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowNewStaffModal(true)}
            >
              <Plus size={20} className="mr-2" />
              {t('staff.addStaff')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {staffMembers.filter((d) => d.isActive).length}
              </p>
              <p className="text-sm text-secondary-600 mt-1">활성 디자이너</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {staffMembers.length > 0
                  ? (
                      staffMembers.reduce((sum, d) => sum + d.rating, 0) /
                      staffMembers.length
                    ).toFixed(1)
                  : '0.0'}
              </p>
              <p className="text-sm text-secondary-600 mt-1">평균 평점</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900">
                {staffMembers.reduce((sum, d) => sum + d.reviewCount, 0)}
              </p>
              <p className="text-sm text-secondary-600 mt-1">총 리뷰 수</p>
            </div>
          </Card>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffMembers.map((member) => (
            <Card key={member.id}>
              <div className="space-y-4">
                {/* Profile */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-primary-700">
                        {member.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {member.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        경력 {member.experience}년
                      </p>
                      <div className="flex items-center mt-1">
                        <Star
                          size={16}
                          className="text-yellow-400 fill-yellow-400 mr-1"
                        />
                        <span className="text-sm font-medium text-secondary-900">
                          {member.rating}
                        </span>
                        <span className="text-sm text-secondary-500 ml-1">
                          ({member.reviewCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={member.isActive ? 'success' : 'default'}>
                    {member.isActive ? t('staff.active') : t('staff.inactive')}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-secondary-600">
                  {member.description}
                </p>

                {/* Specialties */}
                <div>
                  <p className="text-xs font-medium text-secondary-700 mb-2">
                    {t('staff.specialties')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty) => (
                      <Badge key={specialty} variant="info" size="sm">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2 border-t border-secondary-200">
                  <Button variant="outline" size="sm" className="flex-1">
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
      {/* Invite Staff Modal */}
      <InviteStaffModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          // In a real app, you might refetch the designers list here
          alert('Invitation sent successfully!');
        }}
      />
    </Layout>
  );
}
