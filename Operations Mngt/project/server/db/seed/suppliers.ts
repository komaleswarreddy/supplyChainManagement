import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { suppliers, supplierAddresses, supplierContacts, supplierBankInformation } from '../schema/suppliers';
import { logger } from '../../utils/logger';

export async function seedSuppliers(db: PostgresJsDatabase, createdById: string, tenantId: string) {
  try {
    logger.info('Seeding suppliers data');
    
    // Create suppliers
    const createdSuppliers = await db.insert(suppliers).values([
      {
        tenantId,
        name: 'Acme Corporation',
        code: 'ACME001',
        type: 'MANUFACTURER',
        status: 'ACTIVE',
        taxId: 'TAX-123456789',
        registrationNumber: 'REG-987654321',
        website: 'https://acme.example.com',
        industry: 'Manufacturing',
        description: 'Leading manufacturer of industrial equipment',
        yearEstablished: 1985,
        annualRevenue: 5000000,
        employeeCount: 250,
        businessClassifications: ['LARGE_ENTERPRISE'],
        categories: ['Industrial Equipment', 'Machinery', 'Tools'],
        paymentTerms: 'Net 30',
        preferredCurrency: 'USD',
        onboardingDate: new Date().toISOString(),
        qualificationStatus: 'QUALIFIED',
        qualificationScore: 92,
        qualificationDate: new Date().toISOString(),
        createdBy: createdById,
      },
      {
        tenantId,
        name: 'Tech Innovations Inc',
        code: 'TECH001',
        type: 'DISTRIBUTOR',
        status: 'ACTIVE',
        taxId: 'TAX-234567890',
        registrationNumber: 'REG-876543210',
        website: 'https://techinnovations.example.com',
        industry: 'Technology',
        description: 'Distributor of cutting-edge technology products',
        yearEstablished: 2005,
        annualRevenue: 2500000,
        employeeCount: 120,
        businessClassifications: ['SMALL_BUSINESS'],
        categories: ['Electronics', 'Computer Hardware', 'Software'],
        paymentTerms: 'Net 45',
        preferredCurrency: 'USD',
        onboardingDate: new Date().toISOString(),
        qualificationStatus: 'QUALIFIED',
        qualificationScore: 88,
        qualificationDate: new Date().toISOString(),
        createdBy: createdById,
      },
      {
        tenantId,
        name: 'Global Logistics Partners',
        code: 'GLOB001',
        type: 'SERVICE_PROVIDER',
        status: 'ACTIVE',
        taxId: 'TAX-345678901',
        registrationNumber: 'REG-765432109',
        website: 'https://globallogistics.example.com',
        industry: 'Logistics',
        description: 'Worldwide logistics and transportation services',
        yearEstablished: 1998,
        annualRevenue: 7500000,
        employeeCount: 350,
        businessClassifications: ['LARGE_ENTERPRISE'],
        categories: ['Transportation', 'Warehousing', 'Freight Forwarding'],
        paymentTerms: 'Net 30',
        preferredCurrency: 'USD',
        onboardingDate: new Date().toISOString(),
        qualificationStatus: 'QUALIFIED',
        qualificationScore: 95,
        qualificationDate: new Date().toISOString(),
        createdBy: createdById,
      },
    ]).returning();
    
    // Create supplier addresses
    await db.insert(supplierAddresses).values([
      {
        tenantId,
        supplierId: createdSuppliers[0].id,
        type: 'HEADQUARTERS',
        street: '123 Main Street',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postalCode: '60601',
        isPrimary: true,
      },
      {
        tenantId,
        supplierId: createdSuppliers[0].id,
        type: 'MANUFACTURING',
        street: '456 Factory Blvd',
        city: 'Detroit',
        state: 'MI',
        country: 'USA',
        postalCode: '48201',
        isPrimary: false,
      },
      {
        tenantId,
        supplierId: createdSuppliers[1].id,
        type: 'HEADQUARTERS',
        street: '789 Tech Parkway',
        city: 'San Jose',
        state: 'CA',
        country: 'USA',
        postalCode: '95110',
        isPrimary: true,
      },
      {
        tenantId,
        supplierId: createdSuppliers[2].id,
        type: 'HEADQUARTERS',
        street: '101 Logistics Way',
        city: 'Atlanta',
        state: 'GA',
        country: 'USA',
        postalCode: '30301',
        isPrimary: true,
      },
    ]);
    
    // Create supplier contacts
    await db.insert(supplierContacts).values([
      {
        tenantId,
        supplierId: createdSuppliers[0].id,
        firstName: 'John',
        lastName: 'Smith',
        title: 'Account Manager',
        email: 'john.smith@acme.example.com',
        phone: '+1-555-123-4567',
        isPrimary: true,
        department: 'Sales',
      },
      {
        tenantId,
        supplierId: createdSuppliers[0].id,
        firstName: 'Sarah',
        lastName: 'Johnson',
        title: 'Customer Service Representative',
        email: 'sarah.johnson@acme.example.com',
        phone: '+1-555-987-6543',
        isPrimary: false,
        department: 'Customer Service',
      },
      {
        tenantId,
        supplierId: createdSuppliers[1].id,
        firstName: 'Michael',
        lastName: 'Chen',
        title: 'Sales Director',
        email: 'michael.chen@techinnovations.example.com',
        phone: '+1-555-456-7890',
        isPrimary: true,
        department: 'Sales',
      },
      {
        tenantId,
        supplierId: createdSuppliers[2].id,
        firstName: 'Emily',
        lastName: 'Davis',
        title: 'Operations Manager',
        email: 'emily.davis@globallogistics.example.com',
        phone: '+1-555-789-0123',
        isPrimary: true,
        department: 'Operations',
      },
    ]);
    
    // Create supplier bank information
    await db.insert(supplierBankInformation).values([
      {
        tenantId,
        supplierId: createdSuppliers[0].id,
        bankName: 'First National Bank',
        accountName: 'Acme Corporation',
        accountNumber: 'ACCT-123456789',
        routingNumber: '123456789',
        currency: 'USD',
        swiftCode: 'FNBAUS12',
      },
      {
        tenantId,
        supplierId: createdSuppliers[1].id,
        bankName: 'Silicon Valley Bank',
        accountName: 'Tech Innovations Inc',
        accountNumber: 'ACCT-234567890',
        routingNumber: '234567890',
        currency: 'USD',
      },
      {
        tenantId,
        supplierId: createdSuppliers[2].id,
        bankName: 'Global Banking Corp',
        accountName: 'Global Logistics Partners',
        accountNumber: 'ACCT-345678901',
        routingNumber: '345678901',
        currency: 'USD',
        swiftCode: 'GLOBUS33',
        iban: 'US12345678901234567890',
      },
    ]);
    
    logger.info('Suppliers data seeded successfully');
    return createdSuppliers;
  } catch (error) {
    logger.error('Error seeding suppliers data', { error });
    throw error;
  }
}