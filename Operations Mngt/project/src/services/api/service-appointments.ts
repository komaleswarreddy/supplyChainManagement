import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

// Zod schemas for validation
export const ServiceAppointmentSchema = z.object({
  id: z.string().optional(),
  appointment_number: z.string(),
  order_id: z.string().uuid(),
  service_type_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduled_start: z.string().datetime(),
  scheduled_end: z.string().datetime(),
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
  timezone: z.string().default('UTC'),
  service_address: z.record(z.any()),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  special_instructions: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled']).default('scheduled'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  cancellation_reason: z.string().optional(),
  estimated_duration: z.number().optional(),
  actual_duration: z.number().optional(),
  service_items: z.array(z.record(z.any())).optional(),
  required_skills: z.array(z.string()).optional(),
  required_equipment: z.array(z.string()).optional(),
  completion_notes: z.string().optional(),
  customer_signature: z.string().optional(),
  photos: z.array(z.string().url()).optional(),
  customer_rating: z.number().min(1).max(5).optional(),
  customer_feedback: z.string().optional(),
  service_cost: z.number().optional(),
  travel_cost: z.number().optional(),
  material_cost: z.number().optional(),
  total_cost: z.number().optional(),
  billing_status: z.enum(['pending', 'billed', 'paid']).default('pending'),
  metadata: z.record(z.any()).optional(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ServiceProviderSchema = z.object({
  id: z.string().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  employee_id: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.enum(['internal', 'external', 'contractor']),
  skills: z.array(z.string()).optional(),
  service_areas: z.array(z.string()).optional(),
  max_concurrent_appointments: z.number().positive().default(1),
  travel_time_minutes: z.number().nonnegative().default(30),
  hourly_rate: z.number().positive().optional(),
  rating: z.number().min(0).max(5).optional(),
  total_appointments: z.number().default(0),
  completed_appointments: z.number().default(0),
  is_active: z.boolean().default(true),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ServiceTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['installation', 'delivery', 'consultation', 'maintenance', 'training']),
  duration_minutes: z.number().positive().default(60),
  buffer_time_minutes: z.number().nonnegative().default(15),
  requires_order: z.boolean().default(true),
  applicable_product_types: z.array(z.string()).optional(),
  skill_requirements: z.array(z.string()).optional(),
  equipment_requirements: z.array(z.string()).optional(),
  preparation_checklist: z.array(z.string()).optional(),
  completion_checklist: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const AvailableSlotSchema = z.object({
  provider_id: z.string().uuid(),
  provider_name: z.string(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  duration_minutes: z.number(),
});

// Types
export type ServiceAppointment = z.infer<typeof ServiceAppointmentSchema>;
export type ServiceProvider = z.infer<typeof ServiceProviderSchema>;
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;

// API Client
const SERVICE_APPOINTMENT_API_BASE = '/api/service-appointments';

export const serviceAppointmentAPI = {
  // Service Appointments
  getAll: async (params?: {
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
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE}`, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE}/${id}`);
    return response.data;
  },

  create: async (data: {
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
  }) => {
    const response = await apiClient.post(`${SERVICE_APPOINTMENT_API_BASE}`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<ServiceAppointment>) => {
    const validatedData = ServiceAppointmentSchema.partial().parse(data);
    const response = await apiClient.put(`${SERVICE_APPOINTMENT_API_BASE}/${id}`, validatedData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${SERVICE_APPOINTMENT_API_BASE}/${id}`);
    return response.data;
  },

  // Available slots
  getAvailableSlots: async (params: {
    service_type_id: string;
    date: string;
    duration_minutes?: number;
    provider_id?: string;
    service_area?: string;
  }) => {
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE}/slots/available`, { params });
    return response.data;
  },

  // Provider assignment
  assignProvider: async (appointmentId: string, data: {
    provider_id: string;
    role?: 'primary' | 'secondary' | 'backup';
  }) => {
    const response = await apiClient.post(`${SERVICE_APPOINTMENT_API_BASE}/${appointmentId}/assign`, data);
    return response.data;
  },

  // Service Providers
  getProviders: async (params?: {
    type?: string;
    skill?: string;
    service_area?: string;
    is_active?: boolean;
  }) => {
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE.replace('/service-appointments', '/service-providers')}`, { params });
    return response.data.providers;
  },

  createProvider: async (data: {
    user_id?: string;
    name: string;
    employee_id?: string;
    email: string;
    phone?: string;
    type: 'internal' | 'external' | 'contractor';
    skills?: string[];
    service_areas?: string[];
    max_concurrent_appointments?: number;
    travel_time_minutes?: number;
    hourly_rate?: number;
  }) => {
    const validatedData = ServiceProviderSchema.omit({
      id: true,
      tenant_id: true,
      created_by: true,
      created_at: true,
      updated_at: true,
      rating: true,
      total_appointments: true,
      completed_appointments: true,
    }).parse(data);
    
    const response = await apiClient.post(`${SERVICE_APPOINTMENT_API_BASE.replace('/service-appointments', '/service-providers')}`, validatedData);
    return response.data;
  },

  // Service Types
  getServiceTypes: async (params?: {
    category?: string;
    is_active?: boolean;
  }) => {
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE.replace('/service-appointments', '/service-types')}`, { params });
    return response.data.service_types;
  },

  // Analytics
  getAnalytics: async (params?: {
    start_date?: string;
    end_date?: string;
    provider_id?: string;
    service_type_id?: string;
  }) => {
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE}/analytics`, { params });
    return response.data;
  },

  // Order-specific methods
  getAppointmentsByOrder: async (orderId: string) => {
    const response = await apiClient.get(`${SERVICE_APPOINTMENT_API_BASE}`, {
      params: { order_id: orderId }
    });
    return response.data;
  },

  createFromOrder: async (orderId: string, data: {
    service_type_id: string;
    title: string;
    description?: string;
    scheduled_start: string;
    scheduled_end: string;
    service_address: Record<string, any>;
    contact_person?: string;
    contact_phone?: string;
    contact_email?: string;
    special_instructions?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    preferred_provider_id?: string;
  }) => {
    const response = await apiClient.post(`${SERVICE_APPOINTMENT_API_BASE}`, {
      ...data,
      order_id: orderId,
    });
    return response.data;
  },

  // Status updates
  startAppointment: async (id: string) => {
    const response = await apiClient.put(`${SERVICE_APPOINTMENT_API_BASE}/${id}`, {
      status: 'in_progress',
      actual_start: new Date().toISOString(),
    });
    return response.data;
  },

  completeAppointment: async (id: string, data: {
    completion_notes?: string;
    customer_signature?: string;
    photos?: string[];
    customer_rating?: number;
    customer_feedback?: string;
    service_cost?: number;
    travel_cost?: number;
    material_cost?: number;
  }) => {
    const response = await apiClient.put(`${SERVICE_APPOINTMENT_API_BASE}/${id}`, {
      ...data,
      status: 'completed',
      actual_end: new Date().toISOString(),
      actual_duration: data.service_cost ? Math.round((new Date().getTime() - new Date().getTime()) / (1000 * 60)) : undefined,
    });
    return response.data;
  },

  cancelAppointment: async (id: string, reason: string) => {
    const response = await apiClient.put(`${SERVICE_APPOINTMENT_API_BASE}/${id}`, {
      status: 'cancelled',
      cancellation_reason: reason,
    });
    return response.data;
  },

  rescheduleAppointment: async (id: string, data: {
    scheduled_start: string;
    scheduled_end: string;
    reason?: string;
  }) => {
    const response = await apiClient.put(`${SERVICE_APPOINTMENT_API_BASE}/${id}`, {
      ...data,
      status: 'rescheduled',
    });
    return response.data;
  },
}; 