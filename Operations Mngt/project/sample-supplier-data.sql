-- Sample Supplier Data for Testing
-- Run this SQL in your PostgreSQL admin dashboard

-- First, let's check if we have the required tables and insert sample data

-- 1. Insert sample tenant (if not exists) - using a different slug
INSERT INTO tenants (id, name, slug, domain, plan, status, settings, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Demo Company',
    'demo-supplier-test',
    'demo-supplier-test.example.com',
    'PROFESSIONAL',
    'ACTIVE',
    '{"theme": "light", "timezone": "UTC"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample user (if not exists)
INSERT INTO users (id, email, first_name, last_name, name, status, mfa_enabled, current_tenant_id, created_at, updated_at)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'john.doe@example.com',
    'John',
    'Doe',
    'John Doe',
    'active',
    false,
    '550e8400-e29b-41d4-a716-446655440001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert sample supplier (only if not exists)
INSERT INTO suppliers (
    id,
    tenant_id,
    name,
    code,
    type,
    status,
    tax_id,
    registration_number,
    website,
    industry,
    description,
    year_established,
    annual_revenue,
    employee_count,
    business_classifications,
    categories,
    payment_terms,
    preferred_currency,
    notes,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    'TechCorp Manufacturing',
    'SUP20241201001',
    'MANUFACTURER',
    'ACTIVE',
    '12-3456789',
    'REG123456789',
    'https://techcorp.com',
    'Electronics Manufacturing',
    'Leading manufacturer of electronic components and circuit boards',
    2015,
    5000000.00,
    250,
    ARRAY['LARGE_ENTERPRISE'],
    ARRAY['Electronics', 'Components', 'Manufacturing'],
    'Net 30',
    'USD',
    'Reliable supplier with excellent quality standards',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert supplier addresses (only if not exists)
INSERT INTO supplier_addresses (
    id,
    tenant_id,
    supplier_id,
    type,
    street,
    city,
    state,
    country,
    postal_code,
    is_primary,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'HEADQUARTERS',
    '123 Tech Drive',
    'San Jose',
    'CA',
    'USA',
    '95123',
    true,
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'MANUFACTURING',
    '456 Industrial Blvd',
    'Fremont',
    'CA',
    'USA',
    '94539',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert supplier contacts (only if not exists)
INSERT INTO supplier_contacts (
    id,
    tenant_id,
    supplier_id,
    first_name,
    last_name,
    title,
    email,
    phone,
    is_primary,
    department,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Sarah',
    'Johnson',
    'Sales Manager',
    'sarah.johnson@techcorp.com',
    '+1-555-123-4567',
    true,
    'Sales',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Mike',
    'Chen',
    'Technical Support',
    'mike.chen@techcorp.com',
    '+1-555-987-6543',
    false,
    'Technical Support',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert supplier bank information (only if not exists)
INSERT INTO supplier_bank_information (
    id,
    tenant_id,
    supplier_id,
    bank_name,
    account_name,
    account_number,
    routing_number,
    currency,
    swift_code,
    iban,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440008',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440003',
    'Silicon Valley Bank',
    'TechCorp Manufacturing',
    '1234567890',
    '121000248',
    'USD',
    'SVBKUS6S',
    'US12345678901234567890',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 7. Insert another sample supplier (only if not exists)
INSERT INTO suppliers (
    id,
    tenant_id,
    name,
    code,
    type,
    status,
    tax_id,
    registration_number,
    website,
    industry,
    description,
    year_established,
    annual_revenue,
    employee_count,
    business_classifications,
    categories,
    payment_terms,
    preferred_currency,
    notes,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440009',
    '550e8400-e29b-41d4-a716-446655440001',
    'Global Logistics Solutions',
    'SUP20241201002',
    'DISTRIBUTOR',
    'ACTIVE',
    '98-7654321',
    'REG987654321',
    'https://globallogistics.com',
    'Logistics & Distribution',
    'International logistics and distribution services',
    2010,
    15000000.00,
    500,
    ARRAY['LARGE_ENTERPRISE', 'MINORITY_OWNED'],
    ARRAY['Logistics', 'Distribution', 'Transportation'],
    'Net 45',
    'USD',
    'Global logistics partner with extensive network',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Insert addresses for second supplier (only if not exists)
INSERT INTO supplier_addresses (
    id,
    tenant_id,
    supplier_id,
    type,
    street,
    city,
    state,
    country,
    postal_code,
    is_primary,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440009',
    'HEADQUARTERS',
    '789 Logistics Way',
    'Chicago',
    'IL',
    'USA',
    '60601',
    true,
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440009',
    'SHIPPING',
    '321 Warehouse Ave',
    'Los Angeles',
    'CA',
    'USA',
    '90001',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 9. Insert contacts for second supplier (only if not exists)
INSERT INTO supplier_contacts (
    id,
    tenant_id,
    supplier_id,
    first_name,
    last_name,
    title,
    email,
    phone,
    is_primary,
    department,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440009',
    'David',
    'Rodriguez',
    'Operations Director',
    'david.rodriguez@globallogistics.com',
    '+1-555-456-7890',
    true,
    'Operations',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 10. Insert bank information for second supplier (only if not exists)
INSERT INTO supplier_bank_information (
    id,
    tenant_id,
    supplier_id,
    bank_name,
    account_name,
    account_number,
    routing_number,
    currency,
    swift_code,
    iban,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440009',
    'Chase Bank',
    'Global Logistics Solutions',
    '0987654321',
    '021000021',
    'USD',
    'CHASUS33',
    'US09876543210987654321',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 11. Insert a third sample supplier (Small Business) - only if not exists
INSERT INTO suppliers (
    id,
    tenant_id,
    name,
    code,
    type,
    status,
    tax_id,
    registration_number,
    website,
    industry,
    description,
    year_established,
    annual_revenue,
    employee_count,
    business_classifications,
    categories,
    payment_terms,
    preferred_currency,
    notes,
    created_by,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440001',
    'GreenTech Solutions',
    'SUP20241201003',
    'SERVICE_PROVIDER',
    'PENDING_APPROVAL',
    '55-1234567',
    'REG555123456',
    'https://greentechsolutions.com',
    'Environmental Services',
    'Sustainable technology solutions and consulting',
    2020,
    750000.00,
    25,
    ARRAY['SMALL_BUSINESS', 'WOMEN_OWNED'],
    ARRAY['Environmental', 'Technology', 'Consulting'],
    'Net 30',
    'USD',
    'New supplier specializing in green technology',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 12. Insert address for third supplier (only if not exists)
INSERT INTO supplier_addresses (
    id,
    tenant_id,
    supplier_id,
    type,
    street,
    city,
    state,
    country,
    postal_code,
    is_primary,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440014',
    'HEADQUARTERS',
    '456 Green Street',
    'Portland',
    'OR',
    'USA',
    '97201',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 13. Insert contact for third supplier (only if not exists)
INSERT INTO supplier_contacts (
    id,
    tenant_id,
    supplier_id,
    first_name,
    last_name,
    title,
    email,
    phone,
    is_primary,
    department,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440014',
    'Lisa',
    'Thompson',
    'CEO',
    'lisa.thompson@greentechsolutions.com',
    '+1-555-789-0123',
    true,
    'Executive',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verification queries to check the data
SELECT 'Suppliers created:' as info;
SELECT id, name, code, type, status FROM suppliers WHERE tenant_id = '550e8400-e29b-41d4-a716-446655440001';

SELECT 'Supplier addresses:' as info;
SELECT s.name, sa.type, sa.street, sa.city, sa.state, sa.country 
FROM supplier_addresses sa 
JOIN suppliers s ON sa.supplier_id = s.id 
WHERE sa.tenant_id = '550e8400-e29b-41d4-a716-446655440001';

SELECT 'Supplier contacts:' as info;
SELECT s.name, sc.first_name, sc.last_name, sc.title, sc.email, sc.phone 
FROM supplier_contacts sc 
JOIN suppliers s ON sc.supplier_id = s.id 
WHERE sc.tenant_id = '550e8400-e29b-41d4-a716-446655440001';

SELECT 'Supplier bank information:' as info;
SELECT s.name, sbi.bank_name, sbi.account_name, sbi.currency 
FROM supplier_bank_information sbi 
JOIN suppliers s ON sbi.supplier_id = s.id 
WHERE sbi.tenant_id = '550e8400-e29b-41d4-a716-446655440001';
