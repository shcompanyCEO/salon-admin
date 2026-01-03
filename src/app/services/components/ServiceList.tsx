'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Edit2,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Save,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

interface ServiceListProps {
  salonId: string;
}

export default function ServiceList({ salonId }: ServiceListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create Category State
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fetch Categories on mount
  React.useEffect(() => {
    fetchCategories();
  }, [salonId]);

  const fetchCategories = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data) setCategories(data);
    setIsLoading(false);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    const { error } = await supabase.from('service_categories').insert({
      salon_id: salonId,
      name: newCategoryName,
      display_order: categories.length + 1, // Simple append
    });

    if (error) {
      console.error('Error creating category:', error);
      alert('카테고리 생성 실패');
    } else {
      setNewCategoryName('');
      setIsCreating(false);
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm(
        '정말 삭제하시겠습니까? 포함된 서비스 메뉴도 영향을 받을 수 있습니다.'
      )
    )
      return;

    const { error } = await supabase
      .from('service_categories')
      .update({ is_active: false, deleted_at: new Date() }) // Soft delete
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      alert('삭제 실패');
    } else {
      fetchCategories();
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

// Sub-component for each category row (Accordion)
function CategoryItem({
  category,
  salonId,
  onDelete,
}: {
  category: Category;
  salonId: string;
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Fetch services when opening accordion
  const fetchServices = async () => {
    setIsLoadingServices(true);
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data) setServices(data);
    setIsLoadingServices(false);
  };

  const toggleOpen = () => {
    if (!isOpen) fetchServices();
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
          {isLoadingServices ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : (
            <ServiceItems
              services={services}
              salonId={salonId}
              categoryId={category.id}
              onUpdate={fetchServices}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for Services within a category
function ServiceItems({
  services,
  salonId,
  categoryId,
  onUpdate,
}: {
  services: any[];
  salonId: string;
  categoryId: string;
  onUpdate: () => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: 60,
  });

  const handleAddService = async () => {
    if (!newService.name) return;

    const { error } = await supabase.from('services').insert({
      salon_id: salonId,
      category_id: categoryId,
      name: newService.name,
      duration_minutes: newService.duration,
      pricing_type: 'FIXED', // Default simplified for MVP
      base_price: parseFloat(newService.price) || 0,
    });

    if (error) {
      console.error(error);
      alert('서비스 추가 실패');
    } else {
      setNewService({ name: '', price: '', duration: 60 });
      setIsAdding(false);
      onUpdate();
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await supabase.from('services').update({ is_active: false }).eq('id', id);
    onUpdate();
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
                {Number(svc.base_price).toLocaleString()}원
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
          {/* Add Row */}
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
