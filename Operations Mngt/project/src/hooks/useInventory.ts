import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory';
import type { PaginationParams } from '@/types/common';
import type { StockFilters, MovementFilters, AdjustmentFilters } from '@/types/inventory';

export function useInventory() {
  const queryClient = useQueryClient();

  const useStockItems = (params: PaginationParams & StockFilters) => {
    return useQuery({
      queryKey: ['stock-items', params],
      queryFn: () => inventoryService.getStockItems(params),
    });
  };

  const useStockItem = (id: string) => {
    return useQuery({
      queryKey: ['stock-item', id],
      queryFn: () => inventoryService.getStockItemById(id),
      select: (response) => response.data,
    });
  };

  const useStockMovements = (params: PaginationParams & MovementFilters) => {
    return useQuery({
      queryKey: ['stock-movements', params],
      queryFn: () => inventoryService.getStockMovements(params),
    });
  };

  const useStockMovement = (id: string) => {
    return useQuery({
      queryKey: ['stock-movement', id],
      queryFn: () => inventoryService.getStockMovementById(id),
      select: (response) => response.data,
    });
  };

  const useCreateStockMovement = () => {
    return useMutation({
      mutationFn: inventoryService.createStockMovement,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
        queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      },
    });
  };

  const useStockAdjustments = (params: PaginationParams & AdjustmentFilters) => {
    return useQuery({
      queryKey: ['stock-adjustments', params],
      queryFn: () => inventoryService.getStockAdjustments(params),
    });
  };

  const useStockAdjustment = (id: string) => {
    return useQuery({
      queryKey: ['stock-adjustment', id],
      queryFn: () => inventoryService.getStockAdjustmentById(id),
      select: (response) => response.data,
    });
  };

  const useCreateStockAdjustment = () => {
    return useMutation({
      mutationFn: inventoryService.createStockAdjustment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
        queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      },
    });
  };

  const useApproveAdjustment = () => {
    return useMutation({
      mutationFn: ({ id, approver }) => inventoryService.approveAdjustment(id, approver),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
        queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      },
    });
  };

  const useRejectAdjustment = () => {
    return useMutation({
      mutationFn: inventoryService.rejectAdjustment,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['stock-adjustments'] });
        queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      },
    });
  };

  return {
    useStockItems,
    useStockItem,
    useStockMovements,
    useStockMovement,
    useCreateStockMovement,
    useStockAdjustments,
    useStockAdjustment,
    useCreateStockAdjustment,
    useApproveAdjustment,
    useRejectAdjustment,
  };
}