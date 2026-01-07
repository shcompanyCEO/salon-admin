'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  GripVertical,
  Trash2,
  X,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import { useCategories, useServices } from '../../hooks/useSalonServices';
import { ServiceCategory, ServiceMenu, SalonIndustry } from '../../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ServicesSidebar from './ServicesSidebar';

interface ServiceListProps {
  salonId: string;
  orderedIndustries: SalonIndustry[];
  selectedTab: string;
}

export default function ServiceList({
  salonId,
  orderedIndustries = [],
  selectedTab,
}: ServiceListProps) {
  const {
    data: categories = [],
    isLoading,
    createCategory,
    deleteCategory,
    reorderCategories,
  } = useCategories(salonId);

  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [selectedIndustryForCreate, setSelectedIndustryForCreate] =
    useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await createCategory({
        name: newCategoryName,
        displayOrder: categories.length + 1,
        industryId: selectedIndustryForCreate || undefined,
      });
      setNewCategoryName('');
      setIsCreating(false);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('duplicate key') || e.code === '23505') {
        alert('이미 존재하는 카테고리 이름입니다.');
      } else if (e.message?.includes('industry_id')) {
        alert('데이터베이스 업데이트가 필요합니다. (migration 미적용)');
      } else {
        alert('카테고리 생성 실패: ' + (e.message || '알 수 없는 오류'));
      }
    }
  };

  const { updateCategory } = useCategories(salonId);
  const { updateService } = useServices(salonId);

  // Editing State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState('');

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceData, setEditServiceData] = useState({
    name: '',
    price: '',
  });

  const handleStartEditCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
  };

  const handleSaveCategory = async () => {
    if (!editingCategoryId || !editCategoryName.trim()) return;
    try {
      await updateCategory({ id: editingCategoryId, name: editCategoryName });
      setEditingCategoryId(null);
    } catch (e) {
      console.error(e);
      alert('카테고리 수정 실패');
    }
  };

  const handleStartEditService = (service: any) => {
    setEditingServiceId(service.id);
    setEditServiceData({
      name: service.name,
      price: service.base_price?.toString() || '0',
    });
  };

  const handleSaveService = async () => {
    if (!editingServiceId || !editServiceData.name.trim()) return;
    try {
      await updateService({
        id: editingServiceId,
        updates: {
          name: editServiceData.name,
          price: parseInt(editServiceData.price) || 0,
        },
      });
      setEditingServiceId(null);
    } catch (e) {
      console.error(e);
      alert('시술 정보 수정 실패');
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

  const { data: allServices = [] } = useServices(salonId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Reset selected category when industry tab changes
  React.useEffect(() => {
    setSelectedCategoryId(null);
  }, [selectedTab]);

  // Calculate counts
  const serviceCounts = categories.reduce((acc, cat) => {
    const count = allServices.filter((s) => s.category_id === cat.id).length;
    acc[cat.id] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex w-full gap-6 items-start">
      {/* Left Sidebar - Treated as separate card */}
      <div className="w-64 flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <ServicesSidebar
          categories={categories}
          orderedIndustries={orderedIndustries}
          selectedIndustryId={selectedTab}
          onSelectIndustry={(id) => {}}
          onAddCategory={(industryId) => {
            setSelectedIndustryForCreate(industryId || '');
            setIsCreating(true);
          }}
          serviceCounts={serviceCounts}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onReorderCategories={reorderCategories}
        />
      </div>

      {/* Main Content - Treated as separate card */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-6 min-h-[600px]">
        {isCreating && (
          <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-semibold mb-4">새 카테고리 추가</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="예: 커트, 펌, 컬러"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="max-w-xs"
                autoFocus
              />
              {orderedIndustries.length > 0 && (
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedIndustryForCreate}
                  onChange={(e) => setSelectedIndustryForCreate(e.target.value)}
                >
                  <option value="">업종 선택</option>
                  {orderedIndustries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              )}
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
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-gray-500">로딩 중...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">등록된 카테고리가 없습니다.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="w-4 h-4 mr-2" /> 카테고리 추가
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedIndustries.map((industry) => {
              // Filter by tab
              if (selectedTab !== 'all' && selectedTab !== industry.id)
                return null;

              let industryCategories = categories.filter(
                (c) => c.industry_id === industry.id
              );

              // Filter by selected category
              if (selectedCategoryId) {
                industryCategories = industryCategories.filter(
                  (c) => c.id === selectedCategoryId
                );
              }

              if (industryCategories.length === 0) return null;

              return (
                <div key={industry.id} className="space-y-4 pt-4">
                  <div className="text-section-header px-1 mb-2">
                    {industry.name}
                  </div>
                  {industryCategories.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      onDelete={handleDeleteCategory}
                      onEdit={handleStartEditCategory}
                      isEditing={editingCategoryId === category.id}
                      editName={editCategoryName}
                      onEditNameChange={setEditCategoryName}
                      onSaveEdit={handleSaveCategory}
                      onCancelEdit={() => setEditingCategoryId(null)}
                    >
                      <ServiceItems
                        salonId={salonId}
                        categoryId={category.id}
                        editingServiceId={editingServiceId}
                        editServiceData={editServiceData}
                        onEditService={handleStartEditService}
                        onEditServiceDataChange={setEditServiceData}
                        onSaveService={handleSaveService}
                        onCancelEditService={() => setEditingServiceId(null)}
                      />
                    </CategoryItem>
                  ))}
                </div>
              );
            })}

            {/* Other Categories */}
            {(() => {
              if (selectedTab !== 'all') return null;
              const stringifiedIndustryIds = orderedIndustries.map((i) => i.id);
              let otherCategories = categories.filter(
                (c) =>
                  !c.industry_id ||
                  !stringifiedIndustryIds.includes(c.industry_id)
              );

              // Filter by selected category
              if (selectedCategoryId) {
                otherCategories = otherCategories.filter(
                  (c) => c.id === selectedCategoryId
                );
              }

              if (otherCategories.length > 0) {
                return (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-gray-500">
                      기타
                    </div>
                    {otherCategories.map((category) => (
                      <CategoryItem
                        key={category.id}
                        onDelete={handleDeleteCategory}
                        onEdit={handleStartEditCategory}
                        isEditing={editingCategoryId === category.id}
                        editName={editCategoryName}
                        onEditNameChange={setEditCategoryName}
                        onSaveEdit={handleSaveCategory}
                        onCancelEdit={() => setEditingCategoryId(null)}
                        category={category}
                      >
                        <ServiceItems
                          salonId={salonId}
                          categoryId={category.id}
                          editingServiceId={editingServiceId}
                          editServiceData={editServiceData}
                          onEditService={handleStartEditService}
                          onEditServiceDataChange={setEditServiceData}
                          onSaveService={handleSaveService}
                          onCancelEditService={() => setEditingServiceId(null)}
                        />
                      </CategoryItem>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// function CategoryItem({ ... }) - Refactored for new design
function CategoryItem({
  category,
  onDelete,
  onEdit,
  isEditing,
  editName,
  onEditNameChange,
  onSaveEdit,
  onCancelEdit,
  children,
}: {
  category: any;
  onDelete: (id: string) => void;
  onEdit: (category: any) => void;
  isEditing: boolean;
  editName: string;
  onEditNameChange: (val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between mb-3 pb-2 border-b border-gray-200">
        <div>
          {/* If we had industry name, we'd put it here: <div className="text-caption text-gray-500 mb-1">header</div> */}
          <h3 className="text-h3">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xl font-bold"
                  autoFocus
                />
                <Button size="sm" onClick={onSaveEdit}>
                  저장
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                  취소
                </Button>
              </div>
            ) : (
              category.name
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category)}
              className="h-8 text-xs font-normal text-gray-400 hover:text-gray-900 border-gray-200"
            >
              수정
            </Button>
          )}
          <button
            onClick={() => {
              if (confirm('카테고리를 삭제하시겠습니까?'))
                onDelete(category.id);
            }}
            className="text-gray-300 hover:text-red-500 p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Services List Content */}
      <div className="pl-1">{children}</div>
    </div>
  );
}

function SortableServiceRow({
  service,
  editingServiceId,
  editServiceData,
  onEditService,
  onEditServiceDataChange,
  onSaveService,
  onCancelEditService,
  onDeleteService,
}: {
  service: ServiceMenu;
  editingServiceId: string | null;
  editServiceData: { name: string; price: string };
  onEditService: (service: any) => void;
  onEditServiceDataChange: (data: { name: string; price: string }) => void;
  onSaveService: () => void;
  onCancelEditService: () => void;
  onDeleteService: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentlyEditing = editingServiceId === service.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-1 last:mb-0 hover:bg-gray-100 transition-colors group ${
        isDragging ? 'shadow-lg border-blue-200 border' : ''
      }`}
    >
      {currentlyEditing ? (
        <div className="flex w-full items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
              placeholder="시술명"
              value={editServiceData.name}
              onChange={(e) =>
                onEditServiceDataChange({
                  ...editServiceData,
                  name: e.target.value,
                })
              }
            />
            <div className="flex gap-2">
              <input
                type="number"
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                placeholder="가격"
                value={editServiceData.price}
                onChange={(e) =>
                  onEditServiceDataChange({
                    ...editServiceData,
                    price: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={onSaveService}>
              저장
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEditService}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 text-h4">{service.name}</div>

          <div className="w-24 text-center text-body">
            {service.duration_minutes}분
          </div>

          <div className="w-32 text-right text-price">
            {service.pricing_type === 'FIXED'
              ? `${(
                  service.base_price ||
                  service.price ||
                  0
                ).toLocaleString()}원`
              : '변동'}
          </div>

          <div className="w-16 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditService(service)}
              className="p-1 text-gray-400 hover:text-blue-500"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteService(service.id)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-gray-300 cursor-move hover:text-gray-600"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ServiceItems({
  salonId,
  categoryId,
  editingServiceId,
  editServiceData,
  onEditService,
  onEditServiceDataChange,
  onSaveService,
  onCancelEditService,
}: {
  salonId: string;
  categoryId: string;
  editingServiceId: string | null;
  editServiceData: { name: string; price: string };
  onEditService: (service: any) => void;
  onEditServiceDataChange: (data: { name: string; price: string }) => void;
  onSaveService: () => void;
  onCancelEditService: () => void;
}) {
  const {
    data: servicesData = [],
    createService,
    deleteService,
    reorderServices,
  } = useServices(salonId, categoryId);

  // Optimistic UI state for sorting
  const [orderedServices, setOrderedServices] = React.useState<ServiceMenu[]>(
    []
  );

  React.useEffect(() => {
    if (servicesData) {
      // Sort by display_order if available, otherwise by creation/default
      const sorted = [...servicesData].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
      setOrderedServices(sorted);
    }
  }, [servicesData]);

  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: 30,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderedServices((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Call API
        const servicesToUpdate = newOrder.map((service, index) => ({
          id: service.id,
          display_order: index,
        }));
        reorderServices(servicesToUpdate);

        return newOrder;
      });
    }
  };

  const handleAddService = async () => {
    if (!newService.name.trim()) {
      alert('시술명을 입력해주세요.');
      return;
    }
    if (!newService.price) {
      alert('금액을 입력해주세요.');
      return;
    }
    try {
      await createService({
        name: newService.name,
        duration: newService.duration,
        price: newService.price,
      });
      setNewService({ name: '', price: '', duration: 30 });
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
    <div className="space-y-1">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedServices.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedServices.map((service) => (
            <SortableServiceRow
              key={service.id}
              service={service}
              editingServiceId={editingServiceId}
              editServiceData={editServiceData}
              onEditService={onEditService}
              onEditServiceDataChange={onEditServiceDataChange}
              onSaveService={onSaveService}
              onCancelEditService={onCancelEditService}
              onDeleteService={handleDeleteService}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add New Service Form */}
      {isAdding ? (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-100 mt-2">
          <input
            className="flex-1 px-3 py-2 text-sm border rounded-md"
            placeholder="시술명 (예: 다운펌)"
            value={newService.name}
            onChange={(e) =>
              setNewService({ ...newService, name: e.target.value })
            }
            autoFocus
          />
          <div className="flex items-center gap-1 w-24">
            <input
              type="number"
              className="w-full px-2 py-2 text-sm border rounded-md text-right"
              placeholder="0"
              value={newService.price}
              onChange={(e) =>
                setNewService({ ...newService, price: e.target.value })
              }
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">원</span>
          </div>
          <select
            className="w-20 px-2 py-2 text-sm border rounded-md"
            value={newService.duration}
            onChange={(e) =>
              setNewService({
                ...newService,
                duration: Number(e.target.value),
              })
            }
          >
            <option value={15}>15분</option>
            <option value={30}>30분</option>
            <option value={60}>60분</option>
            <option value={90}>90분</option>
            <option value={120}>120분</option>
          </select>
          <Button size="sm" onClick={handleAddService}>
            확인
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewService({ name: '', price: '', duration: 30 });
            }}
          >
            취소
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3 mt-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          시술 추가
        </button>
      )}
    </div>
  );
}
