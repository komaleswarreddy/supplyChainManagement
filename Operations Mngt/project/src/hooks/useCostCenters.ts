import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costCenterApi } from '@/services/api/finance';
import { useToast } from '@/hooks/useToast';

// Types
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  type: 'department' | 'project' | 'location' | 'function';
  description?: string;
  manager_id?: string;
  manager_name?: string;
  parent_id?: string;
  parent_name?: string;
  location?: string;
  budget?: number;
  spent?: number;
  effective_from?: string;
  effective_to?: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  tenant_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCostCenterData {
  code: string;
  name: string;
  type: 'department' | 'project' | 'location' | 'function';
  description?: string;
  manager_id?: string;
  parent_id?: string;
  location?: string;
  budget?: number;
  effective_from?: string;
  effective_to?: string;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string;
}

export interface UpdateCostCenterData extends Partial<CreateCostCenterData> {
  id: string;
}

// Hooks
export const useCostCenters = () => {
  return useQuery({
    queryKey: ['cost-centers'],
    queryFn: costCenterApi.getAll,
  });
};

export const useCostCenter = (id: string) => {
  return useQuery({
    queryKey: ['cost-centers', id],
    queryFn: () => costCenterApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: costCenterApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Cost center created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create cost center');
    },
  });
};

export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostCenterData }) => 
      costCenterApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      queryClient.invalidateQueries({ queryKey: ['cost-centers', data.id] });
      toast.success('Cost center updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update cost center');
    },
  });
};

export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: costCenterApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centers'] });
      toast.success('Cost center deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete cost center');
    },
  });
};

export const useCostCenterAnalytics = (id?: string) => {
  return useQuery({
    queryKey: ['cost-centers', id, 'analytics'],
    queryFn: () => costCenterApi.getAnalytics(id!),
    enabled: !!id,
  });
}; 