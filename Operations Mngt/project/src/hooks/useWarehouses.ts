import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseAPI } from '@/services/api/warehouse';
import { useToast } from '@/hooks/useToast';

// Types
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: 'distribution' | 'fulfillment' | 'storage' | 'cross-dock';
  description?: string;
  manager_id?: string;
  manager_name?: string;
  contact_phone?: string;
  contact_email?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  capacity?: number;
  utilization?: number;
  operating_hours?: string;
  temperature_range?: string;
  status: 'active' | 'inactive' | 'maintenance';
  tenant_id: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWarehouseData {
  code: string;
  name: string;
  type: 'distribution' | 'fulfillment' | 'storage' | 'cross-dock';
  description?: string;
  manager_id?: string;
  contact_phone?: string;
  contact_email?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  capacity?: number;
  operating_hours?: string;
  temperature_range?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface UpdateWarehouseData extends Partial<CreateWarehouseData> {
  id: string;
}

// Hooks
export const useWarehouses = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseAPI.getAll,
  });
};

export const useWarehouse = (id: string) => {
  return useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => warehouseAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: warehouseAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create warehouse');
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseData }) => 
      warehouseAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      queryClient.invalidateQueries({ queryKey: ['warehouses', data.id] });
      toast.success('Warehouse updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update warehouse');
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: warehouseAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete warehouse');
    },
  });
};

export const useWarehouseAnalytics = (id?: string) => {
  return useQuery({
    queryKey: ['warehouses', id, 'analytics'],
    queryFn: () => warehouseAPI.getAnalytics(id!),
    enabled: !!id,
  });
};

export const useWarehouseZones = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['warehouses', warehouseId, 'zones'],
    queryFn: () => warehouseAPI.getZones(warehouseId!),
    enabled: !!warehouseId,
  });
};

export const useWarehouseTasks = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['warehouses', warehouseId, 'tasks'],
    queryFn: () => warehouseAPI.getTasks(warehouseId!),
    enabled: !!warehouseId,
  });
}; 