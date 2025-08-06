import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/supabase';

// Types for dashboard data
export interface DashboardData {
  procurement: {
    totalRequisitions: number;
    pendingApprovals: number;
    purchaseOrders: number;
    spendYTD: number;
    changePercentage: number;
    pendingApprovalsChange: number;
    purchaseOrdersChange: number;
    spendYTDChange: number;
  };
  inventory: {
    totalItems: number;
    totalValue: number;
    turnoverRate: number;
    outOfStockCount: number;
    lowStockCount: number;
    changePercentage: number;
    valueChangePercentage: number;
    turnoverChangePercentage: number;
    outOfStockChangePercentage: number;
    lowStockChangePercentage: number;
  };
  logistics: {
    activeShipments: number;
    onTimePercentage: number;
    avgTransitDays: number;
    freightSpend: number;
    changePercentage: number;
    onTimeChangePercentage: number;
    transitDaysChangePercentage: number;
    freightSpendChangePercentage: number;
  };
  charts: {
    procurementActivity: Array<{
      date: string;
      requisitions: number;
      purchaseOrders: number;
    }>;
    inventoryStatus: Array<{
      category: string;
      inStock: number;
      lowStock: number;
      outOfStock: number;
    }>;
    supplierDistribution: Array<{
      name: string;
      value: number;
    }>;
    logisticsPerformance: Array<{
      month: string;
      shipments: number;
      onTimePercentage: number;
    }>;
    requisitionStatus: Array<{
      name: string;
      value: number;
    }>;
    spendAnalysis: Array<{
      month: string;
      spend: number;
      savings: number;
    }>;
    inventoryLevels: Array<{
      date: string;
      stock: number;
      reorderPoint: number;
    }>;
    inventoryByCategory: Array<{
      name: string;
      value: number;
    }>;
    inventoryMovements: Array<{
      date: string;
      receipts: number;
      issues: number;
      adjustments: number;
    }>;
    supplierPerformance: Array<{
      name: string;
      quality: number;
      delivery: number;
      cost: number;
    }>;
    shipmentStatus: Array<{
      name: string;
      value: number;
    }>;
    carrierPerformance: Array<{
      name: string;
      onTimePercentage: number;
    }>;
    shipmentTrends: Array<{
      month: string;
      shipments: number;
      cost: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'requisition' | 'purchase_order' | 'inventory' | 'shipment' | 'supplier' | 'user';
    action: 'created' | 'updated' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    entityId: string;
    entityName: string;
    timestamp: string;
    user: {
      id: string;
      name: string;
    };
  }>;
  statusOverview: {
    healthy: number;
    warnings: number;
    critical: number;
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }>;
  topSuppliers: Array<{
    id: string;
    name: string;
    spend: number;
    orders: number;
    onTimeDelivery: number;
    qualityScore: number;
  }>;
}

interface DashboardParams {
  startDate: string;
  endDate: string;
}

// Mock data for development
const generateMockDashboardData = (): DashboardData => {
  // Generate dates for the last 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  // Generate months for the last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toLocaleString('default', { month: 'short' });
  }).reverse();

  return {
    procurement: {
      totalRequisitions: 124,
      pendingApprovals: 18,
      purchaseOrders: 87,
      spendYTD: 1250000,
      changePercentage: 12.5,
      pendingApprovalsChange: -5.2,
      purchaseOrdersChange: 8.7,
      spendYTDChange: 15.3
    },
    inventory: {
      totalItems: 1842,
      totalValue: 1400000,
      turnoverRate: 5.8,
      outOfStockCount: 23,
      lowStockCount: 45,
      changePercentage: 3.2,
      valueChangePercentage: -1.5,
      turnoverChangePercentage: 0.3,
      outOfStockChangePercentage: -12.5,
      lowStockChangePercentage: -8.2
    },
    logistics: {
      activeShipments: 42,
      onTimePercentage: 92,
      avgTransitDays: 3.5,
      freightSpend: 320000,
      changePercentage: 8.3,
      onTimeChangePercentage: 1.5,
      transitDaysChangePercentage: -0.2,
      freightSpendChangePercentage: 5.2
    },
    charts: {
      procurementActivity: dates.map((date, i) => ({
        date,
        requisitions: 10 + Math.floor(Math.random() * 20),
        purchaseOrders: 5 + Math.floor(Math.random() * 15)
      })),
      inventoryStatus: [
        { category: 'Electronics', inStock: 450, lowStock: 30, outOfStock: 5 },
        { category: 'Office Supplies', inStock: 320, lowStock: 15, outOfStock: 8 },
        { category: 'Furniture', inStock: 120, lowStock: 0, outOfStock: 10 },
        { category: 'IT Equipment', inStock: 280, lowStock: 25, outOfStock: 0 }
      ],
      supplierDistribution: [
        { name: 'Manufacturer', value: 45 },
        { name: 'Distributor', value: 30 },
        { name: 'Service Provider', value: 15 },
        { name: 'Retailer', value: 10 }
      ],
      logisticsPerformance: months.map((month, i) => ({
        month,
        shipments: 30 + Math.floor(Math.random() * 50),
        onTimePercentage: 85 + Math.floor(Math.random() * 10)
      })),
      requisitionStatus: [
        { name: 'Draft', value: 25 },
        { name: 'Pending', value: 18 },
        { name: 'Approved', value: 42 },
        { name: 'Rejected', value: 8 },
        { name: 'Cancelled', value: 7 }
      ],
      spendAnalysis: months.map((month, i) => ({
        month,
        spend: 150000 + Math.floor(Math.random() * 100000),
        savings: 10000 + Math.floor(Math.random() * 20000)
      })),
      inventoryLevels: dates.map((date, i) => ({
        date,
        stock: 1000 + Math.floor(Math.random() * 200),
        reorderPoint: 800
      })),
      inventoryByCategory: [
        { name: 'Electronics', value: 450 },
        { name: 'Office Supplies', value: 320 },
        { name: 'Furniture', value: 120 },
        { name: 'IT Equipment', value: 280 }
      ],
      inventoryMovements: dates.map((date, i) => ({
        date,
        receipts: 10 + Math.floor(Math.random() * 20),
        issues: 8 + Math.floor(Math.random() * 15),
        adjustments: Math.floor(Math.random() * 5)
      })),
      supplierPerformance: [
        { name: 'Supplier A', quality: 85, delivery: 90, cost: 75 },
        { name: 'Supplier B', quality: 92, delivery: 85, cost: 88 },
        { name: 'Supplier C', quality: 78, delivery: 82, cost: 95 },
        { name: 'Supplier D', quality: 95, delivery: 91, cost: 79 },
        { name: 'Supplier E', quality: 88, delivery: 79, cost: 90 }
      ],
      shipmentStatus: [
        { name: 'Planned', value: 15 },
        { name: 'In Transit', value: 42 },
        { name: 'Delivered', value: 35 },
        { name: 'Exception', value: 8 }
      ],
      carrierPerformance: [
        { name: 'Carrier A', onTimePercentage: 94 },
        { name: 'Carrier B', onTimePercentage: 89 },
        { name: 'Carrier C', onTimePercentage: 92 },
        { name: 'Carrier D', onTimePercentage: 96 },
        { name: 'Carrier E', onTimePercentage: 91 }
      ],
      shipmentTrends: months.map((month, i) => ({
        month,
        shipments: 30 + Math.floor(Math.random() * 50),
        cost: 50000 + Math.floor(Math.random() * 20000)
      }))
    },
    recentActivity: [
      {
        id: '1',
        type: 'requisition',
        action: 'created',
        entityId: 'req-1',
        entityName: 'Office Supplies Request',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: { id: 'user-1', name: 'John Doe' }
      },
      {
        id: '2',
        type: 'purchase_order',
        action: 'approved',
        entityId: 'po-1',
        entityName: 'PO-2024-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        user: { id: 'user-2', name: 'Jane Smith' }
      },
      {
        id: '3',
        type: 'inventory',
        action: 'updated',
        entityId: 'item-1',
        entityName: 'Laptop Dell XPS 15',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        user: { id: 'user-3', name: 'Mike Johnson' }
      },
      {
        id: '4',
        type: 'shipment',
        action: 'completed',
        entityId: 'ship-1',
        entityName: 'SHP-2024-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        user: { id: 'user-4', name: 'Sarah Williams' }
      },
      {
        id: '5',
        type: 'supplier',
        action: 'created',
        entityId: 'sup-1',
        entityName: 'Acme Corporation',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        user: { id: 'user-1', name: 'John Doe' }
      }
    ],
    statusOverview: {
      healthy: 5,
      warnings: 2,
      critical: 0
    },
    alerts: [
      {
        id: '1',
        severity: 'warning',
        message: '5 purchase orders pending approval for more than 3 days',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        severity: 'warning',
        message: '3 items are below reorder point',
        timestamp: new Date().toISOString()
      }
    ],
    topSuppliers: [
      { id: 'sup-1', name: 'Acme Corporation', spend: 250000, orders: 45, onTimeDelivery: 92, qualityScore: 4.5 },
      { id: 'sup-2', name: 'Beta Inc', spend: 180000, orders: 32, onTimeDelivery: 88, qualityScore: 4.2 },
      { id: 'sup-3', name: 'Gamma LLC', spend: 150000, orders: 28, onTimeDelivery: 95, qualityScore: 4.7 },
      { id: 'sup-4', name: 'Delta Co', spend: 120000, orders: 25, onTimeDelivery: 91, qualityScore: 4.3 },
      { id: 'sup-5', name: 'Epsilon', spend: 100000, orders: 20, onTimeDelivery: 87, qualityScore: 4.0 }
    ]
  };
};

// Function to fetch dashboard data from Supabase
const fetchDashboardData = async (params: DashboardParams): Promise<DashboardData> => {
  if (!isSupabaseConfigured()) {
    return generateMockDashboardData();
  }

  try {
    // In a real implementation, you would fetch data from Supabase tables
    // For now, we'll use the mock data
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .gte('timestamp', params.startDate)
      .lte('timestamp', params.endDate)
      .single();

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return generateMockDashboardData();
    }

    if (!data) {
      return generateMockDashboardData();
    }

    // Transform the data from Supabase to match our DashboardData interface
    // This would be implemented based on your actual database schema
    return generateMockDashboardData();
  } catch (error) {
    console.error('Error in dashboard data fetch:', error);
    return generateMockDashboardData();
  }
};

export function useDashboardData(params: DashboardParams) {
  return useQuery({
    queryKey: ['dashboardData', params],
    queryFn: () => fetchDashboardData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}