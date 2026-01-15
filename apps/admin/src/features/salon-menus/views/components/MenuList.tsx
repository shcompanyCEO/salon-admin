'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { useCategories, useMenus } from '../../hooks/useSalonMenus';
import { MenuCategory, SalonMenu, SalonIndustry } from '../../types';
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

import MenusSidebar from './MenusSidebar';

interface MenuListProps {
  salonId: string;
  orderedIndustries: SalonIndustry[];
  selectedTab: string;
}

export default function MenuList({
  salonId,
  orderedIndustries = [],
  selectedTab,
}: MenuListProps) {
  const {
    data: categoriesData,
    isLoading,
    createCategory,
    deleteCategory,
    reorderCategories,
  } = useCategories(salonId);

  const categories = categoriesData || [];

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
  const { updateMenu } = useMenus(salonId);

  // Editing State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState('');

  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [editMenuData, setEditMenuData] = useState({
    name: '',
    price: '',
    duration: '30',
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

  const handleStartEditMenu = (menu: any) => {
    setEditingMenuId(menu.id);
    setEditMenuData({
      name: menu.name,
      price: menu.base_price?.toString() || '0',
      duration: menu.duration_minutes?.toString() || '30',
    });
  };

  const handleSaveMenu = async () => {
    if (!editingMenuId || !editMenuData.name.trim()) return;
    try {
      await updateMenu({
        id: editingMenuId,
        updates: {
          name: editMenuData.name,
          price: parseInt(editMenuData.price) || 0,
          duration: parseInt(editMenuData.duration) || 30,
        },
      });
      setEditingMenuId(null);
    } catch (e) {
      console.error(e);
      alert('메뉴 정보 수정 실패');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      !confirm('정말 삭제하시겠습니까? 포함된 메뉴도 영향을 받을 수 있습니다.')
    )
      return;
    try {
      await deleteCategory(id);
    } catch (e) {
      console.error(e);
      alert('삭제 실패');
    }
  };

  const { data: allMenus = [] } = useMenus(salonId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Reset selected category when industry tab changes
  React.useEffect(() => {
    setSelectedCategoryId(null);
  }, [selectedTab]);

  // Calculate counts
  const menuCounts = categories.reduce(
    (acc, cat) => {
      const count = allMenus.filter((s) => s.category_id === cat.id).length;
      acc[cat.id] = count;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex w-full gap-6 items-start">
      {/* Left Sidebar - Treated as separate card */}
      <div className="w-64 flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <MenusSidebar
          categories={categories}
          orderedIndustries={orderedIndustries}
          selectedIndustryId={selectedTab}
          onSelectIndustry={(id) => {}}
          onAddCategory={(industryId) => {
            setSelectedIndustryForCreate(industryId || '');
            setIsCreating(true);
          }}
          menuCounts={menuCounts}
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
                      <MenuItems
                        salonId={salonId}
                        categoryId={category.id}
                        editingMenuId={editingMenuId}
                        editMenuData={editMenuData}
                        onEditMenu={handleStartEditMenu}
                        onEditMenuDataChange={setEditMenuData}
                        onSaveMenu={handleSaveMenu}
                        onCancelEditMenu={() => setEditingMenuId(null)}
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
                        <MenuItems
                          salonId={salonId}
                          categoryId={category.id}
                          editingMenuId={editingMenuId}
                          editMenuData={editMenuData}
                          onEditMenu={handleStartEditMenu}
                          onEditMenuDataChange={setEditMenuData}
                          onSaveMenu={handleSaveMenu}
                          onCancelEditMenu={() => setEditingMenuId(null)}
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

      {/* Menus List Content */}
      <div className="pl-1">{children}</div>
    </div>
  );
}

function SortableMenuRow({
  menu,
  editingMenuId,
  editMenuData,
  onEditMenu,
  onEditMenuDataChange,
  onSaveMenu,
  onCancelEditMenu,
  onDeleteMenu,
}: {
  menu: SalonMenu;
  editingMenuId: string | null;
  editMenuData: { name: string; price: string; duration: string };
  onEditMenu: (menu: any) => void;
  onEditMenuDataChange: (data: {
    name: string;
    price: string;
    duration: string;
  }) => void;
  onSaveMenu: () => void;
  onCancelEditMenu: () => void;
  onDeleteMenu: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const currentlyEditing = editingMenuId === menu.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-1 last:mb-0 hover:bg-gray-100 transition-colors group ${
        isDragging ? 'shadow-lg border-blue-200 border' : ''
      }`}
    >
      {currentlyEditing ? (
        <div className="flex w-full items-center justify-between gap-0">
          {/* Name Input */}
          <div className="flex-1 pr-4">
            <input
              type="text"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              placeholder="메뉴명"
              value={editMenuData.name}
              onChange={(e) =>
                onEditMenuDataChange({
                  ...editMenuData,
                  name: e.target.value,
                })
              }
              autoFocus
            />
          </div>

          {/* Duration Input */}
          <div className="w-24 text-center pr-4">
            <select
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              value={editMenuData.duration}
              onChange={(e) =>
                onEditMenuDataChange({
                  ...editMenuData,
                  duration: e.target.value,
                })
              }
            >
              <option value="15">15분</option>
              <option value="30">30분</option>
              <option value="60">60분</option>
              <option value="90">90분</option>
              <option value="120">120분</option>
            </select>
          </div>

          {/* Price Input */}
          <div className="w-32 text-right pr-4">
            <div className="flex items-center justify-end gap-1">
              <input
                type="number"
                className="w-20 px-2 py-1.5 border border-gray-300 rounded text-sm text-right"
                placeholder="가격"
                value={editMenuData.price}
                onChange={(e) =>
                  onEditMenuDataChange({
                    ...editMenuData,
                    price: e.target.value,
                  })
                }
              />
              <span className="text-sm">원</span>
            </div>
          </div>

          {/* Actions */}
          <div className="w-16 flex justify-end gap-1">
            <Button size="sm" onClick={onSaveMenu}>
              저장
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancelEditMenu}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Clickable area for editing */}
          <div
            className="flex-1 flex items-center cursor-pointer"
            onClick={() => onEditMenu(menu)}
          >
            <div className="flex-1 text-h4">{menu.name}</div>

            <div className="w-24 text-center text-body">
              {menu.duration_minutes}분
            </div>

            <div className="w-32 text-right text-price">
              {menu.pricing_type === 'FIXED'
                ? `${(menu.base_price || menu.price || 0).toLocaleString()}원`
                : '변동'}
            </div>
          </div>

          <div className="w-16 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMenu(menu.id);
              }}
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

function MenuItems({
  salonId,
  categoryId,
  editingMenuId,
  editMenuData,
  onEditMenu,
  onEditMenuDataChange,
  onSaveMenu,
  onCancelEditMenu,
}: {
  salonId: string;
  categoryId: string;
  editingMenuId: string | null;
  editMenuData: { name: string; price: string; duration: string };
  onEditMenu: (menu: any) => void;
  onEditMenuDataChange: (data: {
    name: string;
    price: string;
    duration: string;
  }) => void;
  onSaveMenu: () => void;
  onCancelEditMenu: () => void;
}) {
  const {
    data: menusData,
    createMenu,
    deleteMenu,
    reorderMenus,
  } = useMenus(salonId, categoryId);

  // Optimistic UI state for sorting
  const [orderedMenus, setOrderedMenus] = React.useState<SalonMenu[]>([]);

  React.useEffect(() => {
    if (menusData) {
      // Sort by display_order if available, otherwise by creation/default
      const sorted = [...menusData].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
      setOrderedMenus(sorted);
    }
  }, [menusData]);

  const [isAdding, setIsAdding] = useState(false);
  const [newMenu, setNewMenu] = useState({
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
      setOrderedMenus((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Call API
        const menusToUpdate = newOrder.map((menu, index) => ({
          id: menu.id,
          display_order: index,
        }));
        reorderMenus(menusToUpdate);

        return newOrder;
      });
    }
  };

  const handleAddMenu = async () => {
    if (!newMenu.name.trim()) {
      alert('메뉴명을 입력해주세요.');
      return;
    }
    if (!newMenu.price) {
      alert('금액을 입력해주세요.');
      return;
    }
    try {
      await createMenu({
        name: newMenu.name,
        duration: newMenu.duration,
        price: newMenu.price,
      });
      setNewMenu({ name: '', price: '', duration: 30 });
      setIsAdding(false);
    } catch (e) {
      console.error(e);
      alert('메뉴 추가 실패');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteMenu(id);
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
          items={orderedMenus.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedMenus.map((menu) => (
            <SortableMenuRow
              key={menu.id}
              menu={menu}
              editingMenuId={editingMenuId}
              editMenuData={editMenuData}
              onEditMenu={onEditMenu}
              onEditMenuDataChange={onEditMenuDataChange}
              onSaveMenu={onSaveMenu}
              onCancelEditMenu={onCancelEditMenu}
              onDeleteMenu={handleDeleteMenu}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add New Menu Form */}
      {isAdding ? (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-100 mt-2">
          <input
            className="flex-1 px-3 py-2 text-sm border rounded-md"
            placeholder="메뉴명 (예: 다운펌)"
            value={newMenu.name}
            onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
            autoFocus
          />
          <select
            className="w-20 px-2 py-2 text-sm border rounded-md"
            value={newMenu.duration}
            onChange={(e) =>
              setNewMenu({
                ...newMenu,
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
          <div className="flex items-center gap-1 w-24">
            <input
              type="number"
              className="w-full px-2 py-2 text-sm border rounded-md text-right"
              placeholder="0"
              value={newMenu.price}
              onChange={(e) =>
                setNewMenu({ ...newMenu, price: e.target.value })
              }
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">원</span>
          </div>
          <Button size="sm" onClick={handleAddMenu}>
            확인
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewMenu({ name: '', price: '', duration: 30 });
            }}
          >
            취소
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" /> 메뉴 추가
        </button>
      )}
    </div>
  );
}
