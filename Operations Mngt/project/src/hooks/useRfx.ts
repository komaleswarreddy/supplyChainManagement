import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as rfxService from '@/services/rfx';
import type { PaginationParams } from '@/types/common';
import type { RfxFilters } from '@/types/rfx';

export function useRfx() {
  const queryClient = useQueryClient();

  const useRfxList = (params: PaginationParams & RfxFilters) => {
    return useQuery({
      queryKey: ['rfx', params],
      queryFn: () => rfxService.getRfxList(params),
    });
  };

  const useRfxById = (id: string) => {
    return useQuery({
      queryKey: ['rfx', id],
      queryFn: () => rfxService.getRfxById(id),
    });
  };

  const useCreateRfx = () => {
    return useMutation({
      mutationFn: rfxService.createRfx,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useUpdateRfx = () => {
    return useMutation({
      mutationFn: ({ id, data }) => rfxService.updateRfx(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const usePublishRfx = () => {
    return useMutation({
      mutationFn: rfxService.publishRfx,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  const useCloseRfx = () => {
    return useMutation({
      mutationFn: rfxService.closeRfx,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', id] });
        queryClient.invalidateQueries({ queryKey: ['rfx'] });
      },
    });
  };

  // Remove useCancelRfx and useUploadDocument if not implemented in rfxService

  const useSubmitResponse = () => {
    return useMutation({
      mutationFn: ({ id, response }) => rfxService.submitResponse(id, response),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['rfx', variables.id] });
      },
    });
  };

  return {
    useRfxList,
    useRfxById,
    useCreateRfx,
    useUpdateRfx,
    usePublishRfx,
    useCloseRfx,
    useSubmitResponse,
  };
}