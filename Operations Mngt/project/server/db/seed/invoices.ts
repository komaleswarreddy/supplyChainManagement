import { db } from '../index';
import { invoices, invoiceItems, invoicePayments, invoiceDisputes, invoiceTemplates } from '../schema';
import { users } from '../schema/users';
import { suppliers } from '../schema/suppliers';
import { customers } from '../schema/orders';
import { purchaseOrders } from '../schema/procurement';

export async function seedInvoices() {
  console.log('🌱 Seeding invoices...');

  // Get existing users, suppliers, customers, and purchase orders for references
  const [existingUsers, existingSuppliers, existingCustomers, existingPurchaseOrders] = await Promise.all([
    db.select().from(users).limit(5),
    db.select().from(suppliers).limit(5),
    db.select().from(customers).limit(5),
    db.select().from(purchaseOrders).limit(5),
  ]);

  if (existingUsers.length === 0 || existingSuppliers.length === 0) {
    console.log('⚠️  Skipping invoice seeding - missing required references (users, suppliers)');
    return;
  }

  const tenantId = existingUsers[0].tenantId;
  const createdBy = existingUsers[0].id;

  // Seed Invoice Templates
  const invoiceTemplateData = [
    {
      tenantId,
      name: 'Standard Purchase Invoice',
      description: 'Default template for purchase invoices',
      type: 'PURCHASE',
      template: {
        header: {
          companyLogo: true,
          invoiceNumber: true,
          date: true,
          dueDate: true,
        },
        body: {
          supplierInfo: true,
          lineItems: true,
          subtotal: true,
          tax: true,
          total: true,
        },
        footer: {
          paymentTerms: true,
          notes: true,
        },
      },
      isDefault: true,
      isActive: true,
      createdBy,
    },
    {
      tenantId,
      name: 'Standard Sales Invoice',
      description: 'Default template for sales invoices',
      type: 'SALES',
      template: {
        header: {
          companyLogo: true,
          invoiceNumber: true,
          date: true,
          dueDate: true,
        },
        body: {
          customerInfo: true,
          lineItems: true,
          subtotal: true,
          tax: true,
          total: true,
        },
        footer: {
          paymentTerms: true,
          notes: true,
        },
      },
      isDefault: true,
      isActive: true,
      createdBy,
    },
  ];

  const createdTemplates = await Promise.all(
    invoiceTemplateData.map(template => 
      db.insert(invoiceTemplates).values(template).returning()
    )
  );

  // Seed Invoices
  const invoiceData = [
    {
      tenantId,
      invoiceNumber: 'INV-2024-001',
      type: 'PURCHASE',
      status: 'APPROVED',
      supplierId: existingSuppliers[0]?.id,
      invoiceDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      paymentTerms: 'Net 30',
      currency: 'USD',
      exchangeRate: 1.0,
      subtotal: 5000.00,
      taxAmount: 500.00,
      discountAmount: 0.00,
      shippingAmount: 100.00,
      totalAmount: 5600.00,
      paidAmount: 0.00,
      balanceAmount: 5600.00,
      billingAddress: {
        name: 'ABC Corporation',
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      shippingAddress: {
        name: 'ABC Corporation',
        street: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
      notes: 'Standard purchase invoice for office supplies',
      createdBy,
    },
    {
      tenantId,
      invoiceNumber: 'INV-2024-002',
      type: 'SALES',
      status: 'PAID',
      customerId: existingCustomers[0]?.id,
      invoiceDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
      paymentTerms: 'Net 30',
      currency: 'USD',
      exchangeRate: 1.0,
      subtotal: 7500.00,
      taxAmount: 750.00,
      discountAmount: 250.00,
      shippingAmount: 150.00,
      totalAmount: 8150.00,
      paidAmount: 8150.00,
      balanceAmount: 0.00,
      billingAddress: {
        name: 'XYZ Company',
        street: '456 Customer St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
      },
      shippingAddress: {
        name: 'XYZ Company',
        street: '456 Customer St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
      },
      notes: 'Product sales invoice - payment received',
      createdBy,
    },
    {
      tenantId,
      invoiceNumber: 'INV-2024-003',
      type: 'PURCHASE',
      status: 'DRAFT',
      supplierId: existingSuppliers[1]?.id,
      purchaseOrderId: existingPurchaseOrders[0]?.id,
      invoiceDate: new Date('2024-01-25'),
      dueDate: new Date('2024-02-25'),
      paymentTerms: 'Net 45',
      currency: 'USD',
      exchangeRate: 1.0,
      subtotal: 12000.00,
      taxAmount: 1200.00,
      discountAmount: 600.00,
      shippingAmount: 200.00,
      totalAmount: 12800.00,
      paidAmount: 0.00,
      balanceAmount: 12800.00,
      billingAddress: {
        name: 'DEF Industries',
        street: '789 Supplier Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      shippingAddress: {
        name: 'DEF Industries',
        street: '789 Supplier Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      notes: 'Draft invoice for equipment purchase',
      createdBy,
    },
  ];

  const createdInvoices = await Promise.all(
    invoiceData.map(invoice => 
      db.insert(invoices).values(invoice).returning()
    )
  );

  // Seed Invoice Items
  const invoiceItemData = [
    // Items for first invoice
    {
      tenantId,
      invoiceId: createdInvoices[0][0].id,
      lineNumber: 1,
      description: 'Office Supplies - Paper, Pens, Staplers',
      quantity: 100,
      unitPrice: 25.00,
      discount: 0.00,
      taxRate: 10.00,
      lineTotal: 2750.00,
      accountCode: 'OFFICE_SUPPLIES',
      costCenter: 'ADMIN',
    },
    {
      tenantId,
      invoiceId: createdInvoices[0][0].id,
      lineNumber: 2,
      description: 'Computer Equipment - Laptops',
      quantity: 5,
      unitPrice: 450.00,
      discount: 0.00,
      taxRate: 10.00,
      lineTotal: 2475.00,
      accountCode: 'COMPUTER_EQUIPMENT',
      costCenter: 'IT',
    },
    // Items for second invoice
    {
      tenantId,
      invoiceId: createdInvoices[1][0].id,
      lineNumber: 1,
      description: 'Software Licenses - Annual Subscription',
      quantity: 1,
      unitPrice: 5000.00,
      discount: 250.00,
      taxRate: 10.00,
      lineTotal: 5225.00,
      accountCode: 'SOFTWARE_LICENSES',
      costCenter: 'SALES',
    },
    {
      tenantId,
      invoiceId: createdInvoices[1][0].id,
      lineNumber: 2,
      description: 'Consulting Services - Implementation',
      quantity: 40,
      unitPrice: 75.00,
      discount: 0.00,
      taxRate: 10.00,
      lineTotal: 3300.00,
      accountCode: 'CONSULTING_SERVICES',
      costCenter: 'SALES',
    },
    // Items for third invoice
    {
      tenantId,
      invoiceId: createdInvoices[2][0].id,
      lineNumber: 1,
      description: 'Manufacturing Equipment - CNC Machine',
      quantity: 1,
      unitPrice: 10000.00,
      discount: 500.00,
      taxRate: 10.00,
      lineTotal: 10450.00,
      accountCode: 'MANUFACTURING_EQUIPMENT',
      costCenter: 'PRODUCTION',
    },
    {
      tenantId,
      invoiceId: createdInvoices[2][0].id,
      lineNumber: 2,
      description: 'Installation and Setup Services',
      quantity: 1,
      unitPrice: 2000.00,
      discount: 100.00,
      taxRate: 10.00,
      lineTotal: 2090.00,
      accountCode: 'INSTALLATION_SERVICES',
      costCenter: 'PRODUCTION',
    },
  ];

  await Promise.all(
    invoiceItemData.map(item => 
      db.insert(invoiceItems).values(item)
    )
  );

  // Seed Invoice Payments
  const paymentData = [
    {
      tenantId,
      invoiceId: createdInvoices[1][0].id, // Paid invoice
      paymentNumber: 'PAY-2024-001',
      paymentDate: new Date('2024-02-15'),
      amount: 8150.00,
      currency: 'USD',
      exchangeRate: 1.0,
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: 'BT-2024-001',
      bankAccount: '1234567890',
      notes: 'Full payment received via bank transfer',
      createdBy,
    },
  ];

  await Promise.all(
    paymentData.map(payment => 
      db.insert(invoicePayments).values(payment)
    )
  );

  // Seed Invoice Disputes
  const disputeData = [
    {
      tenantId,
      invoiceId: createdInvoices[0][0].id,
      disputeNumber: 'DISP-2024-001',
      type: 'PRICING',
      status: 'OPEN',
      priority: 'MEDIUM',
      description: 'Dispute over unit pricing for computer equipment - price seems higher than quoted',
      disputedAmount: 450.00,
      createdBy,
      assignedTo: existingUsers[1]?.id,
    },
  ];

  await Promise.all(
    disputeData.map(dispute => 
      db.insert(invoiceDisputes).values(dispute)
    )
  );

  console.log('✅ Invoices seeded successfully');
} 