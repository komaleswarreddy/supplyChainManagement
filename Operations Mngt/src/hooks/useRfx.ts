import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RfxService } from '@/services/rfx';
import type { PaginationParams } from '@/types/common';
import type { RfxFilters, RfxFormData } from '@/types/rfx';

export function useRfx() {
  const queryClient = useQueryClient();

  const useRfxList = (params: PaginationParams & RfxFilters) => {
    return useQuery({
      queryKey: ['rfx', params],
      queryFn: () => RfxService.getRfxList(params),
    });
  };

  const useRfxById = (id: string) => {
    return useQuery({
      queryKey: ['rfx', id],
      queryFn: () => RfxService.getRfxById(id),
      enabled: !!id,
    });
  };

  const useCreateRfx = () => {
    return useMutation({
      mutationFn: (data: RfxFormData) => RfxService.createRfx(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useUpdateRfx = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<RfxFormData> }) => 
        RfxService.updateRfx(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useDeleteRfx = () => {
    return useMutation({
      mutationFn: (id: string) => RfxService.deleteRfx(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const usePublishRfx = () => {
    return useMutation({
      mutationFn: (id: string) => RfxService.publishRfx(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useCloseRfx = () => {
    return useMutation({
      mutationFn: (id: string) => RfxService.closeRfx(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useAwardRfx = () => {
    return useMutation({
      mutationFn: ({ id, supplierId, notes }: { id: string; supplierId: string; notes?: string }) => 
        RfxService.awardRfx(id, supplierId, notes),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useRfxResponses = (rfxId: string, params?: PaginationParams) => {
    return useQuery({
      queryKey: ['rfx-responses', rfxId, params],
      queryFn: () => RfxService.getRfxResponses(rfxId, params),
      enabled: !!rfxId,
    });
  };

  const useSubmitResponse = () => {
    return useMutation({
      mutationFn: ({ rfxId, responseData }: { rfxId: string; responseData: any }) => 
        RfxService.submitResponse(rfxId, responseData),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['rfx-responses', variables.rfxId] });
        queryClient.invalidateQueries({ queryKey: ['rfx', variables.rfxId] });
      },
    });
  };

  const useRfxAnalytics = (params?: { 
    startDate?: string; 
    endDate?: string; 
    type?: string; 
    department?: string; 
  }) => {
    return useQuery({
      queryKey: ['rfx-analytics', params],
      queryFn: () => RfxService.getRfxAnalytics(params),
    });
  };

  return {
    useRfxList,
    useRfxById,
    useCreateRfx,
    useUpdateRfx,
    useDeleteRfx,
    usePublishRfx,
    useCloseRfx,
    useAwardRfx,
    useRfxResponses,
    useSubmitResponse,
    useRfxAnalytics,
  };
} 