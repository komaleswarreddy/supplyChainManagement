import { useState, useEffect, useCallback } from 'react';
import { useToast } from './useToast';
import { apiClient } from '@/lib/api-client';
import type {
  Customer,
  Order,
  OrderItem,
  Promotion,
  Return,
  Payment,
  OrderHistory,
  CustomerAddress,
  CustomerContact,
  CustomerCreditHistory,
  OrderFulfillment,
  Shipment,
  ReturnItem,
  CustomerOrderPreference,
  OrderTemplate,
  OrderFilters,
  CustomerFilters,
  PromotionFilters,
  ReturnFilters,
  PaymentFilters,
  OrderCalculation,
  FulfillmentWorkflow,
  InventoryAllocation,
  AppliedPromotion,
  PromotionDiscount,
} from '@/types/orders';

interface UseOrdersReturn {
  // Customer Management
  customers: Customer[];
  customer: Customer | null;
  loadingCustomers: boolean;
  getCustomers: (filters?: CustomerFilters) => Promise<void>;
  getCustomer: (id: string) => Promise<void>;
  createCustomer: (data: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  
  // Order Management
  orders: Order[];
  order: Order | null;
  loadingOrders: boolean;
  loadingOrder: boolean;
  getOrders: (filters?: OrderFilters) => Promise<void>;
  getOrder: (id: string) => Promise<void>;
  createOrder: (data: { order: Partial<Order>; items: Partial<OrderItem>[]; appliedPromotions?: string[] }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status'], notes?: string) => Promise<Order>;
  
  // Promotion Management
  promotions: Promotion[];
  loadingPromotions: boolean;
  getPromotions: (filters?: PromotionFilters) => Promise<void>;
  createPromotion: (data: Partial<Promotion>) => Promise<Promotion>;
  validatePromotion: (promotionCode: string, customerId?: string, orderAmount: number, items?: any[]) => Promise<{ promotion: Promotion; discountAmount: number; isValid: boolean }>;
  
  // Return Management
  returns: Return[];
  return: Return | null;
  loadingReturns: boolean;
  getReturns: (filters?: ReturnFilters) => Promise<void>;
  createReturn: (data: Partial<Return>) => Promise<Return>;
  
  // Payment Management
  payments: Payment[];
  payment: Payment | null;
  loadingPayments: boolean;
  getPayments: (filters?: PaymentFilters) => Promise<void>;
  createPayment: (data: Partial<Payment>) => Promise<Payment>;
  
  // Business Logic
  calculateOrder: (items: Partial<OrderItem>[], appliedPromotions?: string[], customerId?: string) => Promise<OrderCalculation>;
  getFulfillmentWorkflow: (orderId: string) => Promise<FulfillmentWorkflow>;
  getInventoryAllocation: (orderId: string) => Promise<InventoryAllocation[]>;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useOrders(): UseOrdersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [returns, setReturns] = useState<Return[]>([]);
  const [return_, setReturn] = useState<Return | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const clearError = useCallback(() => setError(null), []);

  // Customer Management
  const getCustomers = useCallback(async (filters?: CustomerFilters) => {
    try {
      setLoadingCustomers(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/orders/customers?${params.toString()}`);
      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch customers',
        variant: 'destructive',
      });
    } finally {
      setLoadingCustomers(false);
    }
  }, [toast]);

  const getCustomer = useCallback(async (id: string) => {
    try {
      setLoadingCustomers(true);
      setError(null);
      
      const response = await apiClient.get(`/api/orders/customers/${id}`);
      setCustomer(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch customer',
        variant: 'destructive',
      });
    } finally {
      setLoadingCustomers(false);
    }
  }, [toast]);

  const createCustomer = useCallback(async (data: Partial<Customer>): Promise<Customer> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/customers', data);
      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create customer');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create customer',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>): Promise<Customer> => {
    try {
      setError(null);
      
      const response = await apiClient.put(`/api/orders/customers/${id}`, data);
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update customer');
      toast({
        title: 'Error',
        description: err.message || 'Failed to update customer',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      setError(null);
      
      await apiClient.delete(`/api/orders/customers/${id}`);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Success',
        description: 'Customer deleted successfully',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to delete customer');
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete customer',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Order Management
  const getOrders = useCallback(async (filters?: OrderFilters) => {
    try {
      setLoadingOrders(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/orders/orders?${params.toString()}`);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrders(false);
    }
  }, [toast]);

  const getOrder = useCallback(async (id: string) => {
    try {
      setLoadingOrder(true);
      setError(null);
      
      const response = await apiClient.get(`/api/orders/orders/${id}`);
      setOrder(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch order',
        variant: 'destructive',
      });
    } finally {
      setLoadingOrder(false);
    }
  }, [toast]);

  const createOrder = useCallback(async (data: { order: Partial<Order>; items: Partial<OrderItem>[]; appliedPromotions?: string[] }): Promise<Order> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/orders', data);
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create order',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const updateOrderStatus = useCallback(async (id: string, status: Order['status'], notes?: string): Promise<Order> => {
    try {
      setError(null);
      
      const response = await apiClient.patch(`/api/orders/orders/${id}/status`, { status, notes });
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      toast({
        title: 'Error',
        description: err.message || 'Failed to update order status',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Promotion Management
  const getPromotions = useCallback(async (filters?: PromotionFilters) => {
    try {
      setLoadingPromotions(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/orders/promotions?${params.toString()}`);
      setPromotions(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promotions');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch promotions',
        variant: 'destructive',
      });
    } finally {
      setLoadingPromotions(false);
    }
  }, [toast]);

  const createPromotion = useCallback(async (data: Partial<Promotion>): Promise<Promotion> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/promotions', data);
      toast({
        title: 'Success',
        description: 'Promotion created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create promotion');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create promotion',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const validatePromotion = useCallback(async (promotionCode: string, customerId?: string, orderAmount: number, items?: any[]): Promise<{ promotion: Promotion; discountAmount: number; isValid: boolean }> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/promotions/validate', {
        promotionCode,
        customerId,
        orderAmount,
        items,
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to validate promotion');
      toast({
        title: 'Error',
        description: err.message || 'Failed to validate promotion',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Return Management
  const getReturns = useCallback(async (filters?: ReturnFilters) => {
    try {
      setLoadingReturns(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/orders/returns?${params.toString()}`);
      setReturns(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch returns');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch returns',
        variant: 'destructive',
      });
    } finally {
      setLoadingReturns(false);
    }
  }, [toast]);

  const createReturn = useCallback(async (data: Partial<Return>): Promise<Return> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/returns', data);
      toast({
        title: 'Success',
        description: 'Return created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create return');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create return',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Payment Management
  const getPayments = useCallback(async (filters?: PaymentFilters) => {
    try {
      setLoadingPayments(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await apiClient.get(`/api/orders/payments?${params.toString()}`);
      setPayments(response.data.data);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoadingPayments(false);
    }
  }, [toast]);

  const createPayment = useCallback(async (data: Partial<Payment>): Promise<Payment> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/payments', data);
      toast({
        title: 'Success',
        description: 'Payment created successfully',
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
      toast({
        title: 'Error',
        description: err.message || 'Failed to create payment',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  // Business Logic
  const calculateOrder = useCallback(async (items: Partial<OrderItem>[], appliedPromotions?: string[], customerId?: string): Promise<OrderCalculation> => {
    try {
      setError(null);
      
      const response = await apiClient.post('/api/orders/calculate', {
        items,
        appliedPromotions,
        customerId,
      });
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to calculate order');
      toast({
        title: 'Error',
        description: err.message || 'Failed to calculate order',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const getFulfillmentWorkflow = useCallback(async (orderId: string): Promise<FulfillmentWorkflow> => {
    try {
      setError(null);
      
      const response = await apiClient.get(`/api/orders/fulfillment-workflow/${orderId}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get fulfillment workflow');
      toast({
        title: 'Error',
        description: err.message || 'Failed to get fulfillment workflow',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const getInventoryAllocation = useCallback(async (orderId: string): Promise<InventoryAllocation[]> => {
    try {
      setError(null);
      
      const response = await apiClient.get(`/api/orders/inventory-allocation/${orderId}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get inventory allocation');
      toast({
        title: 'Error',
        description: err.message || 'Failed to get inventory allocation',
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  return {
    // Customer Management
    customers,
    customer,
    loadingCustomers,
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Order Management
    orders,
    order,
    loadingOrders,
    loadingOrder,
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    
    // Promotion Management
    promotions,
    loadingPromotions,
    getPromotions,
    createPromotion,
    validatePromotion,
    
    // Return Management
    returns,
    return: return_,
    loadingReturns,
    getReturns,
    createReturn,
    
    // Payment Management
    payments,
    payment,
    loadingPayments,
    getPayments,
    createPayment,
    
    // Business Logic
    calculateOrder,
    getFulfillmentWorkflow,
    getInventoryAllocation,
    
    // Pagination
    pagination,
    
    // Error handling
    error,
    clearError,
  };
}

// Add the missing useOrder export
export function useOrder(id: string) {
  console.log('useOrder hook called with id:', id); // Debug log
  const { order, loadingOrder, getOrder, error } = useOrders();
  
  useEffect(() => {
    if (id) {
      getOrder(id);
    }
  }, [id, getOrder]);
  
  return { order, loadingOrder, error };
} 