import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProcurementService } from '@/services/procurement';
import type { PaginationParams } from '@/types/common';
import type { RequisitionFilters, RequisitionFormData } from '@/types/procurement';

export function useProcurement() {
  const queryClient = useQueryClient();

  const useRequisitions = (params: PaginationParams & RequisitionFilters) => {
    return useQuery({
      queryKey: ['requisitions', params],
      queryFn: () => ProcurementService.getRequisitions(params),
    });
  };

  const useRequisition = (id: string) => {
    return useQuery({
      queryKey: ['requisition', id],
      queryFn: () => ProcurementService.getRequisitionById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateRequisition = () => {
    return useMutation({
      mutationFn: (data: RequisitionFormData) => ProcurementService.createRequisition(data),
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
      }) => ProcurementService.updateRequisition(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useSubmitRequisition = () => {
    return useMutation({
      mutationFn: (id: string) => ProcurementService.submitRequisition(id),
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useApproveRequisition = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
        ProcurementService.approveRequisition(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useRejectRequisition = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment: string }) =>
        ProcurementService.rejectRequisition(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useCancelRequisition = () => {
    return useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) =>
        ProcurementService.cancelRequisition(id, reason),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      },
    });
  };

  const useAddComment = () => {
    return useMutation({
      mutationFn: ({ id, comment }: { id: string; comment: string }) =>
        ProcurementService.addComment(id, comment),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      },
    });
  };

  const useUploadAttachment = () => {
    return useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) =>
        ProcurementService.uploadAttachment(id, file),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['requisition', variables.id] });
      },
    });
  };

  const useProcurementAnalytics = (params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    category?: string;
  }) => {
    return useQuery({
      queryKey: ['procurement-analytics', params],
      queryFn: () => ProcurementService.getProcurementAnalytics(params),
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
    useProcurementAnalytics,
  };
} 