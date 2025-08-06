import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { 
  customers, customerAddresses, customerContacts, customerCreditHistory,
  promotions, orders, orderItems, orderFulfillments, fulfillmentItems,
  shipments, returns, returnItems, payments, orderHistory,
  customerOrderPreferences, orderTemplates
} from '../db/schema/orders';
import { inventoryItems } from '../db/schema/inventory';
import { users } from '../db/schema/users';
import { suppliers } from '../db/schema/suppliers';
import { eq, and, or, like, gte, lte, desc, asc, count, sum } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { getCurrentUser } from '../middleware/auth';

// Validation Schemas
const customerSchema = z.object({
  customerNumber: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['INDIVIDUAL', 'BUSINESS', 'DISTRIBUTOR', 'WHOLESALE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLACKLISTED']).default('ACTIVE'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.number().positive().optional(),
  paymentTerms: z.string().optional(),
  preferredCurrency: z.string().default('USD'),
  preferredLanguage: z.string().default('EN'),
  timezone: z.string().default('UTC'),
  customerSegment: z.enum(['PREMIUM', 'STANDARD', 'ECONOMY']).optional(),
  acquisitionSource: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const orderSchema = z.object({
  customerId: z.string().uuid(),
  channel: z.enum(['WEBSITE', 'MARKETPLACE', 'PHONE', 'EMAIL', 'B2B_PORTAL', 'MOBILE_APP']),
  channelReference: z.string().optional(),
  orderType: z.enum(['SALES_ORDER', 'PURCHASE_ORDER', 'TRANSFER_ORDER', 'RETURN_ORDER']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  currency: z.string().default('USD'),
  exchangeRate: z.number().positive().optional(),
  shippingMethod: z.string().optional(),
  shippingCarrier: z.string().optional(),
  shippingService: z.string().optional(),
  shippingAddress: z.object({
    name: z.string().optional(),
    street: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1),
    contactPerson: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
  }),
  billingAddress: z.object({
    name: z.string().optional(),
    street: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().min(1),
    contactPerson: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
  }),
  requestedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  customerNotes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const orderItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().positive(),
  unitOfMeasure: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  currency: z.string().default('USD'),
  taxRate: z.number().nonnegative().optional(),
  discountRate: z.number().nonnegative().optional(),
  requestedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  productOptions: z.record(z.any()).optional(),
});

const promotionSchema = z.object({
  promotionCode: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING', 'BUY_X_GET_Y']),
  value: z.number().positive(),
  minimumOrderAmount: z.number().positive().optional(),
  maximumDiscountAmount: z.number().positive().optional(),
  applicableItems: z.array(z.string().uuid()).optional(),
  excludedItems: z.array(z.string().uuid()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludedCategories: z.array(z.string()).optional(),
  applicableCustomers: z.array(z.string().uuid()).optional(),
  excludedCustomers: z.array(z.string().uuid()).optional(),
  usageLimit: z.number().positive().optional(),
  perCustomerLimit: z.number().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  priority: z.number().int().default(0),
  notes: z.string().optional(),
});

const returnSchema = z.object({
  orderId: z.string().uuid(),
  type: z.enum(['RETURN', 'EXCHANGE', 'WARRANTY', 'DAMAGED']),
  reason: z.string().min(1),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
});

const paymentSchema = z.object({
  orderId: z.string().uuid(),
  type: z.enum(['PAYMENT', 'REFUND', 'CREDIT', 'ADJUSTMENT']),
  method: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  gateway: z.string().optional(),
  transactionId: z.string().optional(),
  authorizationCode: z.string().optional(),
  notes: z.string().optional(),
});

// Customer Routes
async function customerRoutes(fastify: FastifyInstance) {
  // Get all customers with pagination and filters
  fastify.get('/customers', {
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.string().optional(),
        status: z.string().optional(),
        industry: z.string().optional(),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const { page, limit, type, status, industry, search, startDate, endDate } = request.query as any;
    
    const offset = (page - 1) * limit;
    const whereConditions = [eq(customers.tenantId, user.tenantId)];
    
    if (type) whereConditions.push(eq(customers.type, type));
    if (status) whereConditions.push(eq(customers.status, status));
    if (industry) whereConditions.push(eq(customers.industry, industry));
    if (search) {
      whereConditions.push(
        or(
          like(customers.name, `%${search}%`),
          like(customers.customerNumber, `%${search}%`),
          like(customers.email, `%${search}%`)
        )
      );
    }
    if (startDate) whereConditions.push(gte(customers.createdAt, startDate));
    if (endDate) whereConditions.push(lte(customers.createdAt, endDate));
    
    const [customersList, totalCount] = await Promise.all([
      db.select()
        .from(customers)
        .where(and(...whereConditions))
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() })
        .from(customers)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0)
    ]);
    
    return {
      data: customersList,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    };
  });

  // Get customer by ID
  fastify.get('/customers/:id', async (request, reply) => {
    const user = await getCurrentUser(request);
    const { id } = request.params as { id: string };
    
    const customer = await db.select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, user.tenantId)))
      .limit(1);
    
    if (!customer[0]) {
      throw new AppError('Customer not found', 404);
    }
    
    // Get related data
    const [addresses, contacts, creditHistory, orders] = await Promise.all([
      db.select().from(customerAddresses).where(eq(customerAddresses.customerId, id)),
      db.select().from(customerContacts).where(eq(customerContacts.customerId, id)),
      db.select().from(customerCreditHistory).where(eq(customerCreditHistory.customerId, id)),
      db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.createdAt)).limit(10)
    ]);
    
    return {
      data: {
        ...customer[0],
        addresses,
        contacts,
        creditHistory,
        recentOrders: orders
      }
    };
  });

  // Create customer
  fastify.post('/customers', {
    schema: {
      body: customerSchema,
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const customerData = request.body as any;
    
    // Check if customer number already exists
    const existingCustomer = await db.select()
      .from(customers)
      .where(and(
        eq(customers.customerNumber, customerData.customerNumber),
        eq(customers.tenantId, user.tenantId)
      ))
      .limit(1);
    
    if (existingCustomer[0]) {
      throw new AppError('Customer number already exists', 400);
    }
    
    const [newCustomer] = await db.insert(customers)
      .values({
        ...customerData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();
    
    return { data: newCustomer, message: 'Customer created successfully' };
  });

  // Update customer
  fastify.put('/customers/:id', {
    schema: {
      body: customerSchema.partial(),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const { id } = request.params as { id: string };
    const updateData = request.body as any;
    
    const [updatedCustomer] = await db.update(customers)
      .set({
        ...updateData,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(and(eq(customers.id, id), eq(customers.tenantId, user.tenantId)))
      .returning();
    
    if (!updatedCustomer) {
      throw new AppError('Customer not found', 404);
    }
    
    return { data: updatedCustomer, message: 'Customer updated successfully' };
  });

  // Delete customer
  fastify.delete('/customers/:id', async (request, reply) => {
    const user = await getCurrentUser(request);
    const { id } = request.params as { id: string };
    
    // Check if customer has orders
    const customerOrders = await db.select()
      .from(orders)
      .where(eq(orders.customerId, id))
      .limit(1);
    
    if (customerOrders[0]) {
      throw new AppError('Cannot delete customer with existing orders', 400);
    }
    
    await db.delete(customers)
      .where(and(eq(customers.id, id), eq(customers.tenantId, user.tenantId)));
    
    return { message: 'Customer deleted successfully' };
  });
}

// Order Routes
async function orderRoutes(fastify: FastifyInstance) {
  // Get all orders with pagination and filters
  fastify.get('/orders', {
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        status: z.string().optional(),
        channel: z.string().optional(),
        orderType: z.string().optional(),
        priority: z.string().optional(),
        paymentStatus: z.string().optional(),
        customerId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        minAmount: z.string().transform(Number).optional(),
        maxAmount: z.string().transform(Number).optional(),
        search: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const query = request.query as any;
    
    const offset = (query.page - 1) * query.limit;
    const whereConditions = [eq(orders.tenantId, user.tenantId)];
    
    if (query.status) whereConditions.push(eq(orders.status, query.status));
    if (query.channel) whereConditions.push(eq(orders.channel, query.channel));
    if (query.orderType) whereConditions.push(eq(orders.orderType, query.orderType));
    if (query.priority) whereConditions.push(eq(orders.priority, query.priority));
    if (query.paymentStatus) whereConditions.push(eq(orders.paymentStatus, query.paymentStatus));
    if (query.customerId) whereConditions.push(eq(orders.customerId, query.customerId));
    if (query.startDate) whereConditions.push(gte(orders.createdAt, query.startDate));
    if (query.endDate) whereConditions.push(lte(orders.createdAt, query.endDate));
    if (query.minAmount) whereConditions.push(gte(orders.totalAmount, query.minAmount));
    if (query.maxAmount) whereConditions.push(lte(orders.totalAmount, query.maxAmount));
    if (query.search) {
      whereConditions.push(
        or(
          like(orders.orderNumber, `%${query.search}%`),
          like(orders.channelReference, `%${query.search}%`)
        )
      );
    }
    
    const [ordersList, totalCount] = await Promise.all([
      db.select({
        order: orders,
        customer: customers,
      })
        .from(orders)
        .leftJoin(customers, eq(orders.customerId, customers.id))
        .where(and(...whereConditions))
        .orderBy(desc(orders.createdAt))
        .limit(query.limit)
        .offset(offset),
      db.select({ count: count() })
        .from(orders)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0)
    ]);
    
    return {
      data: ordersList.map(item => ({
        ...item.order,
        customer: item.customer
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / query.limit)
      }
    };
  });

  // Get order by ID with all related data
  fastify.get('/orders/:id', async (request, reply) => {
    const user = await getCurrentUser(request);
    const { id } = request.params as { id: string };
    
    const order = await db.select({
      order: orders,
      customer: customers,
    })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(and(eq(orders.id, id), eq(orders.tenantId, user.tenantId)))
      .limit(1);
    
    if (!order[0]) {
      throw new AppError('Order not found', 404);
    }
    
    // Get all related data
    const [items, fulfillments, shipments, payments, returns, history] = await Promise.all([
      db.select({
        item: orderItems,
        inventoryItem: inventoryItems,
      })
        .from(orderItems)
        .leftJoin(inventoryItems, eq(orderItems.itemId, inventoryItems.id))
        .where(eq(orderItems.orderId, id))
        .orderBy(asc(orderItems.lineNumber)),
      
      db.select()
        .from(orderFulfillments)
        .where(eq(orderFulfillments.orderId, id))
        .orderBy(desc(orderFulfillments.createdAt)),
      
      db.select({
        shipment: shipments,
        carrier: suppliers,
      })
        .from(shipments)
        .leftJoin(suppliers, eq(shipments.carrierId, suppliers.id))
        .where(eq(shipments.orderId, id))
        .orderBy(desc(shipments.createdAt)),
      
      db.select()
        .from(payments)
        .where(eq(payments.orderId, id))
        .orderBy(desc(payments.createdAt)),
      
      db.select()
        .from(returns)
        .where(eq(returns.orderId, id))
        .orderBy(desc(returns.createdAt)),
      
      db.select({
        history: orderHistory,
        user: users,
      })
        .from(orderHistory)
        .leftJoin(users, eq(orderHistory.createdBy, users.id))
        .where(eq(orderHistory.orderId, id))
        .orderBy(desc(orderHistory.createdAt))
    ]);
    
    return {
      data: {
        ...order[0].order,
        customer: order[0].customer,
        items: items.map(item => ({
          ...item.item,
          inventoryItem: item.inventoryItem
        })),
        fulfillments,
        shipments: shipments.map(s => ({
          ...s.shipment,
          carrier: s.carrier
        })),
        payments,
        returns,
        history: history.map(h => ({
          ...h.history,
          user: h.user
        }))
      }
    };
  });

  // Create order
  fastify.post('/orders', {
    schema: {
      body: z.object({
        order: orderSchema,
        items: z.array(orderItemSchema).min(1),
        appliedPromotions: z.array(z.string()).optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const { order: orderData, items: orderItemsData, appliedPromotions } = request.body as any;
    
    // Validate customer exists
    const customer = await db.select()
      .from(customers)
      .where(and(eq(customers.id, orderData.customerId), eq(customers.tenantId, user.tenantId)))
      .limit(1);
    
    if (!customer[0]) {
      throw new AppError('Customer not found', 404);
    }
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate order totals
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;
    
    for (const item of orderItemsData) {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      
      if (item.taxRate) {
        taxAmount += itemTotal * (item.taxRate / 100);
      }
      
      if (item.discountRate) {
        discountAmount += itemTotal * (item.discountRate / 100);
      }
    }
    
    const shippingAmount = 0; // Calculate based on shipping method
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;
    
    // Create order
    const [newOrder] = await db.insert(orders)
      .values({
        ...orderData,
        tenantId: user.tenantId,
        orderNumber,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        appliedPromotions: appliedPromotions || [],
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();
    
    // Create order items
    const orderItemsToInsert = orderItemsData.map((item: any, index: number) => ({
      ...item,
      tenantId: user.tenantId,
      orderId: newOrder.id,
      lineNumber: index + 1,
      totalAmount: item.quantity * item.unitPrice,
    }));
    
    await db.insert(orderItems).values(orderItemsToInsert);
    
    // Create order history
    await db.insert(orderHistory).values({
      tenantId: user.tenantId,
      orderId: newOrder.id,
      action: 'CREATED',
      description: 'Order created',
      createdBy: user.id,
    });
    
    return { data: newOrder, message: 'Order created successfully' };
  });

  // Update order status
  fastify.patch('/orders/:id/status', {
    schema: {
      body: z.object({
        status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
        notes: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const { id } = request.params as { id: string };
    const { status, notes } = request.body as any;
    
    const [updatedOrder] = await db.update(orders)
      .set({
        status,
        updatedAt: new Date(),
        updatedBy: user.id,
      })
      .where(and(eq(orders.id, id), eq(orders.tenantId, user.tenantId)))
      .returning();
    
    if (!updatedOrder) {
      throw new AppError('Order not found', 404);
    }
    
    // Create order history
    await db.insert(orderHistory).values({
      tenantId: user.tenantId,
      orderId: id,
      action: 'STATUS_CHANGED',
      field: 'status',
      oldValue: updatedOrder.status,
      newValue: status,
      description: `Order status changed to ${status}`,
      createdBy: user.id,
    });
    
    return { data: updatedOrder, message: 'Order status updated successfully' };
  });
}

// Promotion Routes
async function promotionRoutes(fastify: FastifyInstance) {
  // Get all promotions
  fastify.get('/promotions', {
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.string().optional(),
        status: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        search: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const query = request.query as any;
    
    const offset = (query.page - 1) * query.limit;
    const whereConditions = [eq(promotions.tenantId, user.tenantId)];
    
    if (query.type) whereConditions.push(eq(promotions.type, query.type));
    if (query.status) whereConditions.push(eq(promotions.status, query.status));
    if (query.startDate) whereConditions.push(gte(promotions.startDate, query.startDate));
    if (query.endDate) whereConditions.push(lte(promotions.endDate, query.endDate));
    if (query.search) {
      whereConditions.push(
        or(
          like(promotions.name, `%${query.search}%`),
          like(promotions.promotionCode, `%${query.search}%`)
        )
      );
    }
    
    const [promotionsList, totalCount] = await Promise.all([
      db.select()
        .from(promotions)
        .where(and(...whereConditions))
        .orderBy(desc(promotions.createdAt))
        .limit(query.limit)
        .offset(offset),
      db.select({ count: count() })
        .from(promotions)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0)
    ]);
    
    return {
      data: promotionsList,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / query.limit)
      }
    };
  });

  // Create promotion
  fastify.post('/promotions', {
    schema: {
      body: promotionSchema,
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const promotionData = request.body as any;
    
    // Check if promotion code already exists
    const existingPromotion = await db.select()
      .from(promotions)
      .where(and(
        eq(promotions.promotionCode, promotionData.promotionCode),
        eq(promotions.tenantId, user.tenantId)
      ))
      .limit(1);
    
    if (existingPromotion[0]) {
      throw new AppError('Promotion code already exists', 400);
    }
    
    const [newPromotion] = await db.insert(promotions)
      .values({
        ...promotionData,
        tenantId: user.tenantId,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();
    
    return { data: newPromotion, message: 'Promotion created successfully' };
  });

  // Validate promotion code
  fastify.post('/promotions/validate', {
    schema: {
      body: z.object({
        promotionCode: z.string(),
        customerId: z.string().uuid().optional(),
        orderAmount: z.number().positive(),
        items: z.array(z.object({
          itemId: z.string().uuid(),
          quantity: z.number().positive(),
          unitPrice: z.number().positive(),
        })).optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const { promotionCode, customerId, orderAmount, items } = request.body as any;
    
    const promotion = await db.select()
      .from(promotions)
      .where(and(
        eq(promotions.promotionCode, promotionCode),
        eq(promotions.tenantId, user.tenantId),
        eq(promotions.status, 'ACTIVE')
      ))
      .limit(1);
    
    if (!promotion[0]) {
      throw new AppError('Invalid promotion code', 400);
    }
    
    const promo = promotion[0];
    
    // Validate date range
    const now = new Date();
    if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
      throw new AppError('Promotion is not active', 400);
    }
    
    // Validate minimum order amount
    if (promo.minimumOrderAmount && orderAmount < promo.minimumOrderAmount) {
      throw new AppError(`Minimum order amount of ${promo.minimumOrderAmount} required`, 400);
    }
    
    // Validate usage limits
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      throw new AppError('Promotion usage limit exceeded', 400);
    }
    
    // Validate customer restrictions
    if (promo.excludedCustomers?.includes(customerId)) {
      throw new AppError('Promotion not available for this customer', 400);
    }
    
    // Calculate discount
    let discountAmount = 0;
    if (promo.type === 'PERCENTAGE') {
      discountAmount = orderAmount * (promo.value / 100);
    } else if (promo.type === 'FIXED_AMOUNT') {
      discountAmount = promo.value;
    }
    
    // Apply maximum discount limit
    if (promo.maximumDiscountAmount && discountAmount > promo.maximumDiscountAmount) {
      discountAmount = promo.maximumDiscountAmount;
    }
    
    return {
      data: {
        promotion: promo,
        discountAmount,
        isValid: true
      }
    };
  });
}

// Return Routes
async function returnRoutes(fastify: FastifyInstance) {
  // Get all returns
  fastify.get('/returns', {
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.string().optional(),
        status: z.string().optional(),
        reason: z.string().optional(),
        customerId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        search: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const query = request.query as any;
    
    const offset = (query.page - 1) * query.limit;
    const whereConditions = [eq(returns.tenantId, user.tenantId)];
    
    if (query.type) whereConditions.push(eq(returns.type, query.type));
    if (query.status) whereConditions.push(eq(returns.status, query.status));
    if (query.reason) whereConditions.push(eq(returns.reason, query.reason));
    if (query.customerId) whereConditions.push(eq(returns.customerId, query.customerId));
    if (query.startDate) whereConditions.push(gte(returns.createdAt, query.startDate));
    if (query.endDate) whereConditions.push(lte(returns.createdAt, query.endDate));
    if (query.search) {
      whereConditions.push(like(returns.returnNumber, `%${query.search}%`));
    }
    
    const [returnsList, totalCount] = await Promise.all([
      db.select({
        return: returns,
        customer: customers,
        order: orders,
      })
        .from(returns)
        .leftJoin(customers, eq(returns.customerId, customers.id))
        .leftJoin(orders, eq(returns.orderId, orders.id))
        .where(and(...whereConditions))
        .orderBy(desc(returns.createdAt))
        .limit(query.limit)
        .offset(offset),
      db.select({ count: count() })
        .from(returns)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0)
    ]);
    
    return {
      data: returnsList.map(item => ({
        ...item.return,
        customer: item.customer,
        order: item.order
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / query.limit)
      }
    };
  });

  // Create return
  fastify.post('/returns', {
    schema: {
      body: returnSchema,
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const returnData = request.body as any;
    
    // Validate order exists
    const order = await db.select()
      .from(orders)
      .where(and(eq(orders.id, returnData.orderId), eq(orders.tenantId, user.tenantId)))
      .limit(1);
    
    if (!order[0]) {
      throw new AppError('Order not found', 404);
    }
    
    // Generate return number
    const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [newReturn] = await db.insert(returns)
      .values({
        ...returnData,
        tenantId: user.tenantId,
        returnNumber,
        customerId: order[0].customerId,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();
    
    return { data: newReturn, message: 'Return created successfully' };
  });
}

// Payment Routes
async function paymentRoutes(fastify: FastifyInstance) {
  // Get all payments
  fastify.get('/payments', {
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
        type: z.string().optional(),
        method: z.string().optional(),
        status: z.string().optional(),
        gateway: z.string().optional(),
        customerId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        minAmount: z.string().transform(Number).optional(),
        maxAmount: z.string().transform(Number).optional(),
        search: z.string().optional(),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const query = request.query as any;
    
    const offset = (query.page - 1) * query.limit;
    const whereConditions = [eq(payments.tenantId, user.tenantId)];
    
    if (query.type) whereConditions.push(eq(payments.type, query.type));
    if (query.method) whereConditions.push(eq(payments.method, query.method));
    if (query.status) whereConditions.push(eq(payments.status, query.status));
    if (query.gateway) whereConditions.push(eq(payments.gateway, query.gateway));
    if (query.customerId) whereConditions.push(eq(payments.customerId, query.customerId));
    if (query.startDate) whereConditions.push(gte(payments.createdAt, query.startDate));
    if (query.endDate) whereConditions.push(lte(payments.createdAt, query.endDate));
    if (query.minAmount) whereConditions.push(gte(payments.amount, query.minAmount));
    if (query.maxAmount) whereConditions.push(lte(payments.amount, query.maxAmount));
    if (query.search) {
      whereConditions.push(
        or(
          like(payments.paymentNumber, `%${query.search}%`),
          like(payments.transactionId, `%${query.search}%`)
        )
      );
    }
    
    const [paymentsList, totalCount] = await Promise.all([
      db.select({
        payment: payments,
        customer: customers,
        order: orders,
      })
        .from(payments)
        .leftJoin(customers, eq(payments.customerId, customers.id))
        .leftJoin(orders, eq(payments.orderId, orders.id))
        .where(and(...whereConditions))
        .orderBy(desc(payments.createdAt))
        .limit(query.limit)
        .offset(offset),
      db.select({ count: count() })
        .from(payments)
        .where(and(...whereConditions))
        .then(result => result[0]?.count || 0)
    ]);
    
    return {
      data: paymentsList.map(item => ({
        ...item.payment,
        customer: item.customer,
        order: item.order
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / query.limit)
      }
    };
  });

  // Create payment
  fastify.post('/payments', {
    schema: {
      body: paymentSchema,
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const paymentData = request.body as any;
    
    // Validate order exists
    const order = await db.select()
      .from(orders)
      .where(and(eq(orders.id, paymentData.orderId), eq(orders.tenantId, user.tenantId)))
      .limit(1);
    
    if (!order[0]) {
      throw new AppError('Order not found', 404);
    }
    
    // Generate payment number
    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const [newPayment] = await db.insert(payments)
      .values({
        ...paymentData,
        tenantId: user.tenantId,
        paymentNumber,
        customerId: order[0].customerId,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();
    
    // Update order payment status
    const totalPaid = await db.select({ total: sum(payments.amount) })
      .from(payments)
      .where(and(eq(payments.orderId, paymentData.orderId), eq(payments.status, 'COMPLETED')))
      .then(result => result[0]?.total || 0);
    
    let paymentStatus = 'PENDING';
    if (totalPaid >= order[0].totalAmount) {
      paymentStatus = 'PAID';
    } else if (totalPaid > 0) {
      paymentStatus = 'PARTIAL';
    }
    
    await db.update(orders)
      .set({ paymentStatus, updatedAt: new Date(), updatedBy: user.id })
      .where(eq(orders.id, paymentData.orderId));
    
    return { data: newPayment, message: 'Payment created successfully' };
  });
}

// Analytics Routes
async function analyticsRoutes(fastify: FastifyInstance) {
  // Get order analytics
  fastify.get('/analytics/orders', {
    schema: {
      querystring: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        groupBy: z.enum(['day', 'week', 'month']).default('day'),
      }),
    },
  }, async (request, reply) => {
    const user = await getCurrentUser(request);
    const { startDate, endDate, groupBy } = request.query as any;
    
    const whereConditions = [eq(orders.tenantId, user.tenantId)];
    if (startDate) whereConditions.push(gte(orders.createdAt, startDate));
    if (endDate) whereConditions.push(lte(orders.createdAt, endDate));
    
    // Get order statistics
    const [orderStats, revenueStats, channelStats, statusStats] = await Promise.all([
      db.select({
        totalOrders: count(),
        totalRevenue: sum(orders.totalAmount),
        averageOrderValue: sum(orders.totalAmount),
      })
        .from(orders)
        .where(and(...whereConditions)),
      
      db.select({
        date: orders.createdAt,
        revenue: sum(orders.totalAmount),
        orders: count(),
      })
        .from(orders)
        .where(and(...whereConditions))
        .groupBy(orders.createdAt)
        .orderBy(asc(orders.createdAt)),
      
      db.select({
        channel: orders.channel,
        orders: count(),
        revenue: sum(orders.totalAmount),
      })
        .from(orders)
        .where(and(...whereConditions))
        .groupBy(orders.channel),
      
      db.select({
        status: orders.status,
        count: count(),
      })
        .from(orders)
        .where(and(...whereConditions))
        .groupBy(orders.status)
    ]);
    
    return {
      data: {
        summary: orderStats[0],
        revenue: revenueStats,
        channels: channelStats,
        statuses: statusStats,
      }
    };
  });

  // Get customer analytics
  fastify.get('/analytics/customers', async (request, reply) => {
    const user = await getCurrentUser(request);
    
    const [customerStats, topCustomers, customerSegments] = await Promise.all([
      db.select({
        totalCustomers: count(),
        activeCustomers: count(),
        newCustomers: count(),
      })
        .from(customers)
        .where(eq(customers.tenantId, user.tenantId)),
      
      db.select({
        customer: customers,
        totalOrders: count(),
        totalRevenue: sum(orders.totalAmount),
      })
        .from(customers)
        .leftJoin(orders, eq(customers.id, orders.customerId))
        .where(eq(customers.tenantId, user.tenantId))
        .groupBy(customers.id)
        .orderBy(desc(sum(orders.totalAmount)))
        .limit(10),
      
      db.select({
        segment: customers.customerSegment,
        count: count(),
        revenue: sum(orders.totalAmount),
      })
        .from(customers)
        .leftJoin(orders, eq(customers.id, orders.customerId))
        .where(eq(customers.tenantId, user.tenantId))
        .groupBy(customers.customerSegment)
    ]);
    
    return {
      data: {
        summary: customerStats[0],
        topCustomers,
        segments: customerSegments,
      }
    };
  });
}

export default async function orderManagementRoutes(fastify: FastifyInstance) {
  await fastify.register(customerRoutes, { prefix: '/api/orders' });
  await fastify.register(orderRoutes, { prefix: '/api/orders' });
  await fastify.register(promotionRoutes, { prefix: '/api/orders' });
  await fastify.register(returnRoutes, { prefix: '/api/orders' });
  await fastify.register(paymentRoutes, { prefix: '/api/orders' });
  await fastify.register(analyticsRoutes, { prefix: '/api/orders' });
} 