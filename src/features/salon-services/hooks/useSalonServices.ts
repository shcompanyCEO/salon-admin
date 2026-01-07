import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonServicesApi } from '../api';

export const useIndustries = (salonId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['industries', salonId],
    queryFn: () => salonServicesApi.getIndustries(salonId),
    enabled: !!salonId,
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      industryId,
      isSelected,
    }: {
      industryId: string;
      isSelected: boolean;
    }) =>
      salonServicesApi.toggleIndustry(
        salonId,
        industryId,
        isSelected ? 'remove_industry' : 'add_industry'
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries', salonId] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIndustryIds: string[]) =>
      salonServicesApi.reorderIndustries(salonId, orderedIndustryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries', salonId] });
    },
  });

  return {
    ...query,
    toggleIndustry: toggleMutation.mutateAsync,
    reorderIndustries: reorderMutation.mutateAsync,
  };
};

export const useCategories = (salonId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories', salonId],
    queryFn: () => salonServicesApi.getCategories(salonId),
    enabled: !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: ({
      name,
      displayOrder,
      industryId,
    }: {
      name: string;
      displayOrder: number;
      industryId?: string;
    }) =>
      salonServicesApi.createCategory(salonId, name, displayOrder, industryId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['categories', salonId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salonServicesApi.deleteCategory(salonId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['categories', salonId] }),
  });

  return {
    ...query,
    createCategory: createMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    updateCategory: useMutation({
      mutationFn: ({ id, name }: { id: string; name: string }) =>
        salonServicesApi.updateCategory(salonId, id, { name }),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['categories', salonId] }),
    }).mutateAsync,
    reorderCategories: useMutation({
      mutationFn: (categories: { id: string; display_order: number }[]) =>
        salonServicesApi.updateCategoryOrder(salonId, categories),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['categories', salonId] }),
    }).mutateAsync,
  };
};

export const useServices = (
  salonId: string,
  categoryId?: string,
  options?: { enabled?: boolean }
) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['services', salonId, categoryId || 'all'],
    queryFn: () => salonServicesApi.getServices(salonId, categoryId),
    enabled: options?.enabled !== undefined ? options.enabled : !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: (serviceData: any) => {
      if (!categoryId) throw new Error('Category ID is required');
      return salonServicesApi.createService(salonId, categoryId, serviceData);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        // Invalidate both specific category and all services to update counts
        queryKey: ['services', salonId],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salonServicesApi.deleteService(salonId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['services', salonId],
      }),
  });

  return {
    ...query,
    createService: createMutation.mutateAsync,
    deleteService: deleteMutation.mutateAsync,
    updateService: useMutation({
      mutationFn: ({
        id,
        updates,
      }: {
        id: string;
        updates: { name?: string; price?: number; duration?: number };
      }) => salonServicesApi.updateService(salonId, id, updates),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['services', salonId] }),
    }).mutateAsync,
    reorderServices: useMutation({
      mutationFn: (services: { id: string; display_order: number }[]) =>
        salonServicesApi.reorderServices(salonId, services),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ['services', salonId] }),
    }).mutateAsync,
  };
};
