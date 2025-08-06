import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { carriers, shipments, loads, shippingDocuments, freightInvoices } from '../db/schema/transportation';
import { eq } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createCarrierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).default('ACTIVE'),
  contactInfo: z.object({
    name: z.string().min(1, 'Contact name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone is required'),
  }),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  scacCode: z.string().optional(),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  taxId: z.string().min(1, 'Tax ID is required'),
  insuranceInfo: z.object({
    provider: z.string().min(1, 'Insurance provider is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    coverageAmount: z.number().positive('Coverage amount must be positive'),
    expiryDate: z.string().datetime('Invalid date format'),
  }),
  serviceAreas: z.object({
    countries: z.array(z.string()).min(1, 'At least one country is required'),
    regions: z.array(z.string()).optional(),
  }),
  serviceTypes: z.array(z.enum(['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL'])).min(1, 'At least one service type is required'),
  transitTimes: z.array(z.object({
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    transitDays: z.number().int().positive('Transit days must be positive'),
    serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'PRIORITY', 'ECONOMY']),
  })).optional(),
  rates: z.array(z.object({
    origin: z.string().min(1, 'Origin is required'),
    destination: z.string().min(1, 'Destination is required'),
    serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'PRIORITY', 'ECONOMY']),
    baseRate: z.number().min(0, 'Base rate must be non-negative'),
    fuelSurcharge: z.number().min(0, 'Fuel surcharge must be non-negative'),
    currency: z.string().min(1, 'Currency is required'),
    effectiveDate: z.string().datetime('Invalid date format'),
    expiryDate: z.string().datetime('Invalid date format'),
  })).optional(),
  performanceMetrics: z.object({
    onTimeDelivery: z.number().min(0).max(100, 'On-time delivery must be between 0 and 100'),
    damageRate: z.number().min(0).max(100, 'Damage rate must be between 0 and 100'),
    claimResolutionTime: z.number().min(0, 'Claim resolution time must be non-negative'),
    averageTransitTime: z.number().min(0, 'Average transit time must be non-negative'),
    lastUpdated: z.string().datetime('Invalid date format'),
  }).optional(),
  contractInfo: z.object({
    contractNumber: z.string().min(1, 'Contract number is required'),
    startDate: z.string().datetime('Invalid date format'),
    endDate: z.string().datetime('Invalid date format'),
    paymentTerms: z.string().min(1, 'Payment terms are required'),
  }).optional(),
});

// Transportation routes
export default async function transportationRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all carriers
  fastify.get('/carriers', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] },
          type: { type: 'string', enum: ['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL'] },
          name: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  contactInfo: { type: 'object' },
                  serviceTypes: { type: 'array', items: { type: 'string' } },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, pageSize = 10, status, type, name } = request.query as any;
    
    // Build query
    let query = db.select().from(carriers);
    
    // Apply filters
    if (status) {
      query = query.where(eq(carriers.status, status));
    }
    
    if (type) {
      query = query.where(eq(carriers.type, type));
    }
    
    // Add more complex filtering for name, etc.
    if (search) {
      conditions.push(
        or(
          like(transportationCarriers.name, `%${search}%`),
          like(transportationCarriers.code, `%${search}%`),
          like(transportationCarriers.description, `%${search}%`)
        )
      );
    }
    
    if (type) {
      conditions.push(eq(transportationCarriers.type, type));
    }
    
    if (status) {
      conditions.push(eq(transportationCarriers.status, status));
    }
    
    if (serviceLevel) {
      conditions.push(eq(transportationCarriers.serviceLevel, serviceLevel));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(carriers);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
  
  // Get carrier by ID
  fastify.get('/carriers/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            contactInfo: { type: 'object' },
            address: { type: 'object' },
            scacCode: { type: 'string' },
            dotNumber: { type: 'string' },
            mcNumber: { type: 'string' },
            taxId: { type: 'string' },
            insuranceInfo: { type: 'object' },
            serviceAreas: { type: 'object' },
            serviceTypes: { type: 'array', items: { type: 'string' } },
            transitTimes: { type: 'array', items: { type: 'object' } },
            rates: { type: 'array', items: { type: 'object' } },
            performanceMetrics: { type: 'object' },
            contractInfo: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const carrier = await db.select().from(carriers).where(eq(carriers.id, id)).limit(1);
    
    if (!carrier.length) {
      throw new AppError('Carrier not found', 404);
    }
    
    return carrier[0];
  });
  
  // Create carrier
  fastify.post('/carriers', {
    preHandler: hasPermissions(['manage_suppliers']),
    schema: {
      body: {
        type: 'object',
        required: ['name', 'code', 'type', 'contactInfo', 'address', 'taxId', 'insuranceInfo', 'serviceAreas', 'serviceTypes'],
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          type: { type: 'string', enum: ['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL'] },
          status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'] },
          contactInfo: { type: 'object' },
          address: { type: 'object' },
          scacCode: { type: 'string' },
          dotNumber: { type: 'string' },
          mcNumber: { type: 'string' },
          taxId: { type: 'string' },
          insuranceInfo: { type: 'object' },
          serviceAreas: { type: 'object' },
          serviceTypes: { type: 'array', items: { type: 'string' } },
          transitTimes: { type: 'array', items: { type: 'object' } },
          rates: { type: 'array', items: { type: 'object' } },
          performanceMetrics: { type: 'object' },
          contractInfo: { type: 'object' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const carrierData = createCarrierSchema.parse(request.body);
      
      // Check if carrier code already exists
      const existingCarrier = await db.select({ id: carriers.id }).from(carriers).where(eq(carriers.code, carrierData.code)).limit(1);
      
      if (existingCarrier.length) {
        throw new AppError('Carrier with this code already exists', 409);
      }
      
      // Create carrier
      const [newCarrier] = await db.insert(carriers).values({
        ...carrierData,
      }).returning({ id: carriers.id, name: carriers.name, code: carriers.code });
      
      reply.status(201);
      return {
        ...newCarrier,
        message: 'Carrier created successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Get all shipments
  fastify.get('/shipments', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string' },
          carrier: { type: 'string' },
          origin: { type: 'string' },
          destination: { type: 'string' },
          dateRange: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  shipmentNumber: { type: 'string' },
                  carrierId: { type: 'string' },
                  status: { type: 'string' },
                  origin: { type: 'object' },
                  destination: { type: 'object' },
                  pickupDate: { type: 'string', format: 'date-time' },
                  deliveryDate: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, pageSize = 10, status, carrier } = request.query as any;
    
    // Build query
    let query = db.select().from(shipments);
    
    // Apply filters
    if (status) {
      query = query.where(eq(shipments.status, status));
    }
    
    // Add more complex filtering for carrier, origin, destination, date range, etc.
    if (search) {
      conditions.push(
        or(
          like(transportationShipments.shipmentNumber, `%${search}%`),
          like(transportationShipments.description, `%${search}%`)
        )
      );
    }
    
    if (carrier) {
      conditions.push(eq(transportationShipments.carrierId, carrier));
    }
    
    if (origin) {
      conditions.push(eq(transportationShipments.originLocation, origin));
    }
    
    if (destination) {
      conditions.push(eq(transportationShipments.destinationLocation, destination));
    }
    
    if (status) {
      conditions.push(eq(transportationShipments.status, status));
    }
    
    if (dateFrom) {
      conditions.push(sql`${transportationShipments.shipmentDate} >= ${new Date(dateFrom)}`);
    }
    
    if (dateTo) {
      conditions.push(sql`${transportationShipments.shipmentDate} <= ${new Date(dateTo)}`);
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(shipments);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
  
  // Get shipment by ID
  fastify.get('/shipments/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            shipmentNumber: { type: 'string' },
            referenceNumber: { type: 'string' },
            carrierId: { type: 'string' },
            status: { type: 'string' },
            origin: { type: 'object' },
            destination: { type: 'object' },
            pickupDate: { type: 'string', format: 'date-time' },
            deliveryDate: { type: 'string', format: 'date-time' },
            estimatedDeliveryDate: { type: 'string', format: 'date-time' },
            actualDeliveryDate: { type: 'string', format: 'date-time' },
            serviceLevel: { type: 'string' },
            trackingNumber: { type: 'string' },
            trackingUrl: { type: 'string' },
            items: { type: 'array', items: { type: 'object' } },
            packages: { type: 'array', items: { type: 'object' } },
            totalWeight: { type: 'number' },
            weightUnit: { type: 'string' },
            totalVolume: { type: 'number' },
            volumeUnit: { type: 'string' },
            freightClass: { type: 'string' },
            specialInstructions: { type: 'string' },
            costs: { type: 'object' },
            events: { type: 'array', items: { type: 'object' } },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const shipment = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    
    if (!shipment.length) {
      throw new AppError('Shipment not found', 404);
    }
    
    // Get documents
    const documents = await db.select().from(shippingDocuments).where(eq(shippingDocuments.shipmentId, id));
    
    return {
      ...shipment[0],
      documents,
    };
  });
  
  // Get shipment tracking
  fastify.get('/shipments/:id/tracking', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
              location: { type: 'string' },
              notes: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const shipment = await db.select({ events: shipments.events }).from(shipments).where(eq(shipments.id, id)).limit(1);
    
    if (!shipment.length) {
      throw new AppError('Shipment not found', 404);
    }
    
    return shipment[0].events;
  });
  
  // Get all loads
  fastify.get('/loads', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string' },
          carrier: { type: 'string' },
          dateRange: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  loadNumber: { type: 'string' },
                  status: { type: 'string' },
                  shipmentIds: { type: 'array', items: { type: 'string' } },
                  carrierId: { type: 'string' },
                  scheduledDate: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, pageSize = 10, status, carrier } = request.query as any;
    
    // Build query
    let query = db.select().from(loads);
    
    // Apply filters
    if (status) {
      query = query.where(eq(loads.status, status));
    }
    
    // Add more complex filtering for carrier, date range, etc.
    if (carrier) {
      query = query.where(eq(loads.carrierId, carrier));
    }
    
    if (dateFrom) {
      query = query.where(sql`${loads.scheduledDate} >= ${new Date(dateFrom)}`);
    }
    
    if (dateTo) {
      query = query.where(sql`${loads.scheduledDate} <= ${new Date(dateTo)}`);
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(loads);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
  
  // Get load by ID
  fastify.get('/loads/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            loadNumber: { type: 'string' },
            status: { type: 'string' },
            shipmentIds: { type: 'array', items: { type: 'string' } },
            carrierId: { type: 'string' },
            equipment: { type: 'object' },
            loadPlan: { type: 'object' },
            scheduledDate: { type: 'string', format: 'date-time' },
            completedDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const load = await db.select().from(loads).where(eq(loads.id, id)).limit(1);
    
    if (!load.length) {
      throw new AppError('Load not found', 404);
    }
    
    return load[0];
  });
  
  // Get all freight invoices
  fastify.get('/invoices', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string' },
          carrier: { type: 'string' },
          dateRange: { type: 'object' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  invoiceNumber: { type: 'string' },
                  carrierId: { type: 'string' },
                  carrierName: { type: 'string' },
                  status: { type: 'string' },
                  invoiceDate: { type: 'string', format: 'date-time' },
                  dueDate: { type: 'string', format: 'date-time' },
                  total: { type: 'number' },
                  currency: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page = 1, pageSize = 10, status, carrier } = request.query as any;
    
    // Build query
    let query = db.select().from(freightInvoices);
    
    // Apply filters
    if (status) {
      query = query.where(eq(freightInvoices.status, status));
    }
    
    // Add more complex filtering for carrier, date range, etc.
    if (carrier) {
      query = query.where(eq(freightInvoices.carrierId, carrier));
    }
    
    if (dateFrom) {
      query = query.where(sql`${freightInvoices.invoiceDate} >= ${new Date(dateFrom)}`);
    }
    
    if (dateTo) {
      query = query.where(sql`${freightInvoices.invoiceDate} <= ${new Date(dateTo)}`);
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: db.fn.count() }).from(freightInvoices);
    const [{ count }] = await totalQuery.execute();
    const total = Number(count);
    
    // Apply pagination
    query = query.limit(pageSize).offset((page - 1) * pageSize);
    
    // Execute query
    const items = await query.execute();
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  });
  
  // Get freight invoice by ID
  fastify.get('/invoices/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            invoiceNumber: { type: 'string' },
            carrierId: { type: 'string' },
            carrierName: { type: 'string' },
            shipmentIds: { type: 'array', items: { type: 'string' } },
            invoiceDate: { type: 'string', format: 'date-time' },
            dueDate: { type: 'string', format: 'date-time' },
            status: { type: 'string' },
            charges: { type: 'array', items: { type: 'object' } },
            subtotal: { type: 'number' },
            taxes: { type: 'number' },
            total: { type: 'number' },
            currency: { type: 'string' },
            auditResults: { type: 'object' },
            paymentInfo: { type: 'object' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    const invoice = await db.select().from(freightInvoices).where(eq(freightInvoices.id, id)).limit(1);
    
    if (!invoice.length) {
      throw new AppError('Invoice not found', 404);
    }
    
    return invoice[0];
  });
}