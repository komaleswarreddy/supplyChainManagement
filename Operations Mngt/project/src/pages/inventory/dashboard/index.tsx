import React from 'react';
import { InventoryMetricsChart } from './components/inventory-metrics-chart';
import { InventoryValueCard } from './components/inventory-value-card';
import { InventoryTurnoverCard } from './components/inventory-turnover-card';
import { StockAccuracyCard } from './components/stock-accuracy-card';
import { DeadStockCard } from './components/dead-stock-card';
import { InventoryAlerts } from './components/inventory-alerts';
import { StockLevelTable } from './components/stock-level-table';
import { RecentMovementsTable } from './components/recent-movements-table';
import { InventoryStatusChart } from './components/inventory-status-chart';
import { Button } from '@/components/ui/button';
import { Download, Filter, RefreshCw } from 'lucide-react';

export function InventoryDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryValueCard />
        <InventoryTurnoverCard />
        <StockAccuracyCard />
        <DeadStockCard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InventoryMetricsChart />
        <InventoryStatusChart />
      </div>

      <InventoryAlerts />
      <StockLevelTable />
      <RecentMovementsTable />
    </div>
  );
}

export default InventoryDashboard;