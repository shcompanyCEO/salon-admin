'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useCategories, useServices } from '../../hooks/useSalonServices';
import { ServiceCategory, ServiceMenu } from '../../types';

interface ServiceListProps {
  salonId: string;
}

export default function ServiceList({ salonId }: ServiceListProps) {
  const {
    data: categories = [],
    isLoading,
    createCategory,
    deleteCategory,
  } = useCategories(salonId);

  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({
        name: newCategoryName,
        displayOrder: categories.length + 1,
      });
      setNewCategoryName('');
      setIsCreating(false);
    } catch (e) {
      console.error(e);
      alert('카테고리 생성 실패');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        '정말 삭제하시겠습니까? 포함된 서비스 메뉴도 영향을 받을 수 있습니다.'
      )
    )
      return;
    try {
      await deleteCategory(id);
    } catch (e) {
      console.error(e);
      alert('삭제 실패');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          시술 카테고리 & 메뉴
        </h3>
        {!isCreating && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            카테고리 추가
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-2">
          <Input
            placeholder="예: 커트, 펌, 컬러"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 mt-0 bg-white"
            autoFocus
          />
          <Button size="sm" onClick={handleCreateCategory}>
            저장
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(false)}
          >
            취소
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-gray-500">로딩 중...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-500">
          등록된 카테고리가 없습니다. <br />
          '카테고리 추가' 버튼을 눌러 시술 메뉴를 구성해보세요.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              salonId={salonId}
              onDelete={() => handleDeleteCategory(category.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryItem({
  category,
  salonId,
  onDelete,
}: {
  category: ServiceCategory;
  salonId: string;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: services = [], isLoading } = useServices(
    salonId,
    isOpen ? category.id : ''
  );

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-2 font-medium text-gray-900">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          {category.name}{' '}
          <span className="text-xs text-gray-400 font-normal">
            ({services.length}개 메뉴)
          </span>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-gray-200 bg-white">
          {isLoading ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : (
            <ServiceItems
              services={services}
              salonId={salonId}
              categoryId={category.id}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ServiceItems({
  services,
  salonId,
  categoryId,
}: {
  services: ServiceMenu[];
  salonId: string;
  categoryId: string;
}) {
  const { createService, deleteService } = useServices(salonId, categoryId);
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: 60,
  });

  const handleAddService = async () => {
    if (!newService.name) return;
    try {
      await createService({
        name: newService.name,
        duration: newService.duration,
        price: newService.price,
      });
      setNewService({ name: '', price: '', duration: 60 });
      setIsAdding(false);
    } catch (e) {
      console.error(e);
      alert('서비스 추가 실패');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteService(id);
    } catch (e) {
      console.error(e);
      alert('삭제 실패');
    }
  };

  return (
    <div className="space-y-2">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
          <tr>
            <th className="px-3 py-2">메뉴명</th>
            <th className="px-3 py-2">소요시간</th>
            <th className="px-3 py-2">가격</th>
            <th className="px-3 py-2 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {services.map((svc) => (
            <tr key={svc.id} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium">{svc.name}</td>
              <td className="px-3 py-2">{svc.duration_minutes}분</td>
              <td className="px-3 py-2">
                {Number(svc.base_price || svc.price).toLocaleString()}원
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  className="text-red-400 hover:text-red-600"
                  onClick={() => handleDeleteService(svc.id)}
                >
                  <X className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {isAdding && (
            <tr className="bg-blue-50">
              <td className="px-2 py-2">
                <input
                  className="w-full px-2 py-1 text-sm border rounded"
                  placeholder="메뉴명"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                  autoFocus
                />
              </td>
              <td className="px-2 py-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="w-16 px-2 py-1 text-sm border rounded"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <span>분</span>
                </div>
              </td>
              <td className="px-2 py-2">
                <input
                  type="number"
                  className="w-24 px-2 py-1 text-sm border rounded"
                  placeholder="가격"
                  value={newService.price}
                  onChange={(e) =>
                    setNewService({ ...newService, price: e.target.value })
                  }
                />
              </td>
              <td className="px-2 py-2 text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleAddService}
                  >
                    추가
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() => setIsAdding(false)}
                  >
                    취소
                  </Button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!isAdding && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-500 border-dashed border border-gray-300 mt-2"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-3 h-3 mr-1" /> 메뉴 추가하기
        </Button>
      )}
    </div>
  );
}
