import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { requisitions, requisitionItems, purchaseOrders, purchaseOrderItems, procurementContracts } from '../schema/procurement';
import { logger } from '../../utils/logger';

export async function seedProcurement(db: PostgresJsDatabase, users: any[], suppliers: any[], tenantId: string) {
  try {
    logger.info('Seeding procurement data');
    
    // Create requisitions
    const createdRequisitions = await db.insert(requisitions).values([
      {
        tenantId,
        requisitionNumber: 'REQ-2024-001',
        title: 'Office Supplies Request',
        description: 'Monthly office supplies for the IT department',
        requestorId: users[0].id,
        status: 'APPROVED',
        priority: 'MEDIUM',
        category: 'OFFICE_SUPPLIES',
        department: 'IT',
        costCenter: 'IT-001',
        projectCode: 'PRJ-2024-001',
        budgetCode: 'BUDGET-2024-IT',
        budgetYear: 2024,
        totalAmount: 500.00,
        currency: 'USD',
        businessPurpose: 'Maintain adequate office supplies for daily operations',
        deliveryLocation: {
          name: 'IT Department - Main Office',
          address: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
          contactPerson: 'John Doe',
          contactNumber: '+1-555-0123',
        },
        requiredByDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        procurementType: 'GOODS',
        procurementMethod: 'RFQ',
        approvalWorkflow: {
          currentLevel: 2,
          maxLevels: 2,
          levels: [
            {
              level: 1,
              approver: {
                id: users[1].id,
                name: 'John Doe',
                position: 'Procurement Manager',
                department: 'Procurement',
              },
              status: 'APPROVED',
              timestamp: new Date().toISOString(),
            },
            {
              level: 2,
              approver: {
                id: users[0].id,
                name: 'Admin User',
                position: 'System Administrator',
                department: 'IT',
              },
              status: 'APPROVED',
              timestamp: new Date().toISOString(),
            },
          ],
        },
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        approverId: users[1].id,
        createdBy: users[0].id,
        updatedBy: users[0].id,
      },
      {
        tenantId,
        requisitionNumber: 'REQ-2024-002',
        title: 'IT Equipment Request',
        description: 'New laptops for the marketing team',
        requestorId: users[1].id,
        status: 'PENDING',
        priority: 'HIGH',
        category: 'IT_EQUIPMENT',
        department: 'Marketing',
        costCenter: 'MKT-001',
        projectCode: 'PRJ-2024-002',
        budgetCode: 'BUDGET-2024-MKT',
        budgetYear: 2024,
        totalAmount: 5000.00,
        currency: 'USD',
        businessPurpose: 'Equip new marketing team members with necessary hardware',
        deliveryLocation: {
          name: 'Marketing Department - Main Office',
          address: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          postalCode: '94105',
          contactPerson: 'Jane Smith',
          contactNumber: '+1-555-0124',
        },
        requiredByDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        procurementType: 'GOODS',
        procurementMethod: 'RFQ',
        approvalWorkflow: {
          currentLevel: 1,
          maxLevels: 2,
          levels: [
            {
              level: 1,
              approver: {
                id: users[1].id,
                name: 'John Doe',
                position: 'Procurement Manager',
                department: 'Procurement',
              },
              status: 'PENDING',
            },
            {
              level: 2,
              approver: {
                id: users[0].id,
                name: 'Admin User',
                position: 'System Administrator',
                department: 'IT',
              },
              status: 'PENDING',
            },
          ],
        },
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: users[1].id,
      },
    ]).returning();
    
    // Create requisition items
    await db.insert(requisitionItems).values([
      {
        tenantId,
        requisitionId: createdRequisitions[0].id,
        itemCode: 'ITEM-0003',
        description: 'Printer Paper',
        quantity: 50,
        unitOfMeasure: 'REAM',
        unitPrice: 4.99,
        currency: 'USD',
        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'OFFICE_SUPPLIES',
      },
      {
        tenantId,
        requisitionId: createdRequisitions[0].id,
        itemCode: 'ITEM-0004',
        description: 'Ballpoint Pens',
        quantity: 100,
        unitOfMeasure: 'EA',
        unitPrice: 0.99,
        currency: 'USD',
        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'OFFICE_SUPPLIES',
      },
      {
        tenantId,
        requisitionId: createdRequisitions[1].id,
        itemCode: 'ITEM-0002',
        description: 'Laptop Computer',
        quantity: 5,
        unitOfMeasure: 'EA',
        unitPrice: 1299.99,
        currency: 'USD',
        requestedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'IT_EQUIPMENT',
        manufacturer: 'Dell',
        partNumber: 'XPS-15-9500',
        preferredSupplier: 'Tech Innovations Inc',
        warrantyRequired: true,
        warrantyDuration: '3 years',
        technicalSpecifications: 'Intel i7, 16GB RAM, 512GB SSD, Windows 11 Pro',
      },
    ]);
    
    // Create purchase orders
    const createdPurchaseOrders = await db.insert(purchaseOrders).values([
      {
        tenantId,
        poNumber: 'PO-2024-001',
        type: 'STANDARD',
        status: 'APPROVED',
        supplierId: suppliers[0].id,
        orderDate: new Date().toISOString(),
        requiredByDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'USD',
        subtotal: 249.50,
        taxTotal: 24.95,
        shippingCost: 15.00,
        otherCharges: 0,
        totalAmount: 289.45,
        paymentTerms: 'Net 30',
        deliveryTerms: 'FOB Destination',
        shippingMethod: 'Ground',
        deliveryAddress: {
          name: 'Main Warehouse',
          address: '123 Warehouse St',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          postalCode: '60601',
          contactPerson: 'John Smith',
          contactNumber: '+1-555-0123',
        },
        billingAddress: {
          name: 'Finance Department',
          address: '456 Corporate Blvd',
          city: 'Chicago',
          state: 'IL',
          country: 'USA',
          postalCode: '60601',
          contactPerson: 'Jane Doe',
          contactNumber: '+1-555-0124',
        },
        deliveryStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        approvalWorkflow: {
          currentLevel: 2,
          maxLevels: 2,
          levels: [
            {
              level: 1,
              approver: {
                id: users[1].id,
                name: 'John Doe',
                position: 'Procurement Manager',
                department: 'Procurement',
              },
              status: 'APPROVED',
              timestamp: new Date().toISOString(),
            },
            {
              level: 2,
              approver: {
                id: users[0].id,
                name: 'Admin User',
                position: 'System Administrator',
                department: 'IT',
              },
              status: 'APPROVED',
              timestamp: new Date().toISOString(),
            },
          ],
        },
        metadata: {
          department: 'IT',
          costCenter: 'IT-001',
          projectCode: 'PRJ-2024-001',
          budgetCode: 'BUDGET-2024-IT',
        },
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        submittedById: users[0].id,
        approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        approvedById: users[1].id,
        createdBy: users[0].id,
      },
    ]).returning();
    
    // Create purchase order items
    await db.insert(purchaseOrderItems).values([
      {
        tenantId,
        purchaseOrderId: createdPurchaseOrders[0].id,
        lineNumber: 1,
        itemCode: 'ITEM-0003',
        description: 'Printer Paper',
        quantity: 50,
        unitOfMeasure: 'REAM',
        unitPrice: 4.99,
        currency: 'USD',
        taxRate: 10,
        taxAmount: 24.95,
        totalAmount: 274.45,
        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
        receivedQuantity: 0,
        remainingQuantity: 50,
        requisitionId: createdRequisitions[0].id,
      },
    ]);
    
    // Create contracts
    await db.insert(procurementContracts).values([
      {
        tenantId,
        contractNumber: 'CON-2024-001',
        title: 'Office Supplies Agreement',
        description: 'Annual contract for office supplies',
        type: 'SERVICE',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        supplierId: suppliers[0].id,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        value: 50000,
        currency: 'USD',
        renewalType: 'AUTOMATIC',
        autoRenew: true,
        renewalNotificationDays: 60,
        noticePeriodDays: 30,
        terms: 'Standard terms and conditions apply',
        terminationConditions: '30 days written notice required for early termination',
        approvalWorkflow: {
          currentLevel: 2,
          maxLevels: 2,
          levels: [
            {
              level: 1,
              approver: {
                id: users[1].id,
                name: 'John Doe',
                position: 'Procurement Manager',
                department: 'Procurement',
              },
              status: 'APPROVED',
              timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              level: 2,
              approver: {
                id: users[0].id,
                name: 'Admin User',
                position: 'System Administrator',
                department: 'IT',
              },
              status: 'APPROVED',
              timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        },
        metadata: {
          department: 'Procurement',
          costCenter: 'PROC-001',
          projectCode: 'PRJ-2024-001',
          budgetCode: 'BUDGET-2024-PROC',
        },
        approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        approvedById: users[0].id,
        createdBy: users[1].id,
      },
    ]);
    
    logger.info('Procurement data seeded successfully');
    return createdRequisitions;
  } catch (error) {
    logger.error('Error seeding procurement data', { error });
    throw error;
  }
}