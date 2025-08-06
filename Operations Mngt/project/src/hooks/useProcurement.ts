import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementService } from '@/services/procurement';
import type { PaginationParams } from '@/types/common';
import type { RequisitionFilters, RequisitionFormData } from '@/types/procurement';

export function useProcurement() {
  const queryClient = useQueryClient();

  const useRequisitions = (params: PaginationParams & RequisitionFilters) => {
    return useQuery({
      queryKey: ['requisitions', params],
      queryFn: () => procurementService.getRequisitions(params),
    });
  };

  const useRequisition = (id: string) => {
    return useQuery({
      queryKey: ['requisition', id],
      queryFn: () => procurementService.getRequisitionById(id),
      select: (response) => response.data,
    });
  };

  const useCreateRequisition = () => {
    return useMutation({
      mutationFn: (data: RequisitionFormData) => procurementService.createRequisition(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useUpdateRequisition = () => {
    return useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<RequisitionFormData>;
      }) => procurementService.updateRequisition(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useSubmitRequisition = () => {
    return useMutation({
      mutationFn: (id: string) => procurementService.submitRequisition(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useApproveRequisition = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
        procurementService.approveRequisition(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useRejectRequisition = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment: string }) =>
        procurementService.rejectRequisition(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useCancelRequisition = () => {
    return useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) =>
        procurementService.cancelRequisition(id, reason),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useAddComment = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment: string }) =>
        procurementService.addComment(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      },
    });
  };

  const useUploadAttachment = () => {
    return useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) =>
        procurementService.uploadAttachment(id, file),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      },
    });
  };

  return {
    useRequisitions,
    useRequisition,
    useCreateRequisition,
    useUpdateRequisition,
    useSubmitRequisition,
    useApproveRequisition,
    useRejectRequisition,
    useCancelRequisition,
    useAddComment,
    useUploadAttachment,
  };
}