-- Financial Management Tables
-- Cost Centers
CREATE TABLE cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('DEPARTMENT', 'PROJECT', 'LOCATION', 'PRODUCT', 'SERVICE')),
    parent_id UUID REFERENCES cost_centers(id),
    manager_id UUID REFERENCES users(id),
    location_id TEXT,
    budget JSONB NOT NULL DEFAULT '{"annual": 0, "monthly": 0, "spent": 0, "remaining": 0}',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    effective_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('OPERATIONAL', 'CAPITAL', 'PROJECT', 'DEPARTMENT', 'COST_CENTER')),
    category TEXT NOT NULL,
    fiscal_year TEXT NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
    total_budget NUMERIC(15,2) NOT NULL,
    allocated_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
    actual_spent NUMERIC(15,2) NOT NULL DEFAULT 0,
    committed_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    remaining_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
    variance NUMERIC(15,2) NOT NULL DEFAULT 0,
    variance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED', 'ACTIVE', 'CLOSED', 'OVER_BUDGET')),
    owner_id UUID NOT NULL REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Budget Periods
CREATE TABLE budget_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    budgeted_amount NUMERIC(15,2) NOT NULL,
    actual_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    variance NUMERIC(15,2) NOT NULL DEFAULT 0,
    variance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'OVER_BUDGET')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- General Ledger Accounts
CREATE TABLE gl_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    category TEXT NOT NULL,
    parent_account_id UUID REFERENCES gl_accounts(id),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    allow_posting BOOLEAN NOT NULL DEFAULT true,
    default_cost_center_id UUID REFERENCES cost_centers(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- General Ledger Transactions
CREATE TABLE gl_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    transaction_number TEXT NOT NULL,
    transaction_date TIMESTAMPTZ NOT NULL,
    posting_date TIMESTAMPTZ NOT NULL,
    reference TEXT,
    description TEXT NOT NULL,
    source_module TEXT NOT NULL,
    source_record_id TEXT,
    status TEXT NOT NULL DEFAULT 'POSTED' CHECK (status IN ('DRAFT', 'POSTED', 'VOIDED')),
    total_debit NUMERIC(15,2) NOT NULL,
    total_credit NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    exchange_rate NUMERIC(10,6) DEFAULT 1,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- General Ledger Transaction Lines
CREATE TABLE gl_transaction_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    transaction_id UUID NOT NULL REFERENCES gl_transactions(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id UUID NOT NULL REFERENCES gl_accounts(id),
    cost_center_id UUID REFERENCES cost_centers(id),
    debit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    credit_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    description TEXT,
    reference TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Reports
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'BUDGET_VARIANCE', 'CUSTOM')),
    period TEXT NOT NULL CHECK (period IN ('MONTHLY', 'QUARTERLY', 'ANNUAL')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED')),
    data JSONB NOT NULL,
    filters JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Financial Report Templates
CREATE TABLE financial_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PROFIT_LOSS', 'BALANCE_SHEET', 'CASH_FLOW', 'BUDGET_VARIANCE', 'CUSTOM')),
    template JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Management Tables
-- Warehouses
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('DISTRIBUTION', 'FULFILLMENT', 'MANUFACTURING', 'COLD_STORAGE')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'CLOSED')),
    address JSONB NOT NULL,
    contact_info JSONB NOT NULL,
    operating_hours JSONB NOT NULL,
    capacity JSONB NOT NULL,
    equipment JSONB,
    restrictions JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Zones
CREATE TABLE warehouse_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PICKING', 'STORAGE', 'RECEIVING', 'SHIPPING', 'CROSS_DOCK')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    capacity JSONB NOT NULL,
    restrictions JSONB,
    temperature JSONB,
    security JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Aisles
CREATE TABLE warehouse_aisles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('NARROW', 'WIDE', 'VERY_NARROW')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    dimensions JSONB NOT NULL,
    capacity JSONB NOT NULL,
    equipment JSONB,
    restrictions JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Racks
CREATE TABLE warehouse_racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    aisle_id UUID NOT NULL REFERENCES warehouse_aisles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PALLET_RACK', 'CARTON_FLOW', 'MEZZANINE', 'BULK_STORAGE')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    dimensions JSONB NOT NULL,
    capacity JSONB NOT NULL,
    equipment JSONB,
    restrictions JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Bins/Locations
CREATE TABLE warehouse_bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    zone_id UUID NOT NULL REFERENCES warehouse_zones(id) ON DELETE CASCADE,
    aisle_id UUID NOT NULL REFERENCES warehouse_aisles(id) ON DELETE CASCADE,
    rack_id UUID NOT NULL REFERENCES warehouse_racks(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PALLET', 'CARTON', 'BULK', 'PICK_FACE')),
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')),
    dimensions JSONB NOT NULL,
    capacity JSONB NOT NULL,
    current_inventory JSONB,
    restrictions JSONB,
    coordinates JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Tasks
CREATE TABLE warehouse_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    task_number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PICK', 'PUTAWAY', 'CYCLE_COUNT', 'REPLENISHMENT', 'TRANSFER')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_to UUID REFERENCES users(id),
    source_location JSONB,
    destination_location JSONB,
    items JSONB NOT NULL,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Cycle Counts
CREATE TABLE cycle_counts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    count_number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('ABC', 'RANDOM', 'LOCATION', 'ITEM')),
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_to UUID REFERENCES users(id),
    locations JSONB NOT NULL,
    items JSONB NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    variances JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Pick Paths
CREATE TABLE pick_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    path_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('SINGLE_ORDER', 'BATCH', 'ZONE', 'WAVE')),
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_to UUID REFERENCES users(id),
    orders JSONB NOT NULL,
    locations JSONB NOT NULL,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    distance NUMERIC(10,2),
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Warehouse Equipment
CREATE TABLE warehouse_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('FORKLIFT', 'PALLET_JACK', 'CONVEYOR', 'SCANNER', 'PRINTER')),
    model TEXT,
    manufacturer TEXT,
    serial_number TEXT,
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE')),
    location JSONB,
    specifications JSONB,
    maintenance_schedule JSONB,
    last_maintenance TIMESTAMPTZ,
    next_maintenance TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Management Tables
-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP')),
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'NEGOTIATION', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    value NUMERIC(15,2),
    currency TEXT NOT NULL DEFAULT 'USD',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    renewal_date TIMESTAMPTZ,
    auto_renewal BOOLEAN NOT NULL DEFAULT false,
    renewal_terms JSONB,
    owner_id UUID NOT NULL REFERENCES users(id),
    approver_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    counterparty JSONB NOT NULL,
    terms JSONB NOT NULL,
    attachments JSONB,
    risk_level TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    compliance_status TEXT NOT NULL DEFAULT 'COMPLIANT' CHECK (compliance_status IN ('COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW')),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Parties
CREATE TABLE contract_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    party_type TEXT NOT NULL CHECK (party_type IN ('PRIMARY', 'COUNTERPARTY', 'THIRD_PARTY', 'GUARANTOR')),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INDIVIDUAL', 'COMPANY', 'GOVERNMENT')),
    contact_info JSONB NOT NULL,
    address JSONB,
    tax_id TEXT,
    registration_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('BUYER', 'SELLER', 'SERVICE_PROVIDER', 'GUARANTOR')),
    signature JSONB,
    signed_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Terms
CREATE TABLE contract_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    subsection TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('GENERAL', 'PAYMENT', 'DELIVERY', 'WARRANTY', 'TERMINATION', 'COMPLIANCE')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    is_required BOOLEAN NOT NULL DEFAULT true,
    is_compliant BOOLEAN NOT NULL DEFAULT true,
    compliance_notes TEXT,
    effective_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Amendments
CREATE TABLE contract_amendments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    amendment_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('EXTENSION', 'MODIFICATION', 'TERMINATION', 'RENEWAL')),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    effective_date TIMESTAMPTZ NOT NULL,
    changes JSONB NOT NULL,
    reason TEXT NOT NULL,
    impact TEXT NOT NULL CHECK (impact IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    approver_id UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    attachments JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Obligations
CREATE TABLE contract_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    obligation_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('DELIVERY', 'PAYMENT', 'REPORTING', 'COMPLIANCE', 'PERFORMANCE')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    due_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    responsible_party TEXT NOT NULL CHECK (responsible_party IN ('US', 'COUNTERPARTY', 'BOTH')),
    value NUMERIC(15,2),
    currency TEXT NOT NULL DEFAULT 'USD',
    completion_criteria JSONB NOT NULL,
    attachments JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Milestones
CREATE TABLE contract_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    milestone_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('DELIVERY', 'PAYMENT', 'REVIEW', 'APPROVAL', 'COMPLETION')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED')),
    due_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id),
    completion_criteria JSONB NOT NULL,
    deliverables JSONB,
    attachments JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Compliance
CREATE TABLE contract_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    compliance_number TEXT NOT NULL,
    requirement TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('REGULATORY', 'CONTRACTUAL', 'INTERNAL', 'INDUSTRY')),
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLIANT', 'NON_COMPLIANT', 'EXEMPT')),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    due_date TIMESTAMPTZ NOT NULL,
    review_date TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    compliance_evidence JSONB,
    risk_assessment TEXT CHECK (risk_assessment IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    corrective_actions JSONB,
    attachments JSONB,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Contract Templates
CREATE TABLE contract_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('SUPPLIER', 'CUSTOMER', 'SERVICE', 'LEASE', 'EMPLOYMENT')),
    category TEXT NOT NULL,
    template JSONB NOT NULL,
    terms JSONB NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    version TEXT NOT NULL DEFAULT '1.0',
    created_by UUID NOT NULL REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Contract History
CREATE TABLE contract_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('CREATED', 'UPDATED', 'APPROVED', 'AMENDED', 'TERMINATED')),
    description TEXT NOT NULL,
    changes JSONB,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX idx_cost_centers_tenant_code ON cost_centers(tenant_id, code);
CREATE INDEX idx_budgets_tenant_fiscal_year ON budgets(tenant_id, fiscal_year);
CREATE INDEX idx_gl_accounts_tenant_number ON gl_accounts(tenant_id, account_number);
CREATE INDEX idx_gl_transactions_tenant_date ON gl_transactions(tenant_id, transaction_date);
CREATE INDEX idx_warehouses_tenant_code ON warehouses(tenant_id, code);
CREATE INDEX idx_warehouse_zones_warehouse ON warehouse_zones(warehouse_id, code);
CREATE INDEX idx_warehouse_tasks_warehouse_status ON warehouse_tasks(warehouse_id, status);
CREATE INDEX idx_contracts_tenant_number ON contracts(tenant_id, contract_number);
CREATE INDEX idx_contracts_tenant_status ON contracts(tenant_id, status);
CREATE INDEX idx_contract_parties_contract ON contract_parties(contract_id, party_type);
CREATE INDEX idx_contract_history_contract ON contract_history(contract_id, performed_at);

-- Enable Row Level Security
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_aisles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pick_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own tenant cost centers" ON cost_centers FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can insert own tenant cost centers" ON cost_centers FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can update own tenant cost centers" ON cost_centers FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can delete own tenant cost centers" ON cost_centers FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can view own tenant budgets" ON budgets FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can insert own tenant budgets" ON budgets FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can update own tenant budgets" ON budgets FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can delete own tenant budgets" ON budgets FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can view own tenant warehouses" ON warehouses FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can insert own tenant warehouses" ON warehouses FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can update own tenant warehouses" ON warehouses FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can delete own tenant warehouses" ON warehouses FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can view own tenant contracts" ON contracts FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can insert own tenant contracts" ON contracts FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can update own tenant contracts" ON contracts FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');
CREATE POLICY "Users can delete own tenant contracts" ON contracts FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id'); 