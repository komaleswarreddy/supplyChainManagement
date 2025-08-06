import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceAppointmentAPI } from '@/services/api/service-appointments';
import { useToast } from '@/hooks/useToast';

// Types
export interface ServiceAppointment {
  id: string;
  appointment_number: string;
  order_id: string;
  service_type_id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  timezone: string;
  service_address: Record<string, any>;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  special_instructions?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  cancellation_reason?: string;
  estimated_duration?: number;
  actual_duration?: number;
  service_items?: Array<Record<string, any>>;
  required_skills?: string[];
  required_equipment?: string[];
  completion_notes?: string;
  customer_signature?: string;
  photos?: string[];
  customer_rating?: number;
  customer_feedback?: string;
  service_cost?: number;
  travel_cost?: number;
  material_cost?: number;
  total_cost?: number;
  billing_status: 'pending' | 'billed' | 'paid';
  metadata?: Record<string, any>;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  user_id?: string;
  name: string;
  employee_id?: string;
  email: string;
  phone?: string;
  type: 'internal' | 'external' | 'contractor';
  skills?: string[];
  service_areas?: string[];
  max_concurrent_appointments: number;
  travel_time_minutes: number;
  hourly_rate?: number;
  rating?: number;
  total_appointments: number;
  completed_appointments: number;
  is_active: boolean;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  category: 'installation' | 'delivery' | 'consultation' | 'maintenance' | 'training';
  duration_minutes: number;
  buffer_time_minutes: number;
  requires_order: boolean;
  applicable_product_types?: string[];
  skill_requirements?: string[];
  equipment_requirements?: string[];
  preparation_checklist?: string[];
  completion_checklist?: string[];
  is_active: boolean;
  tenant_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AvailableSlot {
  provider_id: string;
  provider_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface CreateServiceAppointmentData {
  order_id: string;
  service_type_id: string;
  title: string;
  description?: string;
  scheduled_start: string;
  scheduled_end: string;
  timezone?: string;
  service_address: Record<string, any>;
  contact_person?: string;
  contact_phone?: string;
  contact_email?: string;
  special_instructions?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  service_items?: Array<Record<string, any>>;
  required_skills?: string[];
  required_equipment?: string[];
  preferred_provider_id?: string;
}

export interface UpdateServiceAppointmentData extends Partial<CreateServiceAppointmentData> {
  id: string;
}

// Hooks
export const useServiceAppointments = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  service_type_id?: string;
  provider_id?: string;
  order_id?: string;
  start_date?: string;
  end_date?: string;
  priority?: string;
}) => {
  return useQuery({
    queryKey: ['service-appointments', params],
    queryFn: () => serviceAppointmentAPI.getAll(params),
  });
};

export const useServiceAppointment = (id: string) => {
  return useQuery({
    queryKey: ['service-appointments', id],
    queryFn: () => serviceAppointmentAPI.getById(id),
    enabled: !!id,
  });
};

export const useCreateServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: serviceAppointmentAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      toast.success('Service appointment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create service appointment');
    },
  });
};

export const useUpdateServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceAppointmentData }) => 
      serviceAppointmentAPI.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments', data.id] });
      toast.success('Service appointment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update service appointment');
    },
  });
};

export const useDeleteServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: serviceAppointmentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      toast.success('Service appointment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete service appointment');
    },
  });
};

export const useAvailableSlots = (params: {
  service_type_id: string;
  date: string;
  duration_minutes?: number;
  provider_id?: string;
  service_area?: string;
}) => {
  return useQuery({
    queryKey: ['service-appointments', 'slots', params],
    queryFn: () => serviceAppointmentAPI.getAvailableSlots(params),
    enabled: !!params.service_type_id && !!params.date,
  });
};

export const useAssignProvider = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ appointmentId, data }: { 
      appointmentId: string; 
      data: { provider_id: string; role?: 'primary' | 'secondary' | 'backup' }
    }) => serviceAppointmentAPI.assignProvider(appointmentId, data),
    onSuccess: (data, { appointmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments', appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      toast.success('Provider assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign provider');
    },
  });
};

export const useServiceProviders = (params?: {
  type?: string;
  skill?: string;
  service_area?: string;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: ['service-providers', params],
    queryFn: () => serviceAppointmentAPI.getProviders(params),
  });
};

export const useCreateServiceProvider = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: serviceAppointmentAPI.createProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-providers'] });
      toast.success('Service provider created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create service provider');
    },
  });
};

export const useServiceTypes = (params?: {
  category?: string;
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: ['service-types', params],
    queryFn: () => serviceAppointmentAPI.getServiceTypes(params),
  });
};

export const useServiceAppointmentAnalytics = (params?: {
  start_date?: string;
  end_date?: string;
  provider_id?: string;
  service_type_id?: string;
}) => {
  return useQuery({
    queryKey: ['service-appointments', 'analytics', params],
    queryFn: () => serviceAppointmentAPI.getAnalytics(params),
  });
};

// Order-specific hooks
export const useServiceAppointmentsByOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['service-appointments', 'by-order', orderId],
    queryFn: () => serviceAppointmentAPI.getAppointmentsByOrder(orderId),
    enabled: !!orderId,
  });
};

export const useCreateServiceAppointmentFromOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ orderId, data }: { 
      orderId: string; 
      data: Omit<CreateServiceAppointmentData, 'order_id'>
    }) => serviceAppointmentAPI.createFromOrder(orderId, data),
    onSuccess: (data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments', 'by-order', orderId] });
      toast.success('Service appointment scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule service appointment');
    },
  });
};

// Status update hooks
export const useStartServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: serviceAppointmentAPI.startAppointment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments', data.id] });
      toast.success('Service appointment started');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start service appointment');
    },
  });
};

export const useCompleteServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        completion_notes?: string;
        customer_signature?: string;
        photos?: string[];
        customer_rating?: number;
        customer_feedback?: string;
        service_cost?: number;
        travel_cost?: number;
        material_cost?: number;
      }
    }) => serviceAppointmentAPI.completeAppointment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments', data.id] });
      toast.success('Service appointment completed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete service appointment');
    },
  });
};

export const useCancelServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      serviceAppointmentAPI.cancelAppointment(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments', data.id] });
      toast.success('Service appointment cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel service appointment');
    },
  });
};

export const useRescheduleServiceAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: {
        scheduled_start: string;
        scheduled_end: string;
        reason?: string;
      }
    }) => serviceAppointmentAPI.rescheduleAppointment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['service-appointments', data.id] });
      toast.success('Service appointment rescheduled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reschedule service appointment');
    },
  });
}; 