import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, LayoutDashboard, Package, ArrowRightLeft, Settings, Scale, ShoppingCart, 
  Users, Contact as FileContract, FileSearch, LineChart, BarChart4, Calculator, 
  Layers, Warehouse, ClipboardList, Map, Truck, Ship, FileCheck, DollarSign, 
  Receipt, Building2, QrCode, BookMarked, History, ChevronLeft, ChevronRight, Menu,
  AlertTriangle, Leaf, CheckCircle, Shield, Eye, ClipboardCheck, UserCheck, 
  ShoppingBag, CreditCard, RotateCcw, TrendingUp, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const NavItem = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
        isActive(to) 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-accent text-foreground/80 hover:text-foreground",
        collapsed && !mobileOpen && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {(!collapsed || mobileOpen) && <span className="truncate">{children}</span>}
    </Link>
  );

  const NavSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="pt-4">
      {(!collapsed || mobileOpen) && (
        <h3 className="px-4 text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <div className="mt-2 space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r transition-all duration-300 ease-in-out z-40",
          collapsed && !mobileOpen ? "w-16" : "w-64",
          mobileOpen 
            ? "fixed inset-y-0 left-0 z-50" 
            : "hidden lg:block",
          "h-[calc(100vh-4rem)]"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4">
            {(!collapsed || mobileOpen) && (
              <span className="text-lg font-semibold">PLS-SCM</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>

            {/* Procurement Section */}
            <NavSection title="Procurement">
              <NavItem to="/procurement/requisitions" icon={FileText}>Requisitions</NavItem>
              <NavItem to="/procurement/purchase-orders" icon={ShoppingCart}>Purchase Orders</NavItem>
              <NavItem to="/procurement/rfx" icon={FileSearch}>RFx Management</NavItem>
              <NavItem to="/procurement/contracts" icon={FileContract}>Contracts</NavItem>
            </NavSection>

            {/* Suppliers Section */}
            <NavSection title="Suppliers">
              <NavItem to="/suppliers" icon={Building2}>Suppliers</NavItem>
              <NavItem to="/suppliers/performance" icon={BarChart4}>Performance</NavItem>
              <NavItem to="/suppliers/risk-assessment" icon={AlertTriangle}>Risk Assessment</NavItem>
              <NavItem to="/suppliers/financial-health" icon={DollarSign}>Financial Health</NavItem>
              <NavItem to="/suppliers/sustainability" icon={Leaf}>Sustainability</NavItem>
            </NavSection>

            {/* Quality Management Section */}
            <NavSection title="Quality Management">
              <NavItem to="/quality/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
              <NavItem to="/quality/control-plans" icon={Shield}>Control Plans</NavItem>
              <NavItem to="/quality/inspections" icon={Eye}>Inspections</NavItem>
              <NavItem to="/quality/non-conformances" icon={AlertTriangle}>Non-Conformances</NavItem>
              <NavItem to="/quality/corrective-actions" icon={ClipboardCheck}>Corrective Actions</NavItem>
              <NavItem to="/quality/standards" icon={CheckCircle}>Quality Standards</NavItem>
              <NavItem to="/quality/audits" icon={UserCheck}>Audits</NavItem>
              <NavItem to="/quality/metrics" icon={TrendingUp}>Metrics & Analytics</NavItem>
            </NavSection>

            {/* Order Management Section */}
            <NavSection title="Order Management">
              <NavItem to="/orders/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
              <NavItem to="/orders/customers" icon={UserCheck}>Customers</NavItem>
              <NavItem to="/orders/orders" icon={ShoppingBag}>Orders</NavItem>
              <NavItem to="/orders/fulfillments" icon={ClipboardList}>Fulfillments</NavItem>
              <NavItem to="/orders/shipments" icon={Truck}>Shipments</NavItem>
              <NavItem to="/orders/returns" icon={RotateCcw}>Returns</NavItem>
              <NavItem to="/orders/payments" icon={CreditCard}>Payments</NavItem>
              <NavItem to="/orders/analytics" icon={BarChart4}>Analytics</NavItem>
            </NavSection>

            {/* Supply Chain Section */}
            <NavSection title="Supply Chain">
              <NavItem to="/supply-chain/forecasting" icon={LineChart}>Demand Forecasting</NavItem>
              <NavItem to="/inventory/optimization/safety-stock" icon={Calculator}>Safety Stock</NavItem>
              <NavItem to="/inventory/optimization/reorder-points" icon={BarChart4}>Reorder Points</NavItem>
              <NavItem to="/inventory/optimization/classification" icon={Layers}>ABC/XYZ Analysis</NavItem>
            </NavSection>

            {/* Logistics Section */}
            <NavSection title="Logistics">
              <NavItem to="/logistics/warehouses" icon={Warehouse}>Warehouses</NavItem>
              <NavItem to="/logistics/tasks" icon={ClipboardList}>Tasks</NavItem>
              <NavItem to="/logistics/pick-paths" icon={Map}>Pick Paths</NavItem>
              <NavItem to="/logistics/cycle-counts" icon={ClipboardList}>Cycle Counts</NavItem>
              <NavItem to="/transportation/shipments" icon={Truck}>Shipments</NavItem>
              <NavItem to="/transportation/carriers" icon={Ship}>Carriers</NavItem>
              <NavItem to="/transportation/loads" icon={Package}>Load Planning</NavItem>
              <NavItem to="/transportation/documents" icon={FileCheck}>Shipping Documents</NavItem>
              <NavItem to="/transportation/invoices" icon={DollarSign}>Freight Audit</NavItem>
            </NavSection>

            {/* Accounts Payable Section */}
            <NavSection title="Accounts Payable">
              <NavItem to="/invoices/dashboard" icon={LayoutDashboard}>AP Dashboard</NavItem>
              <NavItem to="/invoices" icon={Receipt}>Vendor Invoices</NavItem>
              <NavItem to="/invoices/capture" icon={FileText}>Invoice Capture</NavItem>
            </NavSection>

            {/* Tax Compliance Section */}
            <NavSection title="Tax Compliance">
              <NavItem to="/tax-compliance/tax-determination" icon={Calculator}>Tax Determination</NavItem>
              <NavItem to="/tax-compliance/tax-reports" icon={FileText}>Tax Reports</NavItem>
              <NavItem to="/tax-compliance/tax-documents" icon={FileCheck}>Supplier Tax Documents</NavItem>
            </NavSection>

            {/* Inventory Section */}
            <NavSection title="Inventory">
              <NavItem to="/inventory/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
              <NavItem to="/inventory/stock" icon={Package}>Stock</NavItem>
              <NavItem to="/inventory/movements" icon={ArrowRightLeft}>Movements</NavItem>
              <NavItem to="/inventory/adjustments" icon={Scale}>Adjustments</NavItem>
              <NavItem to="/inventory/batch-tracking" icon={Layers}>Batch/Lot Tracking</NavItem>
              <NavItem to="/inventory/barcode" icon={QrCode}>Barcode Management</NavItem>
              <NavItem to="/inventory/reservation" icon={BookMarked}>Reservations</NavItem>
              <NavItem to="/inventory/valuation" icon={DollarSign}>Valuation</NavItem>
              <NavItem to="/inventory/audit-trail" icon={History}>Audit Trail</NavItem>
            </NavSection>

            {/* Catalog Section */}
            <NavSection title="Catalog">
              <NavItem to="/catalog" icon={Package}>Products</NavItem>
              <NavItem to="/catalog/categories" icon={Tag}>Categories</NavItem>
              <NavItem to="/catalog/attributes" icon={Settings}>Attributes</NavItem>
            </NavSection>

            {/* Administration Section */}
            <NavSection title="Administration">
              <NavItem to="/users" icon={Users}>Users</NavItem>
              <NavItem to="/settings" icon={Settings}>Settings</NavItem>
            </NavSection>
          </nav>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;