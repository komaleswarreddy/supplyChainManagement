import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import Register from '@/pages/register';
import NotFound from '@/pages/not-found';
import Unauthorized from '@/pages/unauthorized';

// Inventory Management
import InventoryDashboard from '@/pages/inventory/dashboard';
import InventoryStock from '@/pages/inventory/stock';
import { StockDetail } from '@/pages/inventory/stock/stock-detail';
import InventoryMovements from '@/pages/inventory/movements';
import InventoryAdjustments from '@/pages/inventory/adjustments';
import InventoryBarcode from '@/pages/inventory/barcode';
import InventoryBatchTracking from '@/pages/inventory/batch-tracking';
import InventoryReservation from '@/pages/inventory/reservation';
import { ReservationDetail } from '@/pages/inventory/reservation/reservation-detail';
import InventoryValuation from '@/pages/inventory/valuation';
import InventoryOptimization from '@/pages/inventory/optimization';
import InventoryAuditTrail from '@/pages/inventory/audit-trail';

// Catalog Management
import CatalogDashboard from '@/pages/catalog';
import CatalogCategories from '@/pages/catalog/categories';
import CreateCategory from '@/pages/catalog/categories/create-category';
import EditCategory from '@/pages/catalog/categories/edit-category';
import CategoryDetail from '@/pages/catalog/categories/category-detail';
import CatalogAttributes from '@/pages/catalog/attributes';
import CreateAttribute from '@/pages/catalog/attributes/create-attribute';
import EditAttribute from '@/pages/catalog/attributes/edit-attribute';
import AttributeDetail from '@/pages/catalog/attributes/attribute-detail';
import CatalogProducts from '@/pages/catalog/products';
import CreateProduct from '@/pages/catalog/products/create-product';
import EditProduct from '@/pages/catalog/products/edit-product';
import ProductDetail from '@/pages/catalog/products/product-detail';
import ProductVariants from '@/pages/catalog/products/variants';
import CreateVariant from '@/pages/catalog/products/create-variant';
import EditVariant from '@/pages/catalog/products/edit-variant';
import VariantDetail from '@/pages/catalog/products/variant-detail';
import CatalogImport from '@/pages/catalog/import';
import CatalogExport from '@/pages/catalog/export';

// Procurement Management
import ProcurementDashboard from '@/pages/procurement/dashboard';
import Requisitions from '@/pages/procurement/requisitions';
import { NewRequisitionForm } from '@/pages/procurement/requisitions/new-requisition-form';
import { EditRequisition } from '@/pages/procurement/requisitions/edit-requisition';
import { RequisitionDetail } from '@/pages/procurement/requisitions/requisition-detail';
import PurchaseOrders from '@/pages/procurement/purchase-orders';
import { NewPurchaseOrderForm } from '@/pages/procurement/purchase-orders/new-purchase-order-form';
import { EditPurchaseOrder } from '@/pages/procurement/purchase-orders/edit-purchase-order';
import PurchaseOrderDetail from '@/pages/procurement/purchase-orders/purchase-order-detail';
import RFX from '@/pages/procurement/rfx';
import { CreateRfx } from '@/pages/procurement/rfx/create-rfx';
import { EditRfx } from '@/pages/procurement/rfx/edit-rfx';
import RfxDetail from '@/pages/procurement/rfx/rfx-detail';
import Contracts from '@/pages/procurement/contracts';
import { CreateContract } from '@/pages/procurement/contracts/create-contract';
import { EditContract } from '@/pages/procurement/contracts/edit-contract';
import ContractDetail from '@/pages/procurement/contracts/contract-detail';

// Financial Management
import FinancialDashboard from '@/pages/finance';
import CostCenters from '@/pages/finance/cost-centers';
import Budgets from '@/pages/finance/budgets';
import GLAccounts from '@/pages/finance/gl-accounts/index';
import GLTransactions from '@/pages/finance/gl-transactions';
import FinancialReports from '@/pages/finance/reports';

// Warehouse Management
import WarehouseDashboard from '@/pages/warehouse';
import Warehouses from '@/pages/warehouse/warehouses';
import WarehouseTasks from '@/pages/warehouse/tasks';
import CycleCounts from '@/pages/warehouse/cycle-counts';
import PickPaths from '@/pages/warehouse/pick-paths';
import WarehouseEquipment from '@/pages/warehouse/equipment';

// Contract Management
import ContractManagementDashboard from '@/pages/contracts';
import ContractManagement from '@/pages/contracts/contracts';
import ContractTemplates from '@/pages/contracts/templates';
import ContractCompliance from '@/pages/contracts/compliance';

// Supplier Management
import SupplierDashboard from '@/pages/suppliers/dashboard';
import SupplierList from '@/pages/suppliers';
import SupplierCreate from '@/pages/suppliers/create-supplier';
import SupplierEdit from '@/pages/suppliers/edit-supplier';
import SupplierDetail from '@/pages/suppliers/supplier-detail';
import SupplierFinancialHealth from '@/pages/suppliers/financial-health';
import CreateFinancialHealth from '@/pages/suppliers/financial-health/create-financial-health';
import SupplierQualityManagement from '@/pages/suppliers/quality-management';
import CreateQualityRecord from '@/pages/suppliers/quality-management/create-quality-record';
import SupplierRiskAssessment from '@/pages/suppliers/risk-assessment';
import CreateRiskAssessment from '@/pages/suppliers/risk-assessment/create-assessment';
import SupplierSustainability from '@/pages/suppliers/sustainability';
import CreateSustainability from '@/pages/suppliers/sustainability/create-sustainability';

// Transportation Management
import Carriers from '@/pages/transportation/carriers';
import TransportationShipments from '@/pages/transportation/shipments';
import Loads from '@/pages/transportation/loads';
import Documents from '@/pages/transportation/documents';
import Invoices from '@/pages/transportation/invoices';
import CarrierSelection from '@/pages/transportation/carrier-selection';

// Quality Management
import QualityDashboard from '@/pages/quality/dashboard';
import QualityControlPlans from '@/pages/quality/control-plans';
import QualityInspections from '@/pages/quality/inspections';
import QualityNonConformances from '@/pages/quality/non-conformances';
import QualityCorrectiveActions from '@/pages/quality/corrective-actions';
import QualityStandards from '@/pages/quality/standards';
import QualityAudits from '@/pages/quality/audits';
import QualityMetrics from '@/pages/quality/metrics';

// Order Management
import OrderDashboardPage from '@/pages/orders/dashboard';
import Customers from '@/pages/orders/customers';
import CreateCustomer from '@/pages/orders/create-customer';
import EditCustomer from '@/pages/orders/edit-customer';
import CustomerDetail from '@/pages/orders/customer-detail';
import Orders from '@/pages/orders/orders';
import CreateOrder from '@/pages/orders/create-order';
import EditOrder from '@/pages/orders/edit-order';
import OrderDetail from '@/pages/orders/order-detail';
import Fulfillments from '@/pages/orders/fulfillments';
import CreateFulfillment from '@/pages/orders/create-fulfillment';
import EditFulfillment from '@/pages/orders/edit-fulfillment';
import FulfillmentDetail from '@/pages/orders/fulfillment-detail';
import OrderShipments from '@/pages/orders/shipments';
import CreateShipment from '@/pages/orders/create-shipment';
import EditShipment from '@/pages/orders/edit-shipment';
import ShipmentDetail from '@/pages/orders/shipment-detail';
import Returns from '@/pages/orders/returns';
import CreateReturn from '@/pages/orders/create-return';
import EditReturn from '@/pages/orders/edit-return';
import ReturnDetail from '@/pages/orders/return-detail';
import Payments from '@/pages/orders/payments';
import CreatePayment from '@/pages/orders/create-payment';
import EditPayment from '@/pages/orders/edit-payment';
import PaymentDetail from '@/pages/orders/payment-detail';
import OrderAnalytics from '@/pages/orders/analytics';
import OrderServiceAppointmentsPage from '@/pages/orders/service-appointments';

// User Management
import Users from '@/pages/users';
import UserCreate from '@/pages/users/create-user';
import UserDetail from '@/pages/users/user-detail';

// Tenant Management
import Tenants from '@/pages/tenants';
import TenantNew from '@/pages/tenants/new';
import TenantSettings from '@/pages/tenants/[id]/settings';
import TenantUsers from '@/pages/tenants/[id]/users';

// Settings
import Settings from '@/pages/settings';
import WorkflowDesigner from '@/pages/settings/workflow-designer';

// Analytics
import AnalyticsDashboard from '@/pages/analytics';
import AdvancedDashboard from '@/pages/analytics/advanced-dashboard';
import CustomReports from '@/pages/analytics/custom-reports';
import KnowledgeGraph from '@/pages/analytics/knowledge-graph';

// Integrations
import APIGateway from '@/pages/integrations/api-gateway';
import BusinessRulesEngine from '@/pages/integrations/business-rules-engine';
import IntegrationFramework from '@/pages/integrations/integration-framework';

// Mobile
import MobileDashboard from '@/pages/mobile/mobile-dashboard';

// Settings
import FormDesigner from '@/pages/settings/form-designer';

// Automation
import RPABuilder from '@/pages/automation/rpa-builder';
import AppointmentsPage from '@/pages/appointments';
import MenuManagementPage from '@/pages/menu-management';

// Supply Chain Management
import SupplyChainForecasting from '@/pages/supply-chain/forecasting';
import { CreateForecast } from '@/pages/supply-chain/forecasting/create-forecast';
import { EditForecast } from '@/pages/supply-chain/forecasting/edit-forecast';
import { ForecastDetail } from '@/pages/supply-chain/forecasting/forecast-detail';
import SupplyChainPlanning from '@/pages/supply-chain/planning';
import SupplyChainInventoryOptimization from '@/pages/supply-chain/inventory-optimization';

export const AppRouter = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Inventory Management
      {
        path: 'inventory',
        children: [
          { index: true, element: <InventoryDashboard /> },
          { path: 'stock', element: <InventoryStock /> },
          { path: 'stock/:id', element: <StockDetail /> },
          { path: 'movements', element: <InventoryMovements /> },
          { path: 'adjustments', element: <InventoryAdjustments /> },
          { path: 'barcode', element: <InventoryBarcode /> },
          { path: 'batch-tracking', element: <InventoryBatchTracking /> },
          { path: 'reservation', element: <InventoryReservation /> },
          { path: 'reservation/:id', element: <ReservationDetail /> },
          { path: 'valuation', element: <InventoryValuation /> },
          { path: 'optimization', element: <InventoryOptimization /> },
          { path: 'audit-trail', element: <InventoryAuditTrail /> },
        ],
      },
      // Catalog Management
      {
        path: 'catalog',
        children: [
          { index: true, element: <CatalogDashboard /> },
          { path: 'categories', element: <CatalogCategories /> },
          { path: 'categories/create', element: <CreateCategory /> },
          { path: 'categories/:id/edit', element: <EditCategory /> },
          { path: 'categories/:id', element: <CategoryDetail /> },
          { path: 'attributes', element: <CatalogAttributes /> },
          { path: 'attributes/create', element: <CreateAttribute /> },
          { path: 'attributes/:id/edit', element: <EditAttribute /> },
          { path: 'attributes/:id', element: <AttributeDetail /> },
          { path: 'products', element: <CatalogProducts /> },
          { path: 'products/create', element: <CreateProduct /> },
          { path: 'products/:id/edit', element: <EditProduct /> },
          { path: 'products/:id', element: <ProductDetail /> },
          { path: 'products/:id/variants', element: <ProductVariants /> },
          { path: 'products/:id/variants/create', element: <CreateVariant /> },
          { path: 'products/:id/variants/:variantId/edit', element: <EditVariant /> },
          { path: 'products/:id/variants/:variantId', element: <VariantDetail /> },
          { path: 'import', element: <CatalogImport /> },
          { path: 'export', element: <CatalogExport /> },
        ],
      },
      // Procurement Management
      {
        path: 'procurement',
        children: [
          { index: true, element: <ProcurementDashboard /> },
          { path: 'requisitions', element: <Requisitions /> },
          { path: 'requisitions/new', element: <NewRequisitionForm /> },
          { path: 'requisitions/create', element: <NewRequisitionForm /> },
          { path: 'requisitions/:requisitionId', element: <RequisitionDetail /> },
          { path: 'requisitions/:requisitionId/edit', element: <EditRequisition /> },
          { path: 'purchase-orders', element: <PurchaseOrders /> },
          { path: 'purchase-orders/new', element: <NewPurchaseOrderForm /> },
          { path: 'purchase-orders/create', element: <NewPurchaseOrderForm /> },
          { path: 'purchase-orders/:purchaseOrderId', element: <PurchaseOrderDetail /> },
          { path: 'purchase-orders/:purchaseOrderId/edit', element: <EditPurchaseOrder /> },
          { path: 'rfx', element: <RFX /> },
          { path: 'rfx/new', element: <CreateRfx /> },
          { path: 'rfx/create', element: <CreateRfx /> },
          { path: 'rfx/:rfxId', element: <RfxDetail /> },
          { path: 'rfx/:rfxId/edit', element: <EditRfx /> },
          { path: 'contracts', element: <Contracts /> },
          { path: 'contracts/new', element: <CreateContract /> },
          { path: 'contracts/create', element: <CreateContract /> },
          { path: 'contracts/:contractId', element: <ContractDetail /> },
          { path: 'contracts/:contractId/edit', element: <EditContract /> },
        ],
      },
      // Financial Management
      {
        path: 'finance',
        children: [
          { index: true, element: <FinancialDashboard /> },
          { path: 'cost-centers', element: <CostCenters /> },
          { path: 'cost-centers/new', element: <CostCenters /> },
          { path: 'cost-centers/:id', element: <CostCenters /> },
          { path: 'cost-centers/:id/edit', element: <CostCenters /> },
          { path: 'budgets', element: <Budgets /> },
          { path: 'budgets/new', element: <Budgets /> },
          { path: 'budgets/:id', element: <Budgets /> },
          { path: 'budgets/:id/edit', element: <Budgets /> },
          { path: 'gl-accounts', element: <GLAccounts /> },
          { path: 'gl-accounts/new', element: <GLAccounts /> },
          { path: 'gl-accounts/:id', element: <GLAccounts /> },
          { path: 'gl-accounts/:id/edit', element: <GLAccounts /> },
          { path: 'gl-transactions', element: <GLTransactions /> },
          { path: 'gl-transactions/new', element: <GLTransactions /> },
          { path: 'gl-transactions/:id', element: <GLTransactions /> },
          { path: 'gl-transactions/:id/edit', element: <GLTransactions /> },
          { path: 'reports', element: <FinancialReports /> },
          { path: 'reports/new', element: <FinancialReports /> },
          { path: 'reports/:id', element: <FinancialReports /> },
        ],
      },
      // Warehouse Management
      {
        path: 'warehouse',
        children: [
          { index: true, element: <WarehouseDashboard /> },
          { path: 'warehouses', element: <Warehouses /> },
          { path: 'warehouses/new', element: <Warehouses /> },
          { path: 'warehouses/:id', element: <Warehouses /> },
          { path: 'warehouses/:id/edit', element: <Warehouses /> },
          { path: 'tasks', element: <WarehouseTasks /> },
          { path: 'tasks/new', element: <WarehouseTasks /> },
          { path: 'tasks/:id', element: <WarehouseTasks /> },
          { path: 'tasks/:id/edit', element: <WarehouseTasks /> },
          { path: 'cycle-counts', element: <CycleCounts /> },
          { path: 'cycle-counts/new', element: <CycleCounts /> },
          { path: 'cycle-counts/:id', element: <CycleCounts /> },
          { path: 'cycle-counts/:id/edit', element: <CycleCounts /> },
          { path: 'pick-paths', element: <PickPaths /> },
          { path: 'pick-paths/new', element: <PickPaths /> },
          { path: 'pick-paths/:id', element: <PickPaths /> },
          { path: 'pick-paths/:id/edit', element: <PickPaths /> },
          { path: 'equipment', element: <WarehouseEquipment /> },
          { path: 'equipment/new', element: <WarehouseEquipment /> },
          { path: 'equipment/:id', element: <WarehouseEquipment /> },
          { path: 'equipment/:id/edit', element: <WarehouseEquipment /> },
        ],
      },
      // Contract Management
      {
        path: 'contracts',
        children: [
          { index: true, element: <ContractManagementDashboard /> },
          { path: 'contracts', element: <ContractManagement /> },
          { path: 'contracts/new', element: <ContractManagement /> },
          { path: 'contracts/:id', element: <ContractManagement /> },
          { path: 'contracts/:id/edit', element: <ContractManagement /> },
          { path: 'templates', element: <ContractTemplates /> },
          { path: 'templates/new', element: <ContractTemplates /> },
          { path: 'templates/:id', element: <ContractTemplates /> },
          { path: 'templates/:id/edit', element: <ContractTemplates /> },
          { path: 'compliance', element: <ContractCompliance /> },
          { path: 'compliance/:id', element: <ContractCompliance /> },
        ],
      },
      // Supplier Management
      {
        path: 'suppliers',
        children: [
          { index: true, element: <SupplierDashboard /> },
          { path: 'list', element: <SupplierList /> },
          { path: 'create', element: <SupplierCreate /> },
          { path: 'new', element: <SupplierCreate /> },
          { path: ':id/edit', element: <SupplierEdit /> },
          { path: ':id', element: <SupplierDetail /> },
          { path: 'financial-health', element: <SupplierFinancialHealth /> },
          { path: 'financial-health/create', element: <CreateFinancialHealth /> },
          { path: 'quality-management', element: <SupplierQualityManagement /> },
          { path: 'quality-management/create', element: <CreateQualityRecord /> },
          { path: 'risk-assessment', element: <SupplierRiskAssessment /> },
          { path: 'risk-assessment/create', element: <CreateRiskAssessment /> },
          { path: 'sustainability', element: <SupplierSustainability /> },
          { path: 'sustainability/create', element: <CreateSustainability /> },
        ],
      },
      // Transportation Management
      {
        path: 'transportation',
        children: [
          { path: 'carriers', element: <Carriers /> },
          { path: 'shipments', element: <TransportationShipments /> },
          { path: 'loads', element: <Loads /> },
          { path: 'documents', element: <Documents /> },
          { path: 'invoices', element: <Invoices /> },
          { path: 'carrier-selection', element: <CarrierSelection /> },
        ],
      },
      // Quality Management
      {
        path: 'quality',
        children: [
          { index: true, element: <QualityDashboard /> },
          { path: 'control-plans', element: <QualityControlPlans /> },
          { path: 'inspections', element: <QualityInspections /> },
          { path: 'non-conformances', element: <QualityNonConformances /> },
          { path: 'corrective-actions', element: <QualityCorrectiveActions /> },
          { path: 'standards', element: <QualityStandards /> },
          { path: 'audits', element: <QualityAudits /> },
          { path: 'metrics', element: <QualityMetrics /> },
        ],
      },
      // Order Management - Comprehensive routing
      {
        path: 'orders',
        children: [
          { index: true, element: <OrderDashboardPage /> },
          { path: 'dashboard', element: <OrderDashboardPage /> },
          { path: 'list', element: <Orders /> },
          { path: 'orders', element: <Orders /> },
          { path: 'create', element: <CreateOrder /> },
          { path: ':orderId([0-9a-fA-F-]{36})', element: <OrderDetail /> },
          { path: ':orderId([0-9a-fA-F-]{36})/edit', element: <EditOrder /> },
          // Customer management
          { path: 'customers', element: <Customers /> },
          { path: 'customers/create', element: <CreateCustomer /> },
          { path: 'customers/:customerId', element: <CustomerDetail /> },
          { path: 'customers/:customerId/edit', element: <EditCustomer /> },
          // Fulfillment management
          { path: 'fulfillments', element: <Fulfillments /> },
          { path: 'fulfillments/create', element: <CreateFulfillment /> },
          { path: 'fulfillments/:fulfillmentId', element: <FulfillmentDetail /> },
          { path: 'fulfillments/:fulfillmentId/edit', element: <EditFulfillment /> },
          // Shipment management
          { path: 'shipments', element: <OrderShipments /> },
          { path: 'shipments/create', element: <CreateShipment /> },
          { path: 'shipments/:shipmentId', element: <ShipmentDetail /> },
          { path: 'shipments/:shipmentId/edit', element: <EditShipment /> },
          // Returns management
          { path: 'returns', element: <Returns /> },
          { path: 'returns/create', element: <CreateReturn /> },
          { path: 'returns/:returnId', element: <ReturnDetail /> },
          { path: 'returns/:returnId/edit', element: <EditReturn /> },
          // Payments management
          { path: 'payments', element: <Payments /> },
          { path: 'payments/create', element: <CreatePayment /> },
          { path: 'payments/:paymentId', element: <PaymentDetail /> },
          { path: 'payments/:paymentId/edit', element: <EditPayment /> },
          // Analytics
          { path: 'analytics', element: <OrderAnalytics /> },
          { path: ':id/service-appointments', element: <OrderServiceAppointmentsPage /> },
        ],
      },
      // User Management
      {
        path: 'users',
        children: [
          { index: true, element: <Users /> },
          { path: 'create', element: <UserCreate /> },
          { path: ':id', element: <UserDetail /> },
        ],
      },
      // Tenant Management
      {
        path: 'tenants',
        children: [
          { index: true, element: <Tenants /> },
          { path: 'new', element: <TenantNew /> },
          { path: ':id/settings', element: <TenantSettings /> },
          { path: ':id/users', element: <TenantUsers /> },
        ],
      },
      // Settings
      {
        path: 'settings',
        children: [
          { index: true, element: <Settings /> },
          { path: 'workflow-designer', element: <WorkflowDesigner /> },
          { path: 'form-designer', element: <FormDesigner /> },
        ],
      },
      // Analytics
      {
        path: 'analytics',
        children: [
          { index: true, element: <AnalyticsDashboard /> },
          { path: 'advanced', element: <AdvancedDashboard /> },
          { path: 'custom-reports', element: <CustomReports /> },
          { path: 'knowledge-graph', element: <KnowledgeGraph /> },
        ],
      },
      // Integrations
      {
        path: 'integrations',
        children: [
          { path: 'api-gateway', element: <APIGateway /> },
          { path: 'business-rules-engine', element: <BusinessRulesEngine /> },
          { path: 'integration-framework', element: <IntegrationFramework /> },
        ],
      },
      // Mobile
      {
        path: 'mobile',
        children: [
          { index: true, element: <MobileDashboard /> },
          { path: 'dashboard', element: <MobileDashboard /> },
        ],
      },
      // Automation
      {
        path: 'automation',
        children: [
          { path: 'rpa-builder', element: <RPABuilder /> },
        ],
      },
      // Appointment Management
      {
        path: 'appointments',
        children: [
          { index: true, element: <AppointmentsPage /> },
          { path: 'new', element: <div>Create Appointment</div> },
          { path: ':id', element: <div>Appointment Details</div> },
          { path: ':id/edit', element: <div>Edit Appointment</div> },
        ],
      },

      // Menu Management
      {
        path: 'menu-management',
        children: [
          { index: true, element: <MenuManagementPage /> },
          { path: 'new', element: <div>Create Menu Item</div> },
          { path: ':id', element: <div>Menu Item Details</div> },
          { path: ':id/edit', element: <div>Edit Menu Item</div> },
          { path: 'categories', element: <div>Menu Categories</div> },
          { path: 'collections', element: <div>Menu Collections</div> },
        ],
      },
      // Supply Chain Management
      {
        path: 'supply-chain',
        children: [
          { path: 'forecasting', element: <SupplyChainForecasting /> },
          { path: 'forecasting/create', element: <CreateForecast /> },
          { path: 'forecasting/:id', element: <ForecastDetail /> },
          { path: 'forecasting/:id/edit', element: <EditForecast /> },
          { path: 'planning', element: <SupplyChainPlanning /> },
          { path: 'inventory-optimization', element: <SupplyChainInventoryOptimization /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);