import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoice';
import type { PaginationParams } from '@/types/common';
import type { 
  InvoiceFilters, 
  InvoiceFormData, 
  DisputeFormData, 
  PaymentScheduleFormData 
} from '@/types/invoice';

export const useInvoices = (params: PaginationParams & InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceService.getInvoices(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getInvoiceById(id),
    select: (response) => response.data,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InvoiceFormData> }) => 
      invoiceService.updateInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useSubmitForMatching = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.submitForMatching,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const usePerformMatching = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.performMatching,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useResolveException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, 
      exceptionIndex, 
      resolution 
    }: { 
      id: string; 
      exceptionIndex: number; 
      resolution: string; 
    }) => 
      invoiceService.resolveException(id, exceptionIndex, resolution),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useSubmitForApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.submitForApproval,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useApproveInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, 
      level, 
      comment 
    }: { 
      id: string; 
      level: number; 
      comment?: string; 
    }) => 
      invoiceService.approveInvoice(id, level, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useRejectInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, 
      level, 
      reason 
    }: { 
      id: string; 
      level: number; 
      reason: string; 
    }) => 
      invoiceService.rejectInvoice(id, level, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useCreateDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dispute }: { id: string; dispute: DisputeFormData }) => 
      invoiceService.createDispute(id, dispute),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useAddDisputeCommunication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ 
      id, 
      message, 
      senderType 
    }: { 
      id: string; 
      message: string; 
      senderType: 'INTERNAL' | 'SUPPLIER'; 
    }) => 
      invoiceService.addDisputeCommunication(id, message, senderType),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
};

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) => 
      invoiceService.resolveDispute(id, resolution),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useSchedulePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentData }: { id: string; paymentData: PaymentScheduleFormData }) => 
      invoiceService.schedulePayment(id, paymentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.processPayment,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => 
      invoiceService.uploadAttachment(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
};

export const useProcessInvoiceImage = () => {
  return useMutation({
    mutationFn: invoiceService.processInvoiceImage,
  });
};

export const useInvoiceAnalytics = () => {
  return useQuery({
    queryKey: ['invoice-analytics'],
    queryFn: () => invoiceService.getInvoiceAnalytics(),
    select: (response) => response.data,
  });
};