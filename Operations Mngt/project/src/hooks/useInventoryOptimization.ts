import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useToast } from '@/hooks/useToast';

// Types for inventory optimization
export interface InventoryOptimizationData {
  overallPerformance: {
    serviceLevel: number;
    inventoryTurnover: number;
    stockoutRate: number;
    carryingCost: number;
    totalInventoryValue: number;
  };
  safetyStock: Array<{
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    locationId: string;
    locationName: string;
    currentLevel: number;
    recommendedLevel: number;
    serviceLevel: number;
    leadTime: number;
    demandVariability: number;
    supplyVariability: number;
    lastUpdated: string;
  }>;
  reorderPoints: Array<{
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    locationId: string;
    locationName: string;
    currentReorderPoint: number;
    recommendedReorderPoint: number;
    safetyStock: number;
    leadTimeDemand: number;
    cycleStock: number;
    lastUpdated: string;
  }>;
  abcClassification: Array<{
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    category: 'A' | 'B' | 'C';
    annualValue: number;
    annualVolume: number;
    percentageOfValue: number;
    percentageOfVolume: number;
    recommendedPolicy: string;
  }>;
  inventoryPolicies: Array<{
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    locationId: string;
    locationName: string;
    currentPolicy: string;
    recommendedPolicy: string;
    minOrderQuantity: number;
    maxOrderQuantity: number;
    orderFrequency: number;
    reviewPeriod: number;
    lastUpdated: string;
  }>;
  recommendations: Array<{
    id: string;
    type: 'SAFETY_STOCK' | 'REORDER_POINT' | 'POLICY_CHANGE' | 'ABC_REVIEW';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    impact: {
      costSavings: number;
      serviceLevelImprovement: number;
      inventoryReduction: number;
    };
    implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH';
    estimatedTimeline: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  }>;
}

export interface OptimizationFilters {
  category?: string;
  location?: string;
  priority?: string;
  status?: string;
}

// Query keys
const optimizationKeys = {
  all: ['inventory-optimization'] as const,
  data: (filters?: OptimizationFilters) => [...optimizationKeys.all, 'data', filters] as const,
  safetyStock: (filters?: OptimizationFilters) => [...optimizationKeys.all, 'safety-stock', filters] as const,
  reorderPoints: (filters?: OptimizationFilters) => [...optimizationKeys.all, 'reorder-points', filters] as const,
  abcClassification: (filters?: OptimizationFilters) => [...optimizationKeys.all, 'abc-classification', filters] as const,
  inventoryPolicies: (filters?: OptimizationFilters) => [...optimizationKeys.all, 'inventory-policies', filters] as const,
  recommendations: (filters?: OptimizationFilters) => [...optimizationKeys.all, 'recommendations', filters] as const,
};

// Main hook for inventory optimization data
export function useInventoryOptimization(
  filters: OptimizationFilters = {}
): UseQueryResult<InventoryOptimizationData> {
  return useQuery({
    queryKey: optimizationKeys.data(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get(`/api/supply-chain/inventory-optimization?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for safety stock data
export function useSafetyStock(
  filters: OptimizationFilters = {}
): UseQueryResult<InventoryOptimizationData['safetyStock']> {
  return useQuery({
    queryKey: optimizationKeys.safetyStock(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);

      const response = await apiClient.get(`/api/supply-chain/inventory-optimization/safety-stock?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for reorder points data
export function useReorderPoints(
  filters: OptimizationFilters = {}
): UseQueryResult<InventoryOptimizationData['reorderPoints']> {
  return useQuery({
    queryKey: optimizationKeys.reorderPoints(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);

      const response = await apiClient.get(`/api/supply-chain/inventory-optimization/reorder-points?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for ABC classification data
export function useABCClassification(
  filters: OptimizationFilters = {}
): UseQueryResult<InventoryOptimizationData['abcClassification']> {
  return useQuery({
    queryKey: optimizationKeys.abcClassification(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);

      const response = await apiClient.get(`/api/supply-chain/inventory-optimization/abc-classification?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for inventory policies data
export function useInventoryPolicies(
  filters: OptimizationFilters = {}
): UseQueryResult<InventoryOptimizationData['inventoryPolicies']> {
  return useQuery({
    queryKey: optimizationKeys.inventoryPolicies(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);

      const response = await apiClient.get(`/api/supply-chain/inventory-optimization/policies?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for optimization recommendations
export function useOptimizationRecommendations(
  filters: OptimizationFilters = {}
): UseQueryResult<InventoryOptimizationData['recommendations']> {
  return useQuery({
    queryKey: optimizationKeys.recommendations(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);

      const response = await apiClient.get(`/api/supply-chain/inventory-optimization/recommendations?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation hooks
export function useUpdateSafetyStock(): UseMutationResult<any, Error, { id: string; data: any }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/supply-chain/inventory-optimization/safety-stock/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: optimizationKeys.safetyStock() });
      queryClient.invalidateQueries({ queryKey: optimizationKeys.data() });
      toast.success('Safety stock updated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update safety stock. Please try again.');
    },
  });
}

export function useUpdateReorderPoint(): UseMutationResult<any, Error, { id: string; data: any }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/supply-chain/inventory-optimization/reorder-points/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: optimizationKeys.reorderPoints() });
      queryClient.invalidateQueries({ queryKey: optimizationKeys.data() });
      toast.success('Reorder point updated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update reorder point. Please try again.');
    },
  });
}

export function useUpdateInventoryPolicy(): UseMutationResult<any, Error, { id: string; data: any }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/api/supply-chain/inventory-optimization/policies/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: optimizationKeys.inventoryPolicies() });
      queryClient.invalidateQueries({ queryKey: optimizationKeys.data() });
      toast.success('Inventory policy updated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update inventory policy. Please try again.');
    },
  });
}

export function useRunOptimization(): UseMutationResult<any, Error, void> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/supply-chain/inventory-optimization/run');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: optimizationKeys.all });
      toast.success('Inventory optimization analysis completed successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to run optimization analysis. Please try again.');
    },
  });
}

export function useApplyRecommendation(): UseMutationResult<any, Error, { id: string; action: 'APPLY' | 'REJECT' }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'APPLY' | 'REJECT' }) => {
      const response = await apiClient.post(`/api/supply-chain/inventory-optimization/recommendations/${id}/${action.toLowerCase()}`);
      return response.data;
    },
    onSuccess: (data, { action }) => {
      queryClient.invalidateQueries({ queryKey: optimizationKeys.recommendations() });
      queryClient.invalidateQueries({ queryKey: optimizationKeys.data() });
      toast.success(`Recommendation ${action.toLowerCase()}ed successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process recommendation. Please try again.');
    },
  });
}

// Mock data for development
export const mockOptimizationData: InventoryOptimizationData = {
  overallPerformance: {
    serviceLevel: 94.2,
    inventoryTurnover: 8.5,
    stockoutRate: 0.058,
    carryingCost: 125000,
    totalInventoryValue: 2500000,
  },
  safetyStock: [
    {
      id: '1',
      itemId: 'item-1',
      itemCode: 'ITEM-001',
      itemName: 'Laptop Computer',
      locationId: 'loc-1',
      locationName: 'Main Warehouse',
      currentLevel: 50,
      recommendedLevel: 75,
      serviceLevel: 95,
      leadTime: 14,
      demandVariability: 0.25,
      supplyVariability: 0.15,
      lastUpdated: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      itemId: 'item-2',
      itemCode: 'ITEM-002',
      itemName: 'Office Chair',
      locationId: 'loc-1',
      locationName: 'Main Warehouse',
      currentLevel: 30,
      recommendedLevel: 45,
      serviceLevel: 90,
      leadTime: 21,
      demandVariability: 0.20,
      supplyVariability: 0.10,
      lastUpdated: '2024-01-14T14:20:00Z',
    },
  ],
  reorderPoints: [
    {
      id: '1',
      itemId: 'item-1',
      itemCode: 'ITEM-001',
      itemName: 'Laptop Computer',
      locationId: 'loc-1',
      locationName: 'Main Warehouse',
      currentReorderPoint: 100,
      recommendedReorderPoint: 125,
      safetyStock: 75,
      leadTimeDemand: 50,
      cycleStock: 25,
      lastUpdated: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      itemId: 'item-2',
      itemCode: 'ITEM-002',
      itemName: 'Office Chair',
      locationId: 'loc-1',
      locationName: 'Main Warehouse',
      currentReorderPoint: 60,
      recommendedReorderPoint: 80,
      safetyStock: 45,
      leadTimeDemand: 35,
      cycleStock: 20,
      lastUpdated: '2024-01-14T14:20:00Z',
    },
  ],
  abcClassification: [
    {
      id: '1',
      itemId: 'item-1',
      itemCode: 'ITEM-001',
      itemName: 'Laptop Computer',
      category: 'A',
      annualValue: 500000,
      annualVolume: 1000,
      percentageOfValue: 20,
      percentageOfVolume: 5,
      recommendedPolicy: 'Continuous Review',
    },
    {
      id: '2',
      itemId: 'item-2',
      itemCode: 'ITEM-002',
      itemName: 'Office Chair',
      category: 'B',
      annualValue: 200000,
      annualVolume: 2000,
      percentageOfValue: 8,
      percentageOfVolume: 10,
      recommendedPolicy: 'Periodic Review',
    },
  ],
  inventoryPolicies: [
    {
      id: '1',
      itemId: 'item-1',
      itemCode: 'ITEM-001',
      itemName: 'Laptop Computer',
      locationId: 'loc-1',
      locationName: 'Main Warehouse',
      currentPolicy: 'Continuous Review',
      recommendedPolicy: 'Continuous Review',
      minOrderQuantity: 25,
      maxOrderQuantity: 100,
      orderFrequency: 7,
      reviewPeriod: 1,
      lastUpdated: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      itemId: 'item-2',
      itemCode: 'ITEM-002',
      itemName: 'Office Chair',
      locationId: 'loc-1',
      locationName: 'Main Warehouse',
      currentPolicy: 'Periodic Review',
      recommendedPolicy: 'Periodic Review',
      minOrderQuantity: 50,
      maxOrderQuantity: 200,
      orderFrequency: 14,
      reviewPeriod: 7,
      lastUpdated: '2024-01-14T14:20:00Z',
    },
  ],
  recommendations: [
    {
      id: '1',
      type: 'SAFETY_STOCK',
      priority: 'HIGH',
      title: 'Increase Safety Stock for Laptop Computers',
      description: 'Current safety stock level is below recommended level. Increasing to 75 units will improve service level.',
      impact: {
        costSavings: 15000,
        serviceLevelImprovement: 2.5,
        inventoryReduction: 0,
      },
      implementationEffort: 'LOW',
      estimatedTimeline: '1 week',
      status: 'PENDING',
    },
    {
      id: '2',
      type: 'REORDER_POINT',
      priority: 'MEDIUM',
      title: 'Adjust Reorder Point for Office Chairs',
      description: 'Reorder point should be increased to 80 units to account for lead time variability.',
      impact: {
        costSavings: 8000,
        serviceLevelImprovement: 1.5,
        inventoryReduction: 0,
      },
      implementationEffort: 'LOW',
      estimatedTimeline: '1 week',
      status: 'PENDING',
    },
  ],
};

// Export aliases for backward compatibility
export const useABCClassifications = useABCClassification;
export const useReorderPointCalculations = useReorderPoints;
export const useSafetyStockCalculations = useSafetyStock;