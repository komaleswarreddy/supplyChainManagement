import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { suppliers, supplierAddresses, supplierContacts, supplierBankInformation, supplierDocuments } from '../db/schema/suppliers';
import { eq, and, desc, like, sql, or } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { TenantRequest } from '../middleware/tenant';

// Define route schemas
const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER']),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISQUALIFIED']).default('DRAFT'),
  taxId: z.string().min(1, 'Tax ID is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  yearEstablished: z.number().int().positive().optional().or(z.undefined()),
  annualRevenue: z.number().positive().optional().or(z.undefined()),
  employeeCount: z.number().int().positive().optional().or(z.undefined()),
  businessClassifications: z.array(z.enum([
    'LARGE_ENTERPRISE', 'SMALL_BUSINESS', 'MINORITY_OWNED', 'WOMEN_OWNED', 
    'VETERAN_OWNED', 'DISABLED_OWNED', 'DISADVANTAGED_BUSINESS'
  ])).optional(),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  paymentTerms: z.string().optional(),
  preferredCurrency: z.string().optional(),
  notes: z.string().optional(),
  addresses: z.array(z.object({
    type: z.enum(['HEADQUARTERS', 'BILLING', 'SHIPPING', 'MANUFACTURING', 'OTHER']),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    isPrimary: z.boolean(),
  })).min(1, 'At least one address is required'),
  contacts: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    title: z.string().min(1, 'Title is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    isPrimary: z.boolean(),
    department: z.string().optional(),
  })).min(1, 'At least one contact is required'),
  bankInformation: z.object({
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    currency: z.string().optional(),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
  }).optional(),
});

// Supplier routes
export default async function supplierRoutes(fastify: FastifyInstance) {
  // Add global authentication middleware
  fastify.addHook('preHandler', authenticate);
  
  // Authentication and tenant middleware are already applied globally
  
  // Get all suppliers
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string' },
          type: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          classification: { type: 'string' },
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
                  industry: { type: 'string' },
                  categories: { type: 'array', items: { type: 'string' } },
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
  }, async (request: TenantRequest & AuthenticatedRequest, reply: FastifyReply) => {
    const { page = 1, pageSize = 10, status, type, name, category, classification } = request.query as any;
    
    // Build query
    let query = db.select().from(suppliers).where(eq(suppliers.tenantId, request.tenant?.id));
    
    // Apply filters
    if (status) {
      query = query.where(eq(suppliers.status, status));
    }
    
    if (type) {
      query = query.where(eq(suppliers.type, type));
    }
    
    // Add more complex filtering for name, category, classification, etc.
    if (name) {
      query = query.where(
        or(
          like(suppliers.name, `%${name}%`),
          like(suppliers.code, `%${name}%`),
          like(suppliers.description, `%${name}%`)
        )
      );
    }
    
    if (category) {
      query = query.where(eq(suppliers.categories, category));
    }
    
    if (classification) {
      query = query.where(eq(suppliers.businessClassifications, classification));
    }
    
    if (status) {
      query = query.where(eq(suppliers.status, status));
    }
    
    // Get total count for pagination
    const totalQuery = db.select({ count: sql`count(*)` }).from(suppliers).where(eq(suppliers.tenantId, request.tenant?.id));
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
  
  // Get supplier by ID
  fastify.get('/:id', {
    preHandler: hasPermissions(['manage_suppliers']),
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
            taxId: { type: 'string' },
            registrationNumber: { type: 'string' },
            website: { type: 'string' },
            industry: { type: 'string' },
            description: { type: 'string' },
            yearEstablished: { type: 'number' },
            annualRevenue: { type: 'number' },
            employeeCount: { type: 'number' },
            businessClassifications: { type: 'array', items: { type: 'string' } },
            categories: { type: 'array', items: { type: 'string' } },
            addresses: { type: 'array', items: { type: 'object' } },
            contacts: { type: 'array', items: { type: 'object' } },
            bankInformation: { type: 'object' },
            documents: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Get supplier
    const supplier = await db.select().from(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, request.tenant?.id))).limit(1);
    
    if (!supplier.length) {
      throw new AppError('Supplier not found', 404);
    }
    
    // Get addresses
    const addresses = await db.select().from(supplierAddresses).where(and(eq(supplierAddresses.supplierId, id), eq(supplierAddresses.tenantId, request.tenant?.id)));
    
    // Get contacts
    const contacts = await db.select().from(supplierContacts).where(and(eq(supplierContacts.supplierId, id), eq(supplierContacts.tenantId, request.tenant?.id)));
    
    // Get bank information
    const bankInfo = await db.select().from(supplierBankInformation).where(and(eq(supplierBankInformation.supplierId, id), eq(supplierBankInformation.tenantId, request.tenant?.id))).limit(1);
    
    // Get documents
    const documents = await db.select().from(supplierDocuments).where(and(eq(supplierDocuments.supplierId, id), eq(supplierDocuments.tenantId, request.tenant?.id)));
    
    return {
      ...supplier[0],
      addresses,
      contacts,
      bankInformation: bankInfo.length ? bankInfo[0] : null,
      documents,
    };
  });
  
  // Create supplier
  fastify.post('/', {
    preHandler: hasPermissions(['manage_suppliers']),
    schema: {
      body: {
        type: 'object',
        required: ['name', 'code', 'type', 'taxId', 'registrationNumber', 'categories', 'addresses', 'contacts'],
        properties: {
          name: { type: 'string' },
          code: { type: 'string' },
          type: { type: 'string', enum: ['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISQUALIFIED'] },
          taxId: { type: 'string' },
          registrationNumber: { type: 'string' },
          website: { type: 'string' },
          industry: { type: 'string' },
          description: { type: 'string' },
          yearEstablished: { type: 'number' },
          annualRevenue: { type: 'number' },
          employeeCount: { type: 'number' },
          businessClassifications: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          paymentTerms: { type: 'string' },
          preferredCurrency: { type: 'string' },
          notes: { type: 'string' },
          addresses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                postalCode: { type: 'string' },
                isPrimary: { type: 'boolean' },
              },
            },
          },
          contacts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                title: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                isPrimary: { type: 'boolean' },
                department: { type: 'string' },
              },
            },
          },
          bankInformation: {
            type: 'object',
            properties: {
              bankName: { type: 'string' },
              accountName: { type: 'string' },
              accountNumber: { type: 'string' },
              routingNumber: { type: 'string' },
              currency: { type: 'string' },
              swiftCode: { type: 'string' },
              iban: { type: 'string' },
            },
          },
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
      console.log('=== SUPPLIER CREATION REQUEST ===');
      console.log('Request headers:', request.headers);
      console.log('Request tenant:', request.tenant);
      console.log('Request user:', request.user);
      console.log('Request body:', request.body);
      
      const supplierData = createSupplierSchema.parse(request.body);
      
      // Get tenant ID from request
      const tenantId = request.tenant?.id;
      console.log('Tenant ID from request:', tenantId);
      
      if (!tenantId) {
        console.log('No tenant ID found in request');
        throw new AppError('Tenant ID is required', 400);
      }
      
      // Check if supplier code already exists
      const existingSupplier = await db.select({ id: suppliers.id }).from(suppliers).where(and(eq(suppliers.code, supplierData.code), eq(suppliers.tenantId, tenantId))).limit(1);
      
      if (existingSupplier.length) {
        throw new AppError('Supplier with this code already exists', 409);
      }
      
      // Start a transaction
      const result = await db.transaction(async (tx) => {
        console.log('Creating supplier with data:', {
          tenantId,
          name: supplierData.name,
          code: supplierData.code,
          type: supplierData.type,
          status: supplierData.status,
          taxId: supplierData.taxId,
          registrationNumber: supplierData.registrationNumber,
        });
        
        // Create supplier
        const [newSupplier] = await tx.insert(suppliers).values({
          tenantId: tenantId,
          name: supplierData.name,
          code: supplierData.code,
          type: supplierData.type,
          status: supplierData.status,
          taxId: supplierData.taxId,
          registrationNumber: supplierData.registrationNumber,
          website: supplierData.website,
          industry: supplierData.industry,
          description: supplierData.description,
          yearEstablished: supplierData.yearEstablished,
          annualRevenue: supplierData.annualRevenue,
          employeeCount: supplierData.employeeCount,
          businessClassifications: supplierData.businessClassifications,
          categories: supplierData.categories,
          paymentTerms: supplierData.paymentTerms,
          preferredCurrency: supplierData.preferredCurrency,
          notes: supplierData.notes,
          createdBy: request.user.id,
        }).returning({ id: suppliers.id, name: suppliers.name, code: suppliers.code });
        
        // Create addresses
        const addressesToInsert = supplierData.addresses.map(address => ({
          tenantId: tenantId,
          supplierId: newSupplier.id,
          ...address,
        }));
        
        await tx.insert(supplierAddresses).values(addressesToInsert);
        
        // Create contacts
        const contactsToInsert = supplierData.contacts.map(contact => ({
          tenantId: tenantId,
          supplierId: newSupplier.id,
          ...contact,
        }));
        
        await tx.insert(supplierContacts).values(contactsToInsert);
        
        // Create bank information if provided
        if (supplierData.bankInformation) {
          await tx.insert(supplierBankInformation).values({
            tenantId: tenantId,
            supplierId: newSupplier.id,
            ...supplierData.bankInformation,
          });
        }
        
        return newSupplier;
      });
      
      console.log('Supplier created successfully:', result);
      reply.status(201);
      return {
        ...result,
        message: 'Supplier created successfully',
      };
    } catch (error) {
      console.error('Error in supplier creation:', error);
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Update supplier
  fastify.put('/:id', {
    preHandler: hasPermissions(['manage_suppliers']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER'] },
          status: { type: 'string', enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISQUALIFIED'] },
          taxId: { type: 'string' },
          registrationNumber: { type: 'string' },
          website: { type: 'string' },
          industry: { type: 'string' },
          description: { type: 'string' },
          yearEstablished: { type: 'number' },
          annualRevenue: { type: 'number' },
          employeeCount: { type: 'number' },
          businessClassifications: { type: 'array', items: { type: 'string' } },
          categories: { type: 'array', items: { type: 'string' } },
          paymentTerms: { type: 'string' },
          preferredCurrency: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: any, reply: FastifyReply) => {
    try {
      const { id } = request.params as { id: string };
      const supplierData = createSupplierSchema.partial().parse(request.body);
      
      // Check if supplier exists
      const existingSupplier = await db.select({ id: suppliers.id }).from(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, request.tenant?.id))).limit(1);
      
      if (!existingSupplier.length) {
        throw new AppError('Supplier not found', 404);
      }
      
      // Update supplier
      await db.update(suppliers).set({
        ...supplierData,
        updatedBy: request.user.id,
        updatedAt: new Date().toISOString(),
      }).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, request.tenant?.id)));
      
      return {
        id,
        message: 'Supplier updated successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AppError('Validation error', 400, error.errors);
      }
      throw error;
    }
  });
  
  // Delete supplier
  fastify.delete('/:id', {
    preHandler: hasPermissions(['manage_suppliers']),
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
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Check if supplier exists
    const existingSupplier = await db.select({ id: suppliers.id }).from(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, request.tenant?.id))).limit(1);
    
    if (!existingSupplier.length) {
      throw new AppError('Supplier not found', 404);
    }
    
    // Start a transaction
    await db.transaction(async (tx) => {
      // Delete bank information
      await tx.delete(supplierBankInformation).where(and(eq(supplierBankInformation.supplierId, id), eq(supplierBankInformation.tenantId, request.tenant?.id)));
      
      // Delete contacts
      await tx.delete(supplierContacts).where(and(eq(supplierContacts.supplierId, id), eq(supplierContacts.tenantId, request.tenant?.id)));
      
      // Delete addresses
      await tx.delete(supplierAddresses).where(and(eq(supplierAddresses.supplierId, id), eq(supplierAddresses.tenantId, request.tenant?.id)));
      
      // Delete documents
      await tx.delete(supplierDocuments).where(and(eq(supplierDocuments.supplierId, id), eq(supplierDocuments.tenantId, request.tenant?.id)));
      
      // Delete supplier
      await tx.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, request.tenant?.id)));
    });
    
    return {
      message: 'Supplier deleted successfully',
    };
  });
}