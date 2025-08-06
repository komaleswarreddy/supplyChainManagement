import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import type { Forecast } from '@/types/supply-chain';

// Query Keys
export const supplyChainKeys = {
  all: ['supply-chain'] as const,
  forecasts: () => [...supplyChainKeys.all, 'forecasts'] as const,
  forecast: (id: string) => [...supplyChainKeys.forecasts(), id] as const,
  planning: () => [...supplyChainKeys.all, 'planning'] as const,
  optimization: () => [...supplyChainKeys.all, 'optimization'] as const,
};

// Forecast Hooks
export function useForecasts(
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
    algorithm?: string;
    startDateFrom?: string;
    startDateTo?: string;
  } = {}
): UseQueryResult<{
  items: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return useQuery({
    queryKey: [...supplyChainKeys.forecasts(), params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.type) searchParams.set('type', params.type);
      if (params.status) searchParams.set('status', params.status);
      if (params.algorithm) searchParams.set('algorithm', params.algorithm);
      if (params.startDateFrom) searchParams.set('startDateFrom', params.startDateFrom);
      if (params.startDateTo) searchParams.set('startDateTo', params.startDateTo);
      
      const response = await api.get(`/api/supply-chain/forecasts?${searchParams.toString()}`);
      return response.data;
    },
  });
}

export function useForecast(id: string): UseQueryResult<Forecast> {
  return useQuery({
    queryKey: supplyChainKeys.forecast(id),
    queryFn: async () => {
      const response = await api.get(`/api/supply-chain/forecasts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateForecast(): UseMutationResult<any, Error, any> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/supply-chain/forecasts', data);
      return response.data;
    },
    onSuccess: (forecast) => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      toast.success(`Forecast "${forecast.name}" created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create forecast. Please try again.');
    },
  });
}

export function useUpdateForecast(): UseMutationResult<Forecast, Error, { id: string; data: any }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/api/supply-chain/forecasts/${id}`, data);
      return response.data;
    },
    onSuccess: (forecast) => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecast(forecast.id) });
      toast.success(`Forecast "${forecast.itemName}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update forecast. Please try again.');
    },
  });
}

export function useDeleteForecast(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/supply-chain/forecasts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      toast.success('Forecast deleted successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete forecast. Please try again.');
    },
  });
}

export function useRunForecast(): UseMutationResult<Forecast, Error, string> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/supply-chain/forecasts/${id}/run`);
      return response.data;
    },
    onSuccess: (forecast) => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecast(forecast.id) });
      toast.success(`Forecast "${forecast.itemName}" started successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to run forecast. Please try again.');
    },
  });
}

export function useSubmitForecast(): UseMutationResult<any, Error, string> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/supply-chain/forecasts/${id}/submit`);
      return response.data;
    },
    onSuccess: (forecast) => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecast(forecast.id) });
      toast.success('Forecast submitted for approval successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit forecast. Please try again.');
    },
  });
}

export function useApproveForecast(): UseMutationResult<any, Error, string> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/api/supply-chain/forecasts/${id}/approve`);
      return response.data;
    },
    onSuccess: (forecast) => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecast(forecast.id) });
      toast.success('Forecast approved successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to approve forecast. Please try again.');
    },
  });
}

export function useRejectForecast(): UseMutationResult<any, Error, { id: string; reason: string }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(`/api/supply-chain/forecasts/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: (forecast) => {
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecasts() });
      queryClient.invalidateQueries({ queryKey: supplyChainKeys.forecast(forecast.id) });
      toast.success('Forecast rejected successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject forecast. Please try again.');
    },
  });
}

// Mock data for development
export const mockForecasts: Forecast[] = [
  {
    id: '1',
    itemCode: 'ITEM-001',
    itemName: 'Laptop Computer',
    locationId: 'LOC-001',
    locationName: 'Main Warehouse',
    period: 'monthly',
    algorithm: 'exponential_smoothing',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    accuracy: 0.85,
    lastRun: '2024-01-15T10:30:00Z',
    nextRun: '2024-02-15T10:30:00Z',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    metadata: {
      category: 'Electronics',
      productGroup: 'Computers',
      salesChannel: 'Online',
      region: 'North America'
    }
  },
  {
    id: '2',
    itemCode: 'ITEM-002',
    itemName: 'Office Chair',
    locationId: 'LOC-002',
    locationName: 'Secondary Warehouse',
    period: 'weekly',
    algorithm: 'moving_average',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'paused',
    accuracy: 0.78,
    lastRun: '2024-01-10T14:20:00Z',
    nextRun: '2024-01-17T14:20:00Z',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    metadata: {
      category: 'Furniture',
      productGroup: 'Office',
      salesChannel: 'Retail',
      region: 'Europe'
    }
  },
  {
    id: '3',
    itemCode: 'ITEM-003',
    itemName: 'Smartphone',
    locationId: 'LOC-001',
    locationName: 'Main Warehouse',
    period: 'daily',
    algorithm: 'arima',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    accuracy: 0.92,
    lastRun: '2024-01-16T08:15:00Z',
    nextRun: '2024-01-17T08:15:00Z',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-16T08:15:00Z',
    metadata: {
      category: 'Electronics',
      productGroup: 'Mobile',
      salesChannel: 'Online',
      region: 'Global'
    }
  }
];