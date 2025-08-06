import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  serviceAppointments, 
  serviceTypes, 
  serviceProviders,
  serviceProviderAvailability,
  serviceAppointmentAssignments,
  serviceAppointmentHistory,
  serviceAppointmentReminders
} from '../db/schema/service-appointments';
import { orders } from '../db/schema/orders';
import { eq, and, gte, lte, or, desc, asc, isNull } from 'drizzle-orm';
import { authenticateUser } from '../middleware/auth';
import { getTenantId } from '../middleware/tenant';

// Zod schemas for validation
const CreateServiceAppointmentSchema = z.object({
  order_id: z.string().uuid(),
  service_type_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  scheduled_start: z.string().datetime(),
  scheduled_end: z.string().datetime(),
  timezone: z.string().default('UTC'),
  service_address: z.record(z.any()),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  special_instructions: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  service_items: z.array(z.record(z.any())).optional(),
  required_skills: z.array(z.string()).optional(),
  required_equipment: z.array(z.string()).optional(),
  preferred_provider_id: z.string().uuid().optional(),
});

const UpdateServiceAppointmentSchema = CreateServiceAppointmentSchema.partial();

const CreateServiceProviderSchema = z.object({
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
});

const ProviderAvailabilitySchema = z.object({
  provider_id: z.string().uuid(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  is_available: z.boolean().default(true),
  max_appointments: z.number().positive().default(8),
});

export default async function serviceAppointmentRoutes(fastify: FastifyInstance) {
  // Get all service appointments
  fastify.get('/service-appointments', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      service_type_id,
      provider_id,
      order_id,
      start_date,
      end_date,
      priority 
    } = request.query as any;

    const offset = (page - 1) * limit;
    
    let whereConditions = [eq(serviceAppointments.tenant_id, tenantId)];
    
    if (search) {
      whereConditions.push(
        or(
          serviceAppointments.title.ilike(`%${search}%`),
          serviceAppointments.appointment_number.ilike(`%${search}%`),
          serviceAppointments.description.ilike(`%${search}%`)
        )
      );
    }
    
    if (status) {
      whereConditions.push(eq(serviceAppointments.status, status));
    }
    
    if (service_type_id) {
      whereConditions.push(eq(serviceAppointments.service_type_id, service_type_id));
    }
    
    if (order_id) {
      whereConditions.push(eq(serviceAppointments.order_id, order_id));
    }
    
    if (priority) {
      whereConditions.push(eq(serviceAppointments.priority, priority));
    }
    
    if (start_date) {
      whereConditions.push(gte(serviceAppointments.scheduled_start, new Date(start_date)));
    }
    
    if (end_date) {
      whereConditions.push(lte(serviceAppointments.scheduled_end, new Date(end_date)));
    }

    const [appointmentsList, total] = await Promise.all([
      db.select({
        appointment: serviceAppointments,
        order: orders,
        serviceType: serviceTypes,
      })
        .from(serviceAppointments)
        .leftJoin(orders, eq(serviceAppointments.order_id, orders.id))
        .leftJoin(serviceTypes, eq(serviceAppointments.service_type_id, serviceTypes.id))
        .where(and(...whereConditions))
        .orderBy(desc(serviceAppointments.scheduled_start))
        .limit(limit)
        .offset(offset),
      
      db.select({ count: db.fn.count() })
        .from(serviceAppointments)
        .where(and(...whereConditions))
        .then(result => Number(result[0]?.count || 0))
    ]);

    // Get assignments for each appointment
    const appointmentIds = appointmentsList.map(a => a.appointment.id);
    const assignments = appointmentIds.length > 0 ? await db
      .select({
        assignment: serviceAppointmentAssignments,
        provider: serviceProviders,
      })
      .from(serviceAppointmentAssignments)
      .leftJoin(serviceProviders, eq(serviceAppointmentAssignments.provider_id, serviceProviders.id))
      .where(serviceAppointmentAssignments.appointment_id.in(appointmentIds)) : [];

    const appointmentsWithAssignments = appointmentsList.map(item => ({
      ...item.appointment,
      order: item.order,
      service_type: item.serviceType,
      assignments: assignments.filter(a => a.assignment.appointment_id === item.appointment.id),
    }));

    return {
      appointments: appointmentsWithAssignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  });

  // Get service appointment by ID
  fastify.get('/service-appointments/:id', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { id } = request.params as { id: string };

    const appointment = await db
      .select({
        appointment: serviceAppointments,
        order: orders,
        serviceType: serviceTypes,
      })
      .from(serviceAppointments)
      .leftJoin(orders, eq(serviceAppointments.order_id, orders.id))
      .leftJoin(serviceTypes, eq(serviceAppointments.service_type_id, serviceTypes.id))
      .where(and(eq(serviceAppointments.id, id), eq(serviceAppointments.tenant_id, tenantId)))
      .limit(1);

    if (!appointment.length) {
      return reply.code(404).send({ error: 'Service appointment not found' });
    }

    // Get assignments
    const assignments = await db
      .select({
        assignment: serviceAppointmentAssignments,
        provider: serviceProviders,
      })
      .from(serviceAppointmentAssignments)
      .leftJoin(serviceProviders, eq(serviceAppointmentAssignments.provider_id, serviceProviders.id))
      .where(eq(serviceAppointmentAssignments.appointment_id, id));

    // Get history
    const history = await db
      .select()
      .from(serviceAppointmentHistory)
      .where(eq(serviceAppointmentHistory.appointment_id, id))
      .orderBy(desc(serviceAppointmentHistory.performed_at));

    return {
      ...appointment[0].appointment,
      order: appointment[0].order,
      service_type: appointment[0].serviceType,
      assignments,
      history,
    };
  });

  // Create service appointment
  fastify.post('/service-appointments', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const userId = request.user.id;
    const data = CreateServiceAppointmentSchema.parse(request.body);

    // Generate appointment number
    const appointmentCount = await db
      .select({ count: db.fn.count() })
      .from(serviceAppointments)
      .where(eq(serviceAppointments.tenant_id, tenantId))
      .then(result => Number(result[0]?.count || 0));

    const appointmentNumber = `SA-${String(appointmentCount + 1).padStart(6, '0')}`;

    // Check for provider availability conflicts
    if (data.preferred_provider_id) {
      const conflicts = await db
        .select()
        .from(serviceAppointments)
        .innerJoin(serviceAppointmentAssignments, eq(serviceAppointments.id, serviceAppointmentAssignments.appointment_id))
        .where(
          and(
            eq(serviceAppointmentAssignments.provider_id, data.preferred_provider_id),
            eq(serviceAppointments.tenant_id, tenantId),
            or(
              and(
                gte(serviceAppointments.scheduled_start, new Date(data.scheduled_start)),
                lte(serviceAppointments.scheduled_start, new Date(data.scheduled_end))
              ),
              and(
                gte(serviceAppointments.scheduled_end, new Date(data.scheduled_start)),
                lte(serviceAppointments.scheduled_end, new Date(data.scheduled_end))
              ),
              and(
                lte(serviceAppointments.scheduled_start, new Date(data.scheduled_start)),
                gte(serviceAppointments.scheduled_end, new Date(data.scheduled_end))
              )
            )
          )
        );

      if (conflicts.length > 0) {
        return reply.code(409).send({ 
          error: 'Provider is not available at the requested time',
          conflicts 
        });
      }
    }

    const [appointment] = await db
      .insert(serviceAppointments)
      .values({
        ...data,
        appointment_number: appointmentNumber,
        tenant_id: tenantId,
        created_by: userId,
      })
      .returning();

    // Auto-assign preferred provider if specified
    if (data.preferred_provider_id) {
      await db
        .insert(serviceAppointmentAssignments)
        .values({
          appointment_id: appointment.id,
          provider_id: data.preferred_provider_id,
          role: 'primary',
          status: 'assigned',
          tenant_id: tenantId,
        });
    }

    // Create history entry
    await db
      .insert(serviceAppointmentHistory)
      .values({
        appointment_id: appointment.id,
        action: 'created',
        new_status: 'scheduled',
        new_data: appointment,
        performed_by: userId,
        tenant_id: tenantId,
      });

    return appointment;
  });

  // Update service appointment
  fastify.put('/service-appointments/:id', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const userId = request.user.id;
    const { id } = request.params as { id: string };
    const data = UpdateServiceAppointmentSchema.parse(request.body);

    // Get current appointment data
    const currentAppointment = await db
      .select()
      .from(serviceAppointments)
      .where(and(eq(serviceAppointments.id, id), eq(serviceAppointments.tenant_id, tenantId)))
      .limit(1);

    if (!currentAppointment.length) {
      return reply.code(404).send({ error: 'Service appointment not found' });
    }

    const [appointment] = await db
      .update(serviceAppointments)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(and(eq(serviceAppointments.id, id), eq(serviceAppointments.tenant_id, tenantId)))
      .returning();

    // Create history entry
    await db
      .insert(serviceAppointmentHistory)
      .values({
        appointment_id: id,
        action: 'updated',
        previous_status: currentAppointment[0].status,
        new_status: appointment.status,
        previous_data: currentAppointment[0],
        new_data: appointment,
        performed_by: userId,
        tenant_id: tenantId,
      });

    return appointment;
  });

  // Delete service appointment
  fastify.delete('/service-appointments/:id', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { id } = request.params as { id: string };

    const [appointment] = await db
      .delete(serviceAppointments)
      .where(and(eq(serviceAppointments.id, id), eq(serviceAppointments.tenant_id, tenantId)))
      .returning();

    if (!appointment) {
      return reply.code(404).send({ error: 'Service appointment not found' });
    }

    return { message: 'Service appointment deleted successfully' };
  });

  // Get available time slots
  fastify.get('/service-appointments/slots/available', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { 
      service_type_id,
      date, 
      duration_minutes,
      provider_id,
      service_area 
    } = request.query as any;

    if (!service_type_id || !date) {
      return reply.code(400).send({ 
        error: 'Service type ID and date are required' 
      });
    }

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    // Get service type details
    const serviceType = await db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.id, service_type_id))
      .limit(1);

    if (!serviceType.length) {
      return reply.code(404).send({ error: 'Service type not found' });
    }

    const appointmentDuration = duration_minutes || serviceType[0].duration_minutes;
    const bufferTime = serviceType[0].buffer_time_minutes;

    // Get available providers
    let providerQuery = db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.tenant_id, tenantId));

    if (provider_id) {
      providerQuery = providerQuery.where(eq(serviceProviders.id, provider_id));
    }

    if (service_area) {
      // Add service area filtering logic here
    }

    const providers = await providerQuery;

    const availableSlots = [];

    for (const provider of providers) {
      // Get provider availability for the day
      const dayOfWeek = startDate.getDay();
      const availability = await db
        .select()
        .from(serviceProviderAvailability)
        .where(
          and(
            eq(serviceProviderAvailability.provider_id, provider.id),
            eq(serviceProviderAvailability.day_of_week, dayOfWeek),
            eq(serviceProviderAvailability.is_available, true)
          )
        );

      if (!availability.length) continue;

      // Get existing appointments for the provider on this date
      const existingAppointments = await db
        .select()
        .from(serviceAppointments)
        .innerJoin(serviceAppointmentAssignments, eq(serviceAppointments.id, serviceAppointmentAssignments.appointment_id))
        .where(
          and(
            eq(serviceAppointmentAssignments.provider_id, provider.id),
            gte(serviceAppointments.scheduled_start, startDate),
            lte(serviceAppointments.scheduled_end, endDate),
            serviceAppointments.status.in(['scheduled', 'confirmed', 'in_progress'])
          )
        );

      // Generate available slots for each availability window
      for (const avail of availability) {
        const [startHour, startMinute] = avail.start_time.split(':').map(Number);
        const [endHour, endMinute] = avail.end_time.split(':').map(Number);
        
        let currentTime = new Date(startDate);
        currentTime.setHours(startHour, startMinute, 0, 0);
        
        const endTime = new Date(startDate);
        endTime.setHours(endHour, endMinute, 0, 0);
        
        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime);
          slotEnd.setMinutes(slotEnd.getMinutes() + appointmentDuration);
          
          if (slotEnd > endTime) break;
          
          // Check if slot conflicts with existing appointments
          const hasConflict = existingAppointments.some(apt => 
            (currentTime >= apt.service_appointments.scheduled_start && currentTime < apt.service_appointments.scheduled_end) ||
            (slotEnd > apt.service_appointments.scheduled_start && slotEnd <= apt.service_appointments.scheduled_end) ||
            (currentTime <= apt.service_appointments.scheduled_start && slotEnd >= apt.service_appointments.scheduled_end)
          );
          
          if (!hasConflict) {
            availableSlots.push({
              provider_id: provider.id,
              provider_name: provider.name,
              start_time: currentTime.toISOString(),
              end_time: slotEnd.toISOString(),
              duration_minutes: appointmentDuration,
            });
          }
          
          // Move to next slot (considering buffer time)
          currentTime.setMinutes(currentTime.getMinutes() + appointmentDuration + bufferTime);
        }
      }
    }

    return { 
      available_slots: availableSlots.sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
    };
  });

  // Assign provider to appointment
  fastify.post('/service-appointments/:id/assign', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { id } = request.params as { id: string };
    const { provider_id, role = 'primary' } = request.body as any;

    // Check if provider is already assigned
    const existing = await db
      .select()
      .from(serviceAppointmentAssignments)
      .where(
        and(
          eq(serviceAppointmentAssignments.appointment_id, id),
          eq(serviceAppointmentAssignments.provider_id, provider_id)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return reply.code(409).send({ error: 'Provider is already assigned to this appointment' });
    }

    const [assignment] = await db
      .insert(serviceAppointmentAssignments)
      .values({
        appointment_id: id,
        provider_id,
        role,
        status: 'assigned',
        tenant_id: tenantId,
      })
      .returning();

    return assignment;
  });

  // Service Providers
  fastify.get('/service-providers', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { type, skill, service_area, is_active = true } = request.query as any;
    
    let whereConditions = [eq(serviceProviders.tenant_id, tenantId)];
    
    if (type) {
      whereConditions.push(eq(serviceProviders.type, type));
    }
    
    if (is_active !== undefined) {
      whereConditions.push(eq(serviceProviders.is_active, is_active === 'true'));
    }
    
    const providers = await db
      .select()
      .from(serviceProviders)
      .where(and(...whereConditions))
      .orderBy(asc(serviceProviders.name));

    return { providers };
  });

  fastify.post('/service-providers', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const userId = request.user.id;
    const data = CreateServiceProviderSchema.parse(request.body);

    const [provider] = await db
      .insert(serviceProviders)
      .values({
        ...data,
        tenant_id: tenantId,
        created_by: userId,
      })
      .returning();

    return provider;
  });

  // Service Types
  fastify.get('/service-types', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { category, is_active = true } = request.query as any;
    
    let whereConditions = [eq(serviceTypes.tenant_id, tenantId)];
    
    if (category) {
      whereConditions.push(eq(serviceTypes.category, category));
    }
    
    if (is_active !== undefined) {
      whereConditions.push(eq(serviceTypes.is_active, is_active === 'true'));
    }
    
    const types = await db
      .select()
      .from(serviceTypes)
      .where(and(...whereConditions))
      .orderBy(asc(serviceTypes.name));

    return { service_types: types };
  });

  // Get service appointment analytics
  fastify.get('/service-appointments/analytics', {
    preHandler: [authenticateUser],
  }, async (request, reply) => {
    const tenantId = getTenantId(request);
    const { start_date, end_date, provider_id, service_type_id } = request.query as any;

    let whereConditions = [eq(serviceAppointments.tenant_id, tenantId)];
    
    if (start_date) {
      whereConditions.push(gte(serviceAppointments.scheduled_start, new Date(start_date)));
    }
    
    if (end_date) {
      whereConditions.push(lte(serviceAppointments.scheduled_end, new Date(end_date)));
    }

    if (service_type_id) {
      whereConditions.push(eq(serviceAppointments.service_type_id, service_type_id));
    }

    const appointments = await db
      .select()
      .from(serviceAppointments)
      .where(and(...whereConditions));

    // Calculate analytics
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
    const inProgressAppointments = appointments.filter(a => a.status === 'in_progress').length;

    // Status distribution
    const statusDistribution = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average completion time
    const completedWithDuration = appointments.filter(a => a.actual_duration && a.status === 'completed');
    const avgCompletionTime = completedWithDuration.length > 0 
      ? completedWithDuration.reduce((sum, a) => sum + (a.actual_duration || 0), 0) / completedWithDuration.length
      : 0;

    // Customer satisfaction
    const ratedAppointments = appointments.filter(a => a.customer_rating);
    const avgCustomerRating = ratedAppointments.length > 0
      ? ratedAppointments.reduce((sum, a) => sum + (a.customer_rating || 0), 0) / ratedAppointments.length
      : 0;

    return {
      total_appointments: totalAppointments,
      completed_appointments: completedAppointments,
      cancelled_appointments: cancelledAppointments,
      in_progress_appointments: inProgressAppointments,
      completion_rate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
      cancellation_rate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0,
      average_completion_time_minutes: avgCompletionTime,
      average_customer_rating: avgCustomerRating,
      status_distribution: statusDistribution,
    };
  });
} 