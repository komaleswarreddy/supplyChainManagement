import { db } from '../index';
import { integrations, apiEndpoints, apiKeys, webhookSubscriptions, dataMappings, integrationLogs, integrationTemplates, integrationPermissions } from '../schema/integrations';

export async function seedIntegrations() {
  console.log('🔗 Seeding integrations data...');

  // Seed integration templates
  const templateIds = await Promise.all([
    db.insert(integrationTemplates).values({
      name: 'ERP Integration Template',
      description: 'Standard template for ERP system integration',
      template_type: 'erp',
      configuration: {
        auth_type: 'oauth2',
        base_url: 'https://api.erp-system.com',
        endpoints: ['orders', 'inventory', 'customers'],
        data_mapping: {
          orders: { source: 'order_id', target: 'external_order_id' },
          inventory: { source: 'sku', target: 'product_code' },
        },
      },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: integrationTemplates.id }),
    db.insert(integrationTemplates).values({
      name: 'CRM Integration Template',
      description: 'Template for CRM system integration',
      template_type: 'crm',
      configuration: {
        auth_type: 'api_key',
        base_url: 'https://api.crm-system.com',
        endpoints: ['contacts', 'leads', 'opportunities'],
        data_mapping: {
          contacts: { source: 'email', target: 'contact_email' },
          leads: { source: 'company', target: 'organization' },
        },
      },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: integrationTemplates.id }),
  ]);

  // Seed integrations
  const integrationIds = await Promise.all([
    db.insert(integrations).values({
      name: 'SAP ERP Integration',
      description: 'Integration with SAP ERP system for order and inventory sync',
      integration_type: 'erp',
      provider: 'SAP',
      version: '1.0.0',
      status: 'active',
      configuration: {
        connection_string: 'sap://company.sap.com:8000',
        credentials: { username: 'api_user', password: 'encrypted_password' },
        sync_frequency: 'hourly',
        data_entities: ['orders', 'inventory', 'customers'],
      },
      template_id: templateIds[0].id,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: integrations.id }),
    db.insert(integrations).values({
      name: 'Salesforce CRM Integration',
      description: 'Integration with Salesforce CRM for customer data sync',
      integration_type: 'crm',
      provider: 'Salesforce',
      version: '2.1.0',
      status: 'active',
      configuration: {
        connection_string: 'https://company.salesforce.com',
        credentials: { access_token: 'encrypted_token', refresh_token: 'encrypted_refresh' },
        sync_frequency: 'real_time',
        data_entities: ['contacts', 'leads', 'opportunities'],
      },
      template_id: templateIds[1].id,
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: integrations.id }),
    db.insert(integrations).values({
      name: 'Payment Gateway Integration',
      description: 'Integration with Stripe payment gateway',
      integration_type: 'payment',
      provider: 'Stripe',
      version: '1.5.0',
      status: 'active',
      configuration: {
        connection_string: 'https://api.stripe.com',
        credentials: { api_key: 'encrypted_stripe_key' },
        sync_frequency: 'real_time',
        data_entities: ['payments', 'refunds', 'subscriptions'],
      },
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }).returning({ id: integrations.id }),
  ]);

  // Seed API endpoints
  await Promise.all([
    db.insert(apiEndpoints).values({
      name: 'Orders API',
      description: 'API endpoint for order management',
      endpoint_url: '/api/v1/orders',
      method: 'GET',
      integration_id: integrationIds[0].id,
      authentication_required: true,
      rate_limit: 1000,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(apiEndpoints).values({
      name: 'Inventory API',
      description: 'API endpoint for inventory management',
      endpoint_url: '/api/v1/inventory',
      method: 'POST',
      integration_id: integrationIds[0].id,
      authentication_required: true,
      rate_limit: 500,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(apiEndpoints).values({
      name: 'Customers API',
      description: 'API endpoint for customer data',
      endpoint_url: '/api/v1/customers',
      method: 'GET',
      integration_id: integrationIds[1].id,
      authentication_required: true,
      rate_limit: 2000,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed API keys
  await Promise.all([
    db.insert(apiKeys).values({
      name: 'SAP Integration Key',
      key_value: 'sk_live_1234567890abcdef',
      integration_id: integrationIds[0].id,
      permissions: ['read', 'write'],
      expires_at: new Date('2025-12-31'),
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(apiKeys).values({
      name: 'Salesforce Integration Key',
      key_value: 'sk_live_abcdef1234567890',
      integration_id: integrationIds[1].id,
      permissions: ['read', 'write', 'delete'],
      expires_at: new Date('2025-12-31'),
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed webhook subscriptions
  await Promise.all([
    db.insert(webhookSubscriptions).values({
      name: 'Order Updates Webhook',
      description: 'Webhook for order status updates',
      webhook_url: 'https://company.com/webhooks/orders',
      events: ['order.created', 'order.updated', 'order.completed'],
      integration_id: integrationIds[0].id,
      authentication: { type: 'bearer', token: 'encrypted_webhook_token' },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(webhookSubscriptions).values({
      name: 'Customer Updates Webhook',
      description: 'Webhook for customer data updates',
      webhook_url: 'https://company.com/webhooks/customers',
      events: ['customer.created', 'customer.updated'],
      integration_id: integrationIds[1].id,
      authentication: { type: 'bearer', token: 'encrypted_webhook_token' },
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed data mappings
  await Promise.all([
    db.insert(dataMappings).values({
      name: 'Order Mapping',
      description: 'Mapping between internal and SAP order fields',
      source_system: 'internal',
      target_system: 'sap',
      mapping_rules: {
        'order_id': 'external_order_id',
        'customer_name': 'customer_full_name',
        'order_date': 'creation_date',
        'total_amount': 'order_value',
      },
      integration_id: integrationIds[0].id,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(dataMappings).values({
      name: 'Customer Mapping',
      description: 'Mapping between internal and Salesforce customer fields',
      source_system: 'internal',
      target_system: 'salesforce',
      mapping_rules: {
        'customer_id': 'sf_contact_id',
        'email': 'contact_email',
        'phone': 'contact_phone',
        'company': 'account_name',
      },
      integration_id: integrationIds[1].id,
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed integration logs
  await Promise.all([
    db.insert(integrationLogs).values({
      integration_id: integrationIds[0].id,
      log_level: 'info',
      message: 'Successfully synced 150 orders with SAP',
      details: {
        sync_count: 150,
        errors: 0,
        duration: 45,
        timestamp: new Date().toISOString(),
      },
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(integrationLogs).values({
      integration_id: integrationIds[1].id,
      log_level: 'warning',
      message: 'Partial sync completed with 2 errors',
      details: {
        sync_count: 98,
        errors: 2,
        duration: 30,
        error_details: ['Invalid email format', 'Missing required field'],
        timestamp: new Date().toISOString(),
      },
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(integrationLogs).values({
      integration_id: integrationIds[2].id,
      log_level: 'error',
      message: 'Payment gateway connection failed',
      details: {
        error_code: 'CONNECTION_TIMEOUT',
        error_message: 'Connection to Stripe API timed out',
        retry_count: 3,
        timestamp: new Date().toISOString(),
      },
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  // Seed integration permissions
  await Promise.all([
    db.insert(integrationPermissions).values({
      integration_id: integrationIds[0].id,
      user_id: 'user-1',
      permissions: ['read', 'write', 'admin'],
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
    db.insert(integrationPermissions).values({
      integration_id: integrationIds[1].id,
      user_id: 'user-2',
      permissions: ['read', 'write'],
      status: 'active',
      tenant_id: 'tenant-1',
      created_by: 'user-1',
      updated_by: 'user-1',
    }),
  ]);

  console.log('✅ Integrations data seeded successfully');
} 