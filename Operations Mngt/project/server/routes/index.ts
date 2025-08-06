import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import tenantRoutes from './tenant.routes';
import inventoryRoutes from './inventory.routes';
import catalogRoutes from './catalog.routes';
import procurementRoutes from './procurement.routes';
import supplierRoutes from './supplier.routes';
import transportationRoutes from './transportation.routes';
import analyticsRoutes from './analytics.routes';
import orderRoutes from './orders.routes';
import qualityRoutes from './quality.routes';
import rfxRoutes from './rfx.routes';
import invoiceRoutes from './invoice.routes';
import taxComplianceRoutes from './tax-compliance.routes';
import supplyChainRoutes from './supply-chain.routes';
import financeRoutes from './finance.routes';
import warehouseRoutes from './warehouse.routes';
import contractRoutes from './contracts.routes';
import logisticsRoutes from './logistics.routes';
import automationRoutes from './automation.routes';
import integrationRoutes from './integrations.routes';
import mobileRoutes from './mobile.routes';
import serviceAppointmentRoutes from './service-appointments.routes';
import notificationRoutes from './notification.routes';

export default async function routes(fastify: FastifyInstance) {
  // Root route for API information
  fastify.get('/', async (request, reply) => {
    return {
      message: 'Operations Management API',
      version: '1.2.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        tenants: '/api/tenants',
        inventory: '/api/inventory',
        procurement: '/api/procurement',
        suppliers: '/api/suppliers',
        transportation: '/api/transportation',
        analytics: '/api/analytics',
        quality: '/api/quality',
        invoices: '/api/finance',
        taxCompliance: '/api/tax-compliance',
        supplyChain: '/api/supply-chain'
      },
      documentation: '/documentation'
    };
  });

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  });

  // Register all route modules
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(userRoutes, { prefix: '/api/users' });
  await fastify.register(tenantRoutes, { prefix: '/api/tenants' });
  await fastify.register(inventoryRoutes, { prefix: '/api/inventory' });
  // await fastify.register(catalogRoutes, { prefix: '/api/catalog' });
  await fastify.register(procurementRoutes, { prefix: '/api/procurement' });
  await fastify.register(supplierRoutes, { prefix: '/api/suppliers' });
  await fastify.register(transportationRoutes, { prefix: '/api/transportation' });
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
  // await fastify.register(orderRoutes, { prefix: '/api/orders' });
  await fastify.register(qualityRoutes, { prefix: '/api/quality' });
  await fastify.register(rfxRoutes, { prefix: '/api/procurement' });
  await fastify.register(invoiceRoutes, { prefix: '/api/finance' });
  await fastify.register(taxComplianceRoutes, { prefix: '/api/tax-compliance' });
  await fastify.register(supplyChainRoutes, { prefix: '/api/supply-chain' });
  // await fastify.register(financeRoutes, { prefix: '/api/finance' });
  // await fastify.register(warehouseRoutes, { prefix: '/api/warehouse' });
  // await fastify.register(contractRoutes, { prefix: '/api/contracts' });
  // await fastify.register(logisticsRoutes, { prefix: '/api/logistics' });
  // await fastify.register(automationRoutes, { prefix: '/api/automation' });
  // await fastify.register(integrationRoutes, { prefix: '/api/integrations' });
  // await fastify.register(mobileRoutes, { prefix: '/api/mobile' });
  // await fastify.register(serviceAppointmentRoutes, { prefix: '/api' });
  // await fastify.register(notificationRoutes, { prefix: '/api/notifications' });
}