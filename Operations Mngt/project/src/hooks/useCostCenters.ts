import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/services/api/finance';
import type { CostCenter, CreateCostCenterRequest, UpdateCostCenterRequest } from '@/types/finance';

export function useCostCenters(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['cost-centers', params],
    queryFn: () => financeApi.getCostCenters(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCostCenter(id: string) {
  return useQuery({
    queryKey: ['cost-centers', id],
    queryFn: () => financeApi.getCostCenter(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCostCenterRequest) => financeApi.createCostCenter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
    },
  });
}

export function useUpdateCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostCenterRequest }) =>
      financeApi.updateCostCenter(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      queryClient.invalidateQueries({ queryKey: ['cost-centers', data.id] });
    },
  });
}

export function useDeleteCostCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financeApi.deleteCostCenter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
    },
  });
}

export function useCostCenterAnalytics(id: string) {
  return useQuery({
    queryKey: ['cost-centers', id, 'analytics'],
    queryFn: () => financeApi.getCostCenterAnalytics(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
} 