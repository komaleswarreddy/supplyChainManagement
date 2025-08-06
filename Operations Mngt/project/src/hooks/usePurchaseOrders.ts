import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderApi } from '@/services/api/purchase-order';
import { PurchaseOrder, CreatePurchaseOrderRequest, UpdatePurchaseOrderRequest } from '@/types/purchase-order';

export const usePurchaseOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () => purchaseOrderApi.getPurchaseOrders(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePurchaseOrder = (id: string) => {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => purchaseOrderApi.getPurchaseOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) => purchaseOrderApi.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderRequest }) =>
      purchaseOrderApi.updatePurchaseOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

export const useApprovePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, approvalData }: { 
      id: string; 
      approvalData: { approvedBy: string; comments?: string } 
    }) => purchaseOrderApi.approvePurchaseOrder(id, approvalData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
};

export const useRejectPurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, rejectionData }: { 
      id: string; 
      rejectionData: { rejectedBy: string; reason: string } 
    }) => purchaseOrderApi.rejectPurchaseOrder(id, rejectionData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
};

export const useSendToSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, sendData }: { 
      id: string; 
      sendData: { method: 'email' | 'edi' | 'portal'; recipientEmail?: string } 
    }) => purchaseOrderApi.sendToSupplier(id, sendData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
};

export const useAcknowledgeFromSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, acknowledgmentData }: { 
      id: string; 
      acknowledgmentData: {
        acknowledgedBy: string;
        confirmedDeliveryDate?: string;
        priceConfirmation?: boolean;
        quantityConfirmation?: boolean;
        notes?: string;
      } 
    }) => purchaseOrderApi.acknowledgeFromSupplier(id, acknowledgmentData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
};

export const useCreateChangeOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, changeData }: { 
      id: string; 
      changeData: {
        changeReason: string;
        changes: Array<{
          field: string;
          oldValue: any;
          newValue: any;
        }>;
      } 
    }) => purchaseOrderApi.createChangeOrder(id, changeData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] });
    },
  });
};

export const usePurchaseOrderHistory = (id: string) => {
  return useQuery({
    queryKey: ['purchase-order-history', id],
    queryFn: () => purchaseOrderApi.getPurchaseOrderHistory(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePurchaseOrderAnalytics = (params?: {
  startDate?: string;
  endDate?: string;
  supplierId?: string;
  category?: string;
}) => {
  return useQuery({
    queryKey: ['purchase-order-analytics', params],
    queryFn: () => purchaseOrderApi.getPurchaseOrderAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBulkApprovePurchaseOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, approvalData }: { 
      ids: string[]; 
      approvalData: { approvedBy: string; comments?: string } 
    }) => purchaseOrderApi.bulkApprove(ids, approvalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

export const useBulkSendPurchaseOrders = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, sendData }: { 
      ids: string[]; 
      sendData: { method: 'email' | 'edi' | 'portal' } 
    }) => purchaseOrderApi.bulkSend(ids, sendData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });
};

export const useExportPurchaseOrders = () => {
  return useMutation({
    mutationFn: (params?: {
      format?: 'csv' | 'excel' | 'pdf';
      status?: string;
      supplierId?: string;
      startDate?: string;
      endDate?: string;
    }) => purchaseOrderApi.exportPurchaseOrders(params),
  });
};