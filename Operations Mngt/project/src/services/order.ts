import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { 
  Order, 
  OrderListResponse, 
  OrderDetailResponse, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  Customer,
  CustomerListResponse,
  CreateCustomerRequest,
  OrderFulfillment,
  Shipment,
  OrderReturn,
  Payment,
  OrderAnalytics,
  OrderFilters,
  CustomerFilters,
  BulkOrderOperation,
  BulkOperationResult,
  OrderTemplate,
  FulfillmentStatus,
  ShipmentStatus,
  ReturnStatus,
  PaymentStatus
} from '@/types/order';
import { api } from '@/lib/api';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  analytics: () => [...orderKeys.all, 'analytics'] as const,
  templates: () => [...orderKeys.all, 'templates'] as const,
};

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
};

export const fulfillmentKeys = {
  all: ['fulfillments'] as const,
  lists: () => [...fulfillmentKeys.all, 'list'] as const,
  list: (orderId?: string) => [...fulfillmentKeys.lists(), orderId] as const,
  details: () => [...fulfillmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...fulfillmentKeys.details(), id] as const,
};

export const shipmentKeys = {
  all: ['shipments'] as const,
  lists: () => [...shipmentKeys.all, 'list'] as const,
  list: (orderId?: string) => [...shipmentKeys.lists(), orderId] as const,
  details: () => [...shipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
};

export const returnKeys = {
  all: ['returns'] as const,
  lists: () => [...returnKeys.all, 'list'] as const,
  list: (orderId?: string) => [...returnKeys.lists(), orderId] as const,
  details: () => [...returnKeys.all, 'detail'] as const,
  detail: (id: string) => [...returnKeys.details(), id] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (orderId?: string) => [...paymentKeys.lists(), orderId] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

// ============================================================================
// ORDER HOOKS
// ============================================================================

export function useOrders(
  filters: OrderFilters = {},
  options?: { enabled?: boolean }
): UseQueryResult<OrderListResponse> {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status?.length) params.set('status', filters.status.join(','));
      if (filters.priority?.length) params.set('priority', filters.priority.join(','));
      if (filters.type?.length) params.set('type', filters.type.join(','));
      if (filters.paymentStatus?.length) params.set('paymentStatus', filters.paymentStatus.join(','));
      if (filters.customerId) params.set('customerId', filters.customerId);
      if (filters.search) params.set('search', filters.search);
      if (filters.tags?.length) params.set('tags', filters.tags.join(','));
      if (filters.source?.length) params.set('source', filters.source.join(','));
      if (filters.dateRange) {
        params.set('startDate', filters.dateRange.start);
        params.set('endDate', filters.dateRange.end);
      }
      if (filters.amountRange) {
        params.set('minAmount', filters.amountRange.min.toString());
        params.set('maxAmount', filters.amountRange.max.toString());
      }

      const response = await api.get(`/api/orders?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled,
  });
}

export function useOrderDetail(orderId: string): UseQueryResult<OrderDetailResponse> {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateOrder(): UseMutationResult<Order, Error, CreateOrderRequest> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    },
    onSuccess: (newOrder) => {
      // Invalidate and refetch order lists
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Add the new order to cache
      queryClient.setQueryData(orderKeys.detail(newOrder.id), {
        order: newOrder,
        relatedOrders: [],
        customerHistory: {},
        availableActions: [],
      });
      toast.success(`Order ${newOrder.orderNumber} has been created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order. Please try again.');
    },
  });
}

export function useUpdateOrder(): UseMutationResult<Order, Error, { id: string; data: UpdateOrderRequest }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderRequest }) => {
      const response = await api.put(`/api/orders/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), (old: OrderDetailResponse | undefined) => 
        old ? { ...old, order: updatedOrder } : undefined
      );
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Order ${updatedOrder.orderNumber} has been updated successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order. Please try again.');
    },
  });
}

export function useCancelOrder(): UseMutationResult<Order, Error, string> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.post(`/api/orders/${orderId}/cancel`);
      return response.data;
    },
    onSuccess: (cancelledOrder) => {
      queryClient.setQueryData(orderKeys.detail(cancelledOrder.id), (old: OrderDetailResponse | undefined) => 
        old ? { ...old, order: cancelledOrder } : undefined
      );
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Order ${cancelledOrder.orderNumber} has been cancelled.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel order. Please try again.');
    },
  });
}

export function useBulkOrderOperation(): UseMutationResult<BulkOperationResult, Error, BulkOrderOperation> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (operation: BulkOrderOperation) => {
      const response = await api.post('/api/orders/bulk', operation);
      return response.data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success(`Successfully processed ${result.processedCount} orders${result.failedCount > 0 ? `, ${result.failedCount} failed` : ''}.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to perform bulk operation. Please try again.');
    },
  });
}

// ============================================================================
// CUSTOMER HOOKS
// ============================================================================

export function useCustomers(
  filters: CustomerFilters = {},
  options?: { enabled?: boolean }
): UseQueryResult<CustomerListResponse> {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.status?.length) params.set('status', filters.status.join(','));
      if (filters.customerType?.length) params.set('customerType', filters.customerType.join(','));
      if (filters.loyaltyTier?.length) params.set('loyaltyTier', filters.loyaltyTier.join(','));
      if (filters.search) params.set('search', filters.search);
      if (filters.registrationDateRange) {
        params.set('registrationStartDate', filters.registrationDateRange.start);
        params.set('registrationEndDate', filters.registrationDateRange.end);
      }
      if (filters.orderCountRange) {
        params.set('minOrderCount', filters.orderCountRange.min.toString());
        params.set('maxOrderCount', filters.orderCountRange.max.toString());
      }
      if (filters.totalSpentRange) {
        params.set('minTotalSpent', filters.totalSpentRange.min.toString());
        params.set('maxTotalSpent', filters.totalSpentRange.max.toString());
      }

      const response = await api.get(`/api/customers?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useCustomerDetail(customerId: string): UseQueryResult<Customer> {
  return useQuery({
    queryKey: customerKeys.detail(customerId),
    queryFn: async () => {
      const response = await api.get(`/api/customers/${customerId}`);
      return response.data;
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCustomer(): UseMutationResult<Customer, Error, CreateCustomerRequest> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerData: CreateCustomerRequest) => {
      const response = await api.post('/api/customers', customerData);
      return response.data;
    },
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(newCustomer.id), newCustomer);
      toast.success(`Customer ${newCustomer.firstName} ${newCustomer.lastName} has been created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create customer. Please try again.');
    },
  });
}

export function useUpdateCustomer(): UseMutationResult<Customer, Error, { id: string; data: Partial<CreateCustomerRequest> }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCustomerRequest> }) => {
      const response = await api.put(`/api/customers/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(customerKeys.detail(updatedCustomer.id), updatedCustomer);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success(`Customer ${updatedCustomer.firstName} ${updatedCustomer.lastName} has been updated successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update customer. Please try again.');
    },
  });
}

// ============================================================================
// FULFILLMENT HOOKS
// ============================================================================

export function useFulfillments(orderId?: string): UseQueryResult<OrderFulfillment[]> {
  return useQuery({
    queryKey: fulfillmentKeys.list(orderId),
    queryFn: async () => {
      const url = orderId ? `/api/orders/${orderId}/fulfillments` : '/api/fulfillments';
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useFulfillmentDetail(fulfillmentId: string): UseQueryResult<OrderFulfillment> {
  return useQuery({
    queryKey: fulfillmentKeys.detail(fulfillmentId),
    queryFn: async () => {
      const response = await api.get(`/api/fulfillments/${fulfillmentId}`);
      return response.data;
    },
    enabled: !!fulfillmentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateFulfillmentStatus(): UseMutationResult<OrderFulfillment, Error, { id: string; status: FulfillmentStatus }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FulfillmentStatus }) => {
      const response = await api.put(`/api/fulfillments/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (updatedFulfillment) => {
      queryClient.setQueryData(fulfillmentKeys.detail(updatedFulfillment.id), updatedFulfillment);
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(updatedFulfillment.orderId) });
      toast.success(`Fulfillment ${updatedFulfillment.fulfillmentNumber} status updated to ${updatedFulfillment.status}.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update fulfillment status. Please try again.');
    },
  });
}

// ============================================================================
// SHIPMENT HOOKS
// ============================================================================

export function useShipments(orderId?: string): UseQueryResult<Shipment[]> {
  return useQuery({
    queryKey: shipmentKeys.list(orderId),
    queryFn: async () => {
      const url = orderId ? `/api/orders/${orderId}/shipments` : '/api/shipments';
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useShipmentDetail(shipmentId: string): UseQueryResult<Shipment> {
  return useQuery({
    queryKey: shipmentKeys.detail(shipmentId),
    queryFn: async () => {
      const response = await api.get(`/api/shipments/${shipmentId}`);
      return response.data;
    },
    enabled: !!shipmentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpdateShipmentStatus(): UseMutationResult<Shipment, Error, { id: string; status: ShipmentStatus }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ShipmentStatus }) => {
      const response = await api.put(`/api/shipments/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(shipmentKeys.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(updatedShipment.orderId) });
      toast.success(`Shipment ${updatedShipment.shipmentNumber} status updated to ${updatedShipment.status}.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update shipment status. Please try again.');
    },
  });
}

export function useTrackShipment(): UseMutationResult<Shipment, Error, string> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shipmentId: string) => {
      const response = await api.post(`/api/shipments/${shipmentId}/track`);
      return response.data;
    },
    onSuccess: (updatedShipment) => {
      queryClient.setQueryData(shipmentKeys.detail(updatedShipment.id), updatedShipment);
      toast.success(`Tracking information for shipment ${updatedShipment.shipmentNumber} has been refreshed.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update tracking information. Please try again.');
    },
  });
}

// ============================================================================
// RETURN HOOKS
// ============================================================================

export function useReturns(orderId?: string): UseQueryResult<OrderReturn[]> {
  return useQuery({
    queryKey: returnKeys.list(orderId),
    queryFn: async () => {
      const url = orderId ? `/api/orders/${orderId}/returns` : '/api/returns';
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useReturnDetail(returnId: string): UseQueryResult<OrderReturn> {
  return useQuery({
    queryKey: returnKeys.detail(returnId),
    queryFn: async () => {
      const response = await api.get(`/api/returns/${returnId}`);
      return response.data;
    },
    enabled: !!returnId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateReturn(): UseMutationResult<OrderReturn, Error, any> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (returnData: any) => {
      const response = await api.post('/api/returns', returnData);
      return response.data;
    },
    onSuccess: (newReturn) => {
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.setQueryData(returnKeys.detail(newReturn.id), newReturn);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(newReturn.orderId) });
      toast.success(`Return ${newReturn.returnNumber} has been created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create return. Please try again.');
    },
  });
}

export function useCreateShipment(): UseMutationResult<Shipment, Error, any> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (shipmentData: any) => {
      const response = await api.post('/api/shipments', shipmentData);
      return response.data;
    },
    onSuccess: (newShipment) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.setQueryData(shipmentKeys.detail(newShipment.id), newShipment);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(newShipment.orderId) });
      toast.success(`Shipment ${newShipment.shipmentNumber} has been created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create shipment. Please try again.');
    },
  });
}

export function useCarriers(): UseQueryResult<{ carriers: any[] }> {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const response = await api.get('/api/carriers');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreatePayment(): UseMutationResult<Payment, Error, any> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post('/api/payments', paymentData);
      return response.data;
    },
    onSuccess: (newPayment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.setQueryData(paymentKeys.detail(newPayment.id), newPayment);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(newPayment.orderId) });
      toast.success(`Payment ${newPayment.paymentNumber} has been created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create payment. Please try again.');
    },
  });
}

export function useCreateFulfillment(): UseMutationResult<Fulfillment, Error, any> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (fulfillmentData: any) => {
      const response = await api.post('/api/fulfillments', fulfillmentData);
      return response.data;
    },
    onSuccess: (newFulfillment) => {
      queryClient.invalidateQueries({ queryKey: fulfillmentKeys.lists() });
      queryClient.setQueryData(fulfillmentKeys.detail(newFulfillment.id), newFulfillment);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(newFulfillment.orderId) });
      toast.success(`Fulfillment ${newFulfillment.fulfillmentNumber} has been created successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create fulfillment. Please try again.');
    },
  });
}

export function useWarehouses(): UseQueryResult<{ warehouses: any[] }> {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/api/warehouses');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateShipment(): UseMutationResult<Shipment, Error, { id: string; data: any }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/api/shipments/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedShipment) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.setQueryData(shipmentKeys.detail(updatedShipment.id), updatedShipment);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(updatedShipment.orderId) });
      toast.success('Shipment details have been updated successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update shipment. Please try again.');
    },
  });
}

export function useUpdateReturnStatus(): UseMutationResult<OrderReturn, Error, { id: string; status: ReturnStatus; notes?: string; refundAmount?: number; restockingFee?: number }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, notes, refundAmount, restockingFee }: { id: string; status: ReturnStatus; notes?: string; refundAmount?: number; restockingFee?: number }) => {
      const response = await api.put(`/api/returns/${id}/status`, { status, notes, refundAmount, restockingFee });
      return response.data;
    },
    onSuccess: (updatedReturn) => {
      queryClient.setQueryData(returnKeys.detail(updatedReturn.id), updatedReturn);
      queryClient.invalidateQueries({ queryKey: returnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(updatedReturn.orderId) });
      toast.success(`Return ${updatedReturn.returnNumber} status updated to ${updatedReturn.status}.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update return status. Please try again.');
    },
  });
}

// ============================================================================
// PAYMENT HOOKS
// ============================================================================

export function usePayments(orderId?: string): UseQueryResult<Payment[]> {
  return useQuery({
    queryKey: paymentKeys.list(orderId),
    queryFn: async () => {
      const url = orderId ? `/api/orders/${orderId}/payments` : '/api/payments';
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePaymentDetail(paymentId: string): UseQueryResult<Payment> {
  return useQuery({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: async () => {
      const response = await api.get(`/api/payments/${paymentId}`);
      return response.data;
    },
    enabled: !!paymentId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProcessPayment(): UseMutationResult<Payment, Error, any> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post('/api/payments', paymentData);
      return response.data;
    },
    onSuccess: (newPayment) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.setQueryData(paymentKeys.detail(newPayment.id), newPayment);
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(newPayment.orderId) });
      toast.success(`Payment of ${newPayment.amount} ${newPayment.currency} has been processed successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process payment. Please try again.');
    },
  });
}

export function useRefundPayment(): UseMutationResult<Payment, Error, { id: string; amount: number; reason: string }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, amount, reason }: { id: string; amount: number; reason: string }) => {
      const response = await api.post(`/api/payments/${id}/refund`, { amount, reason });
      return response.data;
    },
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(paymentKeys.detail(updatedPayment.id), updatedPayment);
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(updatedPayment.orderId) });
      toast.success(`Refund has been processed successfully.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to process refund. Please try again.');
    },
  });
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useOrderAnalytics(
  dateRange?: { start: string; end: string },
  filters?: Record<string, any>
): UseQueryResult<OrderAnalytics> {
  return useQuery({
    queryKey: [...orderKeys.analytics(), dateRange, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange) {
        params.set('startDate', dateRange.start);
        params.set('endDate', dateRange.end);
      }
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.set(key, String(value));
          }
        });
      }
      
      const response = await api.get(`/api/analytics/orders?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// ORDER TEMPLATE HOOKS
// ============================================================================

export function useOrderTemplates(customerId?: string): UseQueryResult<OrderTemplate[]> {
  return useQuery({
    queryKey: [...orderKeys.templates(), customerId],
    queryFn: async () => {
      const url = customerId ? `/api/customers/${customerId}/templates` : '/api/order-templates';
      const response = await api.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOrderFromTemplate(): UseMutationResult<Order, Error, { templateId: string; customizations?: any }> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ templateId, customizations }: { templateId: string; customizations?: any }) => {
      const response = await api.post(`/api/order-templates/${templateId}/create-order`, customizations);
      return response.data;
    },
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(newOrder.id), {
        order: newOrder,
        relatedOrders: [],
        customerHistory: {},
        availableActions: [],
      });
      toast.success(`Order ${newOrder.orderNumber} has been created from template.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order from template. Please try again.');
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useOrderNotes(orderId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addNote = useMutation({
    mutationFn: async (note: { content: string; type: 'INTERNAL' | 'CUSTOMER'; isPublic: boolean }) => {
      const response = await api.post(`/api/orders/${orderId}/notes`, note);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      toast.success('Order note has been added successfully.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add note. Please try again.');
    },
  });

  return { addNote };
} 