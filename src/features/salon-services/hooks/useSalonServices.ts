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

  return { ...query, toggleIndustry: toggleMutation.mutateAsync };
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
    }: {
      name: string;
      displayOrder: number;
    }) => salonServicesApi.createCategory(salonId, name, displayOrder),
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
  };
};

export const useServices = (salonId: string, categoryId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['services', salonId, categoryId],
    queryFn: () => salonServicesApi.getServices(salonId, categoryId),
    enabled: !!salonId && !!categoryId,
  });

  const createMutation = useMutation({
    mutationFn: (serviceData: any) =>
      salonServicesApi.createService(salonId, categoryId, serviceData),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['services', salonId, categoryId],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => salonServicesApi.deleteService(salonId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['services', salonId, categoryId],
      }),
  });

  return {
    ...query,
    createService: createMutation.mutateAsync,
    deleteService: deleteMutation.mutateAsync,
  };
};
