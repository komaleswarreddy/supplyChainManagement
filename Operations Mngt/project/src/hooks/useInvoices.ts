import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  invoiceAPI, 
  invoiceAnalyticsAPI,
  type Invoice, 
  type CreateInvoice, 
  type UpdateInvoice,
  type InvoiceItem,
  type CreateInvoiceItem,
  type InvoicePayment,
  type CreateInvoicePayment,
  type InvoiceDispute,
  type CreateInvoiceDispute,
  type InvoiceTemplate,
  type CreateInvoiceTemplate
} from '@/services/api/invoices';

// Invoice Hooks
export const useInvoices = (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceAPI.getAll(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoiceAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoice) => invoiceAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoice }) => 
      invoiceAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useApproveInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceAPI.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
};

// Invoice Items Hooks
export const useInvoiceItems = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'items'],
    queryFn: () => invoiceAPI.getItems(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useAddInvoiceItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: CreateInvoiceItem }) => 
      invoiceAPI.addItem(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId, 'items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    },
  });
};

export const useUpdateInvoiceItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      invoiceId, 
      itemId, 
      data 
    }: { 
      invoiceId: string; 
      itemId: string; 
      data: Partial<CreateInvoiceItem> 
    }) => invoiceAPI.updateItem(invoiceId, itemId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId, 'items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    },
  });
};

export const useDeleteInvoiceItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, itemId }: { invoiceId: string; itemId: string }) => 
      invoiceAPI.deleteItem(invoiceId, itemId),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId, 'items'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    },
  });
};

// Invoice Payments Hooks
export const useInvoicePayments = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'payments'],
    queryFn: () => invoiceAPI.getPayments(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useAddInvoicePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: CreateInvoicePayment }) => 
      invoiceAPI.addPayment(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId, 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    },
  });
};

// Invoice Disputes Hooks
export const useInvoiceDisputes = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'disputes'],
    queryFn: () => invoiceAPI.getDisputes(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useCreateInvoiceDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ invoiceId, data }: { invoiceId: string; data: CreateInvoiceDispute }) => 
      invoiceAPI.createDispute(invoiceId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId, 'disputes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    },
  });
};

export const useUpdateInvoiceDispute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      invoiceId, 
      disputeId, 
      data 
    }: { 
      invoiceId: string; 
      disputeId: string; 
      data: Partial<CreateInvoiceDispute> 
    }) => invoiceAPI.updateDispute(invoiceId, disputeId, data),
    onSuccess: (_, { invoiceId }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId, 'disputes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
    },
  });
};

// Invoice Templates Hooks
export const useInvoiceTemplates = () => {
  return useQuery({
    queryKey: ['invoices', 'templates'],
    queryFn: () => invoiceAPI.getTemplates(),
  });
};

export const useInvoiceTemplate = (id: string) => {
  return useQuery({
    queryKey: ['invoices', 'templates', id],
    queryFn: () => invoiceAPI.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateInvoiceTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoiceTemplate) => invoiceAPI.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'templates'] });
    },
  });
};

export const useUpdateInvoiceTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateInvoiceTemplate> }) => 
      invoiceAPI.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['invoices', 'templates', id] });
    },
  });
};

export const useDeleteInvoiceTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceAPI.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', 'templates'] });
    },
  });
};

// Invoice Analytics Hooks
export const useInvoiceDashboard = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['invoices', 'analytics', 'dashboard', params],
    queryFn: () => invoiceAnalyticsAPI.getDashboard(params),
  });
};

export const useInvoiceMetrics = (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
  return useQuery({
    queryKey: ['invoices', 'analytics', 'metrics', params],
    queryFn: () => invoiceAnalyticsAPI.getMetrics(params),
  });
};

export const useInvoiceReports = (params?: { startDate?: string; endDate?: string; type?: string }) => {
  return useQuery({
    queryKey: ['invoices', 'analytics', 'reports', params],
    queryFn: () => invoiceAnalyticsAPI.getReports(params),
  });
}; 