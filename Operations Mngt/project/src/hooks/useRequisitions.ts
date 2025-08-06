import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { procurementApi } from '@/services/api/procurement';
import { Requisition, CreateRequisitionRequest, UpdateRequisitionRequest } from '@/types/procurement';

export const useRequisitions = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  requestorId?: string;
  department?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['requisitions', params],
    queryFn: () => procurementApi.getRequisitions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRequisition = (id: string) => {
  return useQuery({
    queryKey: ['requisition', id],
    queryFn: () => procurementApi.getRequisition(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRequisitionRequest) => procurementApi.createRequisition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
};

export const useUpdateRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRequisitionRequest }) =>
      procurementApi.updateRequisition(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', id] });
    },
  });
};

export const useDeleteRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => procurementApi.deleteRequisition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
};

export const useSubmitRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => procurementApi.submitRequisition(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', id] });
    },
  });
};

export const useApproveRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, approvalData }: { 
      id: string; 
      approvalData: { approvedBy: string; comments?: string } 
    }) => procurementApi.approveRequisition(id, approvalData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', id] });
    },
  });
};

export const useRejectRequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, rejectionData }: { 
      id: string; 
      rejectionData: { rejectedBy: string; reason: string } 
    }) => procurementApi.rejectRequisition(id, rejectionData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['requisition', id] });
    },
  });
};

export const useConvertToPurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, conversionData }: { 
      id: string; 
      conversionData: { supplierId: string; convertedBy: string; notes?: string } 
    }) => procurementApi.convertToPurchaseOrder(id, conversionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

export const useRequisitionTemplates = (params?: {
  page?: number;
  limit?: number;
  ownerId?: string;
  shared?: boolean;
}) => {
  return useQuery({
    queryKey: ['requisition-templates', params],
    queryFn: () => procurementApi.getRequisitionTemplates(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateRequisitionTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      shared: boolean;
      items: Array<{
        itemId: string;
        quantity: number;
        unitOfMeasure: string;
      }>;
    }) => procurementApi.createRequisitionTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisition-templates'] });
    },
  });
};

export const useApplyTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ templateId, requisitionData }: { 
      templateId: string; 
      requisitionData: {
        department: string;
        costCenter: string;
        justification: string;
      } 
    }) => procurementApi.applyTemplate(templateId, requisitionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
};

export const useBulkApproveRequisitions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, approvalData }: { 
      ids: string[]; 
      approvalData: { approvedBy: string; comments?: string } 
    }) => procurementApi.bulkApproveRequisitions(ids, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
};

export const useExportRequisitions = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'excel' | 'pdf';
      status?: string;
      startDate?: string;
      endDate?: string;
    }) => procurementApi.exportRequisitions(params),
  });
}; 