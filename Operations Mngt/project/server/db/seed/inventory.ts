import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { inventoryItems, inventoryMovements, inventoryAdjustments } from '../schema/inventory';
import { logger } from '../../utils/logger';

export async function seedInventory(db: PostgresJsDatabase, createdById: string, suppliers: any[], tenantId: string) {
  try {
    logger.info('Seeding inventory data');
    
    // Create inventory items
    const createdItems = await db.insert(inventoryItems).values([
      {
        tenantId,
        itemCode: 'ITEM-0001',
        name: 'Office Chair',
        description: 'Ergonomic office chair with adjustable height',
        category: 'Office Furniture',
        status: 'IN_STOCK',
        minQuantity: 10,
        maxQuantity: 100,
        reorderPoint: 20,
        currentQuantity: 45,
        unitCost: 199.99,
        currency: 'USD',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A',
          bin: 'BIN-001',
        },
        specifications: {
          material: 'Mesh and plastic',
          color: 'Black',
          dimensions: '26"W x 26"D x 38-42"H',
          weight: '35 lbs',
        },
        dimensions: {
          length: 26,
          width: 26,
          height: 40,
          weight: 35,
          uom: 'IN/LB',
        },
        supplierId: suppliers[0].id,
        createdBy: createdById,
      },
      {
        tenantId,
        itemCode: 'ITEM-0002',
        name: 'Laptop Computer',
        description: 'Business laptop with 15" screen and 16GB RAM',
        category: 'IT Equipment',
        status: 'IN_STOCK',
        minQuantity: 5,
        maxQuantity: 50,
        reorderPoint: 10,
        currentQuantity: 12,
        unitCost: 1299.99,
        currency: 'USD',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone B',
          bin: 'BIN-101',
        },
        specifications: {
          processor: 'Intel i7',
          memory: '16GB',
          storage: '512GB SSD',
          display: '15.6" FHD',
          operatingSystem: 'Windows 11 Pro',
        },
        dimensions: {
          length: 14,
          width: 9.5,
          height: 0.7,
          weight: 3.5,
          uom: 'IN/LB',
        },
        supplierId: suppliers[1].id,
        createdBy: createdById,
      },
      {
        tenantId,
        itemCode: 'ITEM-0003',
        name: 'Printer Paper',
        description: 'A4 printer paper, 80gsm, 500 sheets per ream',
        category: 'Office Supplies',
        status: 'IN_STOCK',
        minQuantity: 50,
        maxQuantity: 500,
        reorderPoint: 100,
        currentQuantity: 320,
        unitCost: 4.99,
        currency: 'USD',
        location: {
          warehouse: 'Main Warehouse',
          zone: 'Zone C',
          bin: 'BIN-201',
        },
        specifications: {
          size: 'A4',
          weight: '80gsm',
          color: 'White',
          sheets: 500,
        },
        dimensions: {
          length: 11.7,
          width: 8.3,
          height: 2,
          weight: 5,
          uom: 'IN/LB',
        },
        supplierId: suppliers[0].id,
        createdBy: createdById,
      },
    ]).returning();
    
    // Create inventory movements
    await db.insert(inventoryMovements).values([
      {
        tenantId,
        type: 'RECEIPT',
        referenceNumber: 'REC-001',
        itemId: createdItems[0].id,
        quantity: 50,
        toLocation: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A',
          bin: 'BIN-001',
        },
        status: 'COMPLETED',
        processedById: createdById,
        processedAt: new Date().toISOString(),
        notes: 'Initial stock receipt',
        createdBy: createdById,
      },
      {
        tenantId,
        type: 'ISSUE',
        referenceNumber: 'ISS-001',
        itemId: createdItems[0].id,
        quantity: 5,
        fromLocation: {
          warehouse: 'Main Warehouse',
          zone: 'Zone A',
          bin: 'BIN-001',
        },
        status: 'COMPLETED',
        processedById: createdById,
        processedAt: new Date().toISOString(),
        notes: 'Issued to IT department',
        createdBy: createdById,
      },
      {
        tenantId,
        type: 'RECEIPT',
        referenceNumber: 'REC-002',
        itemId: createdItems[1].id,
        quantity: 15,
        toLocation: {
          warehouse: 'Main Warehouse',
          zone: 'Zone B',
          bin: 'BIN-101',
        },
        status: 'COMPLETED',
        processedById: createdById,
        processedAt: new Date().toISOString(),
        notes: 'Initial stock receipt',
        createdBy: createdById,
      },
      {
        tenantId,
        type: 'ISSUE',
        referenceNumber: 'ISS-002',
        itemId: createdItems[1].id,
        quantity: 3,
        fromLocation: {
          warehouse: 'Main Warehouse',
          zone: 'Zone B',
          bin: 'BIN-101',
        },
        status: 'COMPLETED',
        processedById: createdById,
        processedAt: new Date().toISOString(),
        notes: 'Issued to new employees',
        createdBy: createdById,
      },
    ]);
    
    // Create inventory adjustments
    await db.insert(inventoryAdjustments).values([
      {
        tenantId,
        adjustmentNumber: 'ADJ-001',
        itemId: createdItems[2].id,
        type: 'INCREASE',
        quantity: 20,
        reason: 'Count discrepancy',
        status: 'COMPLETED',
        approverId: createdById,
        approvedAt: new Date().toISOString(),
        notes: 'Adjustment after physical count',
        createdBy: createdById,
      },
      {
        tenantId,
        adjustmentNumber: 'ADJ-002',
        itemId: createdItems[0].id,
        type: 'DECREASE',
        quantity: 2,
        reason: 'Damaged items',
        status: 'COMPLETED',
        approverId: createdById,
        approvedAt: new Date().toISOString(),
        notes: 'Chairs damaged during handling',
        createdBy: createdById,
      },
    ]);
    
    logger.info('Inventory data seeded successfully');
    return createdItems;
  } catch (error) {
    logger.error('Error seeding inventory data', { error });
    throw error;
  }
}