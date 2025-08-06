import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { authenticate, hasPermissions } from '../middleware/auth';
import { AppError } from '../utils/app-error';

// Analytics routes
export default async function analyticsRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get dashboard data
  fastify.get('/dashboard', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            procurement: {
              type: 'object',
              properties: {
                totalRequisitions: { type: 'number' },
                pendingApprovals: { type: 'number' },
                purchaseOrders: { type: 'number' },
                spendYTD: { type: 'number' },
                changePercentage: { type: 'number' },
              },
            },
            inventory: {
              type: 'object',
              properties: {
                totalItems: { type: 'number' },
                totalValue: { type: 'number' },
                turnoverRate: { type: 'number' },
                outOfStockCount: { type: 'number' },
                lowStockCount: { type: 'number' },
                changePercentage: { type: 'number' },
              },
            },
            logistics: {
              type: 'object',
              properties: {
                activeShipments: { type: 'number' },
                onTimePercentage: { type: 'number' },
                avgTransitDays: { type: 'number' },
                freightSpend: { type: 'number' },
                changePercentage: { type: 'number' },
              },
            },
            charts: { type: 'object' },
            recentActivity: { type: 'array', items: { type: 'object' } },
            statusOverview: { type: 'object' },
            alerts: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { startDate, endDate } = request.query as { startDate?: string; endDate?: string };
    
    // Set default date range if not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    try {
      // Get dashboard metrics from database
      // In a real implementation, you would fetch this data from the database
      // For now, we'll return mock data
      
      return {
        procurement: {
          totalRequisitions: 124,
          pendingApprovals: 18,
          purchaseOrders: 87,
          spendYTD: 1250000,
          changePercentage: 12.5,
        },
        inventory: {
          totalItems: 1842,
          totalValue: 1400000,
          turnoverRate: 5.8,
          outOfStockCount: 23,
          lowStockCount: 45,
          changePercentage: 3.2,
        },
        logistics: {
          activeShipments: 42,
          onTimePercentage: 92,
          avgTransitDays: 3.5,
          freightSpend: 320000,
          changePercentage: 8.3,
        },
        charts: {
          // Mock chart data would go here
        },
        recentActivity: [
          {
            id: '1',
            type: 'requisition',
            action: 'created',
            entityId: 'req-1',
            entityName: 'Office Supplies Request',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: { id: 'user-1', name: 'John Doe' },
          },
          {
            id: '2',
            type: 'purchase_order',
            action: 'approved',
            entityId: 'po-1',
            entityName: 'PO-2024-001',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            user: { id: 'user-2', name: 'Jane Smith' },
          },
        ],
        statusOverview: {
          healthy: 5,
          warnings: 2,
          critical: 0,
        },
        alerts: [
          {
            id: '1',
            severity: 'warning',
            message: '5 purchase orders pending approval for more than 3 days',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            severity: 'warning',
            message: '3 items are below reorder point',
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } catch (error) {
      throw new AppError('Failed to fetch dashboard data', 500);
    }
  });
  
  // Get inventory analytics
  fastify.get('/inventory', {
    preHandler: hasPermissions(['view_reports', 'manage_inventory']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
          warehouse: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalItems: { type: 'number' },
                totalValue: { type: 'number' },
                turnoverRate: { type: 'number' },
                outOfStockCount: { type: 'number' },
                lowStockCount: { type: 'number' },
              },
            },
            byCategory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  itemCount: { type: 'number' },
                  totalValue: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                },
              },
            },
            byWarehouse: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  warehouse: { type: 'string' },
                  itemCount: { type: 'number' },
                  totalValue: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                },
              },
            },
            movementTrends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date-time' },
                  receipts: { type: 'number' },
                  issues: { type: 'number' },
                  adjustments: { type: 'number' },
                  returns: { type: 'number' },
                },
              },
            },
            topItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  itemCode: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' },
                  currentQuantity: { type: 'number' },
                  totalValue: { type: 'number' },
                  turnoverRate: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock inventory analytics data
    return {
      summary: {
        totalItems: 1842,
        totalValue: 1400000,
        turnoverRate: 5.8,
        outOfStockCount: 23,
        lowStockCount: 45,
      },
      byCategory: [
        {
          category: 'Electronics',
          itemCount: 450,
          totalValue: 650000,
          percentageOfTotal: 46.4,
        },
        {
          category: 'Office Supplies',
          itemCount: 320,
          totalValue: 120000,
          percentageOfTotal: 8.6,
        },
        {
          category: 'Furniture',
          itemCount: 120,
          totalValue: 350000,
          percentageOfTotal: 25.0,
        },
        {
          category: 'IT Equipment',
          itemCount: 280,
          totalValue: 280000,
          percentageOfTotal: 20.0,
        },
      ],
      byWarehouse: [
        {
          warehouse: 'Main Warehouse',
          itemCount: 1200,
          totalValue: 900000,
          percentageOfTotal: 64.3,
        },
        {
          warehouse: 'East Coast DC',
          itemCount: 450,
          totalValue: 350000,
          percentageOfTotal: 25.0,
        },
        {
          warehouse: 'West Coast DC',
          itemCount: 192,
          totalValue: 150000,
          percentageOfTotal: 10.7,
        },
      ],
      movementTrends: [
        {
          date: '2024-01-01T00:00:00Z',
          receipts: 120,
          issues: 80,
          adjustments: 5,
          returns: 10,
        },
        {
          date: '2024-02-01T00:00:00Z',
          receipts: 150,
          issues: 100,
          adjustments: 8,
          returns: 12,
        },
        {
          date: '2024-03-01T00:00:00Z',
          receipts: 130,
          issues: 110,
          adjustments: 3,
          returns: 15,
        },
      ],
      topItems: [
        {
          id: 'item-1',
          itemCode: 'ITEM-0001',
          name: 'Laptop Computer',
          category: 'IT Equipment',
          currentQuantity: 45,
          totalValue: 58500,
          turnoverRate: 8.2,
        },
        {
          id: 'item-2',
          itemCode: 'ITEM-0002',
          name: 'Office Chair',
          category: 'Furniture',
          currentQuantity: 120,
          totalValue: 24000,
          turnoverRate: 4.5,
        },
        {
          id: 'item-3',
          itemCode: 'ITEM-0003',
          name: 'Printer Paper',
          category: 'Office Supplies',
          currentQuantity: 500,
          totalValue: 2500,
          turnoverRate: 12.3,
        },
      ],
    };
  });
  
  // Get procurement analytics
  fastify.get('/procurement', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          department: { type: 'string' },
          supplier: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalRequisitions: { type: 'number' },
                totalPurchaseOrders: { type: 'number' },
                totalSpend: { type: 'number' },
                averageCycleTime: { type: 'number' },
                savingsPercentage: { type: 'number' },
              },
            },
            spendByCategory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  spend: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                },
              },
            },
            spendByDepartment: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  department: { type: 'string' },
                  spend: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                },
              },
            },
            spendTrends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date-time' },
                  spend: { type: 'number' },
                  orders: { type: 'number' },
                },
              },
            },
            topSuppliers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  spend: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                  orderCount: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock procurement analytics data
    return {
      summary: {
        totalRequisitions: 324,
        totalPurchaseOrders: 287,
        totalSpend: 4250000,
        averageCycleTime: 5.3,
        savingsPercentage: 8.5,
      },
      spendByCategory: [
        {
          category: 'IT Equipment',
          spend: 1500000,
          percentageOfTotal: 35.3,
        },
        {
          category: 'Office Supplies',
          spend: 500000,
          percentageOfTotal: 11.8,
        },
        {
          category: 'Professional Services',
          spend: 1200000,
          percentageOfTotal: 28.2,
        },
        {
          category: 'Maintenance',
          spend: 800000,
          percentageOfTotal: 18.8,
        },
        {
          category: 'Other',
          spend: 250000,
          percentageOfTotal: 5.9,
        },
      ],
      spendByDepartment: [
        {
          department: 'IT',
          spend: 1800000,
          percentageOfTotal: 42.4,
        },
        {
          department: 'Operations',
          spend: 1200000,
          percentageOfTotal: 28.2,
        },
        {
          department: 'Marketing',
          spend: 750000,
          percentageOfTotal: 17.6,
        },
        {
          department: 'Finance',
          spend: 300000,
          percentageOfTotal: 7.1,
        },
        {
          department: 'HR',
          spend: 200000,
          percentageOfTotal: 4.7,
        },
      ],
      spendTrends: [
        {
          date: '2024-01-01T00:00:00Z',
          spend: 350000,
          orders: 25,
        },
        {
          date: '2024-02-01T00:00:00Z',
          spend: 420000,
          orders: 32,
        },
        {
          date: '2024-03-01T00:00:00Z',
          spend: 380000,
          orders: 28,
        },
      ],
      topSuppliers: [
        {
          id: 'supplier-1',
          name: 'Acme Corporation',
          spend: 850000,
          percentageOfTotal: 20.0,
          orderCount: 45,
        },
        {
          id: 'supplier-2',
          name: 'Tech Innovations Inc',
          spend: 720000,
          percentageOfTotal: 16.9,
          orderCount: 38,
        },
        {
          id: 'supplier-3',
          name: 'Global Logistics Partners',
          spend: 550000,
          percentageOfTotal: 12.9,
          orderCount: 25,
        },
      ],
    };
  });
  
  // Get supplier analytics
  fastify.get('/suppliers', {
    preHandler: hasPermissions(['view_reports', 'manage_suppliers']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalSuppliers: { type: 'number' },
                activeSuppliers: { type: 'number' },
                newSuppliers: { type: 'number' },
                averagePerformanceScore: { type: 'number' },
              },
            },
            suppliersByType: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  count: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                },
              },
            },
            suppliersByRiskLevel: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  riskLevel: { type: 'string' },
                  count: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                },
              },
            },
            performanceMetrics: {
              type: 'object',
              properties: {
                quality: { type: 'number' },
                delivery: { type: 'number' },
                cost: { type: 'number' },
                overall: { type: 'number' },
              },
            },
            topPerformingSuppliers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  performanceScore: { type: 'number' },
                  qualityScore: { type: 'number' },
                  deliveryScore: { type: 'number' },
                  costScore: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock supplier analytics data
    return {
      summary: {
        totalSuppliers: 128,
        activeSuppliers: 105,
        newSuppliers: 12,
        averagePerformanceScore: 85.3,
      },
      suppliersByType: [
        {
          type: 'MANUFACTURER',
          count: 45,
          percentageOfTotal: 35.2,
        },
        {
          type: 'DISTRIBUTOR',
          count: 32,
          percentageOfTotal: 25.0,
        },
        {
          type: 'SERVICE_PROVIDER',
          count: 28,
          percentageOfTotal: 21.9,
        },
        {
          type: 'WHOLESALER',
          count: 15,
          percentageOfTotal: 11.7,
        },
        {
          type: 'RETAILER',
          count: 8,
          percentageOfTotal: 6.2,
        },
      ],
      suppliersByRiskLevel: [
        {
          riskLevel: 'LOW',
          count: 65,
          percentageOfTotal: 50.8,
        },
        {
          riskLevel: 'MEDIUM',
          count: 45,
          percentageOfTotal: 35.2,
        },
        {
          riskLevel: 'HIGH',
          count: 15,
          percentageOfTotal: 11.7,
        },
        {
          riskLevel: 'CRITICAL',
          count: 3,
          percentageOfTotal: 2.3,
        },
      ],
      performanceMetrics: {
        quality: 87.5,
        delivery: 84.2,
        cost: 82.8,
        overall: 85.3,
      },
      topPerformingSuppliers: [
        {
          id: 'supplier-1',
          name: 'Acme Corporation',
          performanceScore: 95.2,
          qualityScore: 96.0,
          deliveryScore: 94.5,
          costScore: 93.8,
        },
        {
          id: 'supplier-2',
          name: 'Tech Innovations Inc',
          performanceScore: 92.8,
          qualityScore: 94.2,
          deliveryScore: 91.5,
          costScore: 92.0,
        },
        {
          id: 'supplier-3',
          name: 'Global Logistics Partners',
          performanceScore: 91.5,
          qualityScore: 90.8,
          deliveryScore: 93.2,
          costScore: 89.5,
        },
      ],
    };
  });
  
  // Get transportation analytics
  fastify.get('/transportation', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          carrier: { type: 'string' },
          mode: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalShipments: { type: 'number' },
                totalFreightSpend: { type: 'number' },
                onTimeDeliveryPercentage: { type: 'number' },
                averageTransitDays: { type: 'number' },
                damageRate: { type: 'number' },
              },
            },
            spendByCarrier: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  carrierId: { type: 'string' },
                  carrierName: { type: 'string' },
                  spend: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                  shipmentCount: { type: 'number' },
                },
              },
            },
            spendByMode: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  mode: { type: 'string' },
                  spend: { type: 'number' },
                  percentageOfTotal: { type: 'number' },
                  shipmentCount: { type: 'number' },
                },
              },
            },
            shipmentTrends: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date-time' },
                  shipmentCount: { type: 'number' },
                  freightSpend: { type: 'number' },
                  onTimePercentage: { type: 'number' },
                },
              },
            },
            carrierPerformance: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  carrierId: { type: 'string' },
                  carrierName: { type: 'string' },
                  onTimeDelivery: { type: 'number' },
                  damageRate: { type: 'number' },
                  averageTransitDays: { type: 'number' },
                  costPerMile: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock transportation analytics data
    return {
      summary: {
        totalShipments: 1250,
        totalFreightSpend: 850000,
        onTimeDeliveryPercentage: 92.5,
        averageTransitDays: 3.2,
        damageRate: 0.8,
      },
      spendByCarrier: [
        {
          carrierId: 'carrier-1',
          carrierName: 'Express FTL Carriers',
          spend: 320000,
          percentageOfTotal: 37.6,
          shipmentCount: 450,
        },
        {
          carrierId: 'carrier-2',
          carrierName: 'Global LTL Carriers',
          spend: 280000,
          percentageOfTotal: 32.9,
          shipmentCount: 380,
        },
        {
          carrierId: 'carrier-3',
          carrierName: 'Fast Parcel Carriers',
          spend: 150000,
          percentageOfTotal: 17.6,
          shipmentCount: 320,
        },
        {
          carrierId: 'carrier-4',
          carrierName: 'Premium Air Carriers',
          spend: 100000,
          percentageOfTotal: 11.8,
          shipmentCount: 100,
        },
      ],
      spendByMode: [
        {
          mode: 'FTL',
          spend: 350000,
          percentageOfTotal: 41.2,
          shipmentCount: 480,
        },
        {
          mode: 'LTL',
          spend: 250000,
          percentageOfTotal: 29.4,
          shipmentCount: 350,
        },
        {
          mode: 'PARCEL',
          spend: 150000,
          percentageOfTotal: 17.6,
          shipmentCount: 320,
        },
        {
          mode: 'AIR',
          spend: 100000,
          percentageOfTotal: 11.8,
          shipmentCount: 100,
        },
      ],
      shipmentTrends: [
        {
          date: '2024-01-01T00:00:00Z',
          shipmentCount: 380,
          freightSpend: 260000,
          onTimePercentage: 91.2,
        },
        {
          date: '2024-02-01T00:00:00Z',
          shipmentCount: 420,
          freightSpend: 290000,
          onTimePercentage: 92.8,
        },
        {
          date: '2024-03-01T00:00:00Z',
          shipmentCount: 450,
          freightSpend: 300000,
          onTimePercentage: 93.5,
        },
      ],
      carrierPerformance: [
        {
          carrierId: 'carrier-1',
          carrierName: 'Express FTL Carriers',
          onTimeDelivery: 94.5,
          damageRate: 0.5,
          averageTransitDays: 2.8,
          costPerMile: 2.35,
        },
        {
          carrierId: 'carrier-2',
          carrierName: 'Global LTL Carriers',
          onTimeDelivery: 91.2,
          damageRate: 0.8,
          averageTransitDays: 3.5,
          costPerMile: 1.95,
        },
        {
          carrierId: 'carrier-3',
          carrierName: 'Fast Parcel Carriers',
          onTimeDelivery: 96.8,
          damageRate: 0.3,
          averageTransitDays: 1.5,
          costPerMile: 3.25,
        },
      ],
    };
  });
}