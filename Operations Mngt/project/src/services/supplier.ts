import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Supplier, 
  SupplierFilters, 
  SupplierQualification, 
  SupplierRiskAssessment, 
  SupplierDevelopmentPlan,
  AssessmentStatus,
  RiskLevel,
  DevelopmentStatus,
  SupplierPerformance,
  SupplierSustainability,
  SupplierQualityRecord,
  SupplierFinancialHealth
} from '@/types/supplier';

// Mock data for development
const MOCK_SUPPLIERS: Supplier[] = Array.from({ length: 10 }, (_, i) => ({
  id: `supplier-${i + 1}`,
  name: `Supplier ${i + 1}`,
  code: `SUP${String(i + 1).padStart(3, '0')}`,
  type: ['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER'][i % 5] as Supplier['type'],
  status: ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'APPROVED'][i % 4] as Supplier['status'],
  taxId: `TAX-${i + 1}-123456`,
  registrationNumber: `REG-${i + 1}-987654`,
  website: `https://supplier${i + 1}.example.com`,
  industry: ['Manufacturing', 'Technology', 'Healthcare', 'Retail', 'Services'][i % 5],
  description: `Supplier ${i + 1} is a leading provider of ${['manufacturing', 'technology', 'healthcare', 'retail', 'services'][i % 5]} solutions.`,
  yearEstablished: 1990 + i,
  annualRevenue: 1000000 * (i + 1),
  employeeCount: 50 * (i + 1),
  businessClassifications: i % 2 === 0 ? ['SMALL_BUSINESS', 'MINORITY_OWNED'] : ['LARGE_ENTERPRISE'],
  addresses: [
    {
      type: 'HEADQUARTERS',
      street: `${123 + i} Main Street`,
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      postalCode: '60601',
      isPrimary: true,
    },
    {
      type: 'SHIPPING',
      street: `${456 + i} Warehouse Blvd`,
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      postalCode: '60602',
      isPrimary: false,
    },
  ],
  contacts: [
    {
      id: `contact-${i}-1`,
      firstName: 'John',
      lastName: 'Doe',
      title: 'Account Manager',
      email: `john.doe@supplier${i + 1}.example.com`,
      phone: '+1-555-123-4567',
      isPrimary: true,
      department: 'Sales',
    },
    {
      id: `contact-${i}-2`,
      firstName: 'Jane',
      lastName: 'Smith',
      title: 'Customer Service Representative',
      email: `jane.smith@supplier${i + 1}.example.com`,
      phone: '+1-555-987-6543',
      isPrimary: false,
      department: 'Customer Service',
    },
  ],
  categories: ['Electronics', 'Office Supplies', 'IT Equipment'][i % 3].split(','),
  certifications: i % 3 === 0 ? [
    {
      name: 'ISO 9001',
      issuer: 'International Organization for Standardization',
      validFrom: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      documentUrl: `https://example.com/certificates/iso9001-supplier${i + 1}.pdf`,
    },
  ] : undefined,
  bankInformation: {
    bankName: 'First National Bank',
    accountName: `Supplier ${i + 1} Inc.`,
    accountNumber: `ACCT-${i + 1}-123456`,
    routingNumber: '123456789',
    currency: 'USD',
    swiftCode: 'FNBAUS12',
    iban: 'US123456789012345678901234',
  },
  paymentTerms: 'Net 30',
  preferredCurrency: 'USD',
  onboardingDate: new Date(Date.now() - (365 + i * 30) * 24 * 60 * 60 * 1000).toISOString(),
  qualificationStatus: ['NOT_STARTED', 'IN_PROGRESS', 'QUALIFIED', 'DISQUALIFIED'][i % 4],
  qualificationScore: i % 4 === 2 ? 85 + (i % 10) : undefined,
  qualificationDate: i % 4 === 2 ? new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  riskAssessment: i % 3 === 0 ? {
    overallRiskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as RiskLevel,
    lastAssessmentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    nextAssessmentDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [
      {
        category: 'FINANCIAL',
        riskLevel: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
        score: 75 + (i % 20),
        factors: [
          {
            name: 'Credit Score',
            score: 80 + (i % 15),
            weight: 0.4,
          },
          {
            name: 'Financial Stability',
            score: 70 + (i % 25),
            weight: 0.6,
          },
        ],
        mitigationPlan: i % 3 !== 0 ? 'Implement additional financial monitoring' : undefined,
      },
      {
        category: 'OPERATIONAL',
        riskLevel: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
        score: 80 + (i % 15),
        factors: [
          {
            name: 'Delivery Performance',
            score: 85 + (i % 10),
            weight: 0.5,
          },
          {
            name: 'Quality Control',
            score: 75 + (i % 20),
            weight: 0.5,
          },
        ],
      },
    ],
  } : undefined,
  performance: i % 2 === 0 ? {
    qualityScore: 85 + (i % 10),
    deliveryScore: 80 + (i % 15),
    costScore: 75 + (i % 20),
    overallScore: 80 + (i % 15),
    lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  } : undefined,
  developmentPlans: i % 4 === 0 ? [
    {
      id: `dev-plan-${i}-1`,
      title: 'Quality Improvement Initiative',
      area: 'QUALITY',
      description: 'Improve product quality through enhanced QA processes',
      baseline: 80,
      target: 95,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'IN_PROGRESS',
      progress: 40,
      milestones: [
        {
          id: `milestone-${i}-1`,
          title: 'Define Quality Metrics',
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
          completedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: `milestone-${i}-2`,
          title: 'Implement New QA Process',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PENDING',
        },
      ],
      notes: 'Making good progress on quality improvements',
    },
  ] : [],
  documents: [
    {
      id: `doc-${i}-1`,
      name: 'Supplier Agreement',
      type: 'CONTRACT',
      url: `https://example.com/documents/supplier-agreement-${i + 1}.pdf`,
      uploadedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['admin'],
        permissions: ['manage_suppliers'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      uploadedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ACTIVE',
    },
  ],
  notes: i % 3 === 0 ? 'Strategic supplier with good performance history' : undefined,
  createdBy: {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    roles: ['admin'],
    permissions: ['manage_suppliers'],
    status: 'active',
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  createdAt: new Date(Date.now() - (365 + i * 30) * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - i * 15 * 24 * 60 * 60 * 1000).toISOString(),
  audit: {
    statusHistory: [
      {
        status: 'DRAFT',
        timestamp: new Date(Date.now() - (365 + i * 30) * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
      },
      {
        status: ['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'APPROVED'][i % 4],
        timestamp: new Date(Date.now() - (300 + i * 15) * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-1',
          name: 'John Doe',
        },
      },
    ],
  },
}));

// Mock qualifications
const MOCK_QUALIFICATIONS: SupplierQualification[] = MOCK_SUPPLIERS
  .filter((_, i) => i % 4 === 2)
  .map((supplier, i) => ({
    id: `qual-${i + 1}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    status: 'COMPLETED' as AssessmentStatus,
    questionnaire: {
      id: `questionnaire-${i + 1}`,
      name: 'Standard Supplier Qualification',
      sections: [
        {
          id: `section-${i}-1`,
          title: 'Company Information',
          weight: 0.3,
          questions: [
            {
              id: `question-${i}-1`,
              text: 'How many years has your company been in business?',
              type: 'NUMBER',
              required: true,
              weight: 0.5,
              answer: 15 + i,
              score: 8 + (i % 3),
              maxScore: 10,
            },
            {
              id: `question-${i}-2`,
              text: 'Do you have a quality management system in place?',
              type: 'BOOLEAN',
              required: true,
              weight: 0.5,
              answer: true,
              score: 10,
              maxScore: 10,
            },
          ],
        },
        {
          id: `section-${i}-2`,
          title: 'Financial Stability',
          weight: 0.3,
          questions: [
            {
              id: `question-${i}-3`,
              text: 'What was your annual revenue for the last fiscal year?',
              type: 'NUMBER',
              required: true,
              weight: 0.7,
              answer: 1000000 * (i + 1),
              score: 7 + (i % 4),
              maxScore: 10,
            },
          ],
        },
        {
          id: `section-${i}-3`,
          title: 'Operational Capabilities',
          weight: 0.4,
          questions: [
            {
              id: `question-${i}-4`,
              text: 'What is your on-time delivery rate?',
              type: 'NUMBER',
              required: true,
              weight: 0.6,
              answer: 95 - (i % 10),
              score: 8 + (i % 3),
              maxScore: 10,
            },
            {
              id: `question-${i}-5`,
              text: 'What is your defect rate?',
              type: 'NUMBER',
              required: true,
              weight: 0.4,
              answer: 0.5 + (i * 0.1),
              score: 9 - (i % 3),
              maxScore: 10,
            },
          ],
        },
      ],
    },
    requiredDocuments: [
      {
        id: `doc-req-${i}-1`,
        name: 'ISO 9001 Certificate',
        description: 'Current ISO 9001 quality management certification',
        required: true,
        status: 'APPROVED',
        documentUrl: `https://example.com/documents/iso9001-${i + 1}.pdf`,
      },
      {
        id: `doc-req-${i}-2`,
        name: 'Financial Statements',
        description: 'Last 3 years of audited financial statements',
        required: true,
        status: 'APPROVED',
        documentUrl: `https://example.com/documents/financials-${i + 1}.pdf`,
      },
    ],
    overallScore: 85 + (i % 10),
    maxPossibleScore: 100,
    startedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    evaluatedBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['admin'],
      permissions: ['manage_suppliers'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    evaluatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Supplier meets all qualification requirements',
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['admin'],
      permissions: ['manage_suppliers'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

// Mock risk assessments
const MOCK_RISK_ASSESSMENTS: SupplierRiskAssessment[] = MOCK_SUPPLIERS
  .filter((_, i) => i % 3 === 0)
  .map((supplier, i) => ({
    id: `risk-${i + 1}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    assessmentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'COMPLETED' as AssessmentStatus,
    overallRiskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as RiskLevel,
    overallScore: 100 - (i * 10) - (i % 15),
    categories: [
      {
        category: 'FINANCIAL',
        weight: 0.3,
        score: 80 - (i * 5),
        riskLevel: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
        factors: [
          {
            id: `factor-${i}-1`,
            name: 'Credit Rating',
            description: 'Supplier credit rating from financial institutions',
            weight: 0.6,
            score: 85 - (i * 5),
            dataSource: 'Dun & Bradstreet',
          },
          {
            id: `factor-${i}-2`,
            name: 'Financial Stability',
            description: 'Assessment of financial statements and stability',
            weight: 0.4,
            score: 75 - (i * 5),
            dataSource: 'Internal Analysis',
          },
        ],
      },
      {
        category: 'OPERATIONAL',
        weight: 0.4,
        score: 85 - (i * 3),
        riskLevel: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
        factors: [
          {
            id: `factor-${i}-3`,
            name: 'Supply Chain Resilience',
            description: 'Ability to maintain operations during disruptions',
            weight: 0.5,
            score: 80 - (i * 4),
            dataSource: 'Supplier Assessment',
          },
          {
            id: `factor-${i}-4`,
            name: 'Quality Control',
            description: 'Effectiveness of quality management systems',
            weight: 0.5,
            score: 90 - (i * 2),
            dataSource: 'Quality Audit',
          },
        ],
      },
      {
        category: 'COMPLIANCE',
        weight: 0.3,
        score: 90 - (i * 2),
        riskLevel: ['LOW', 'MEDIUM'][i % 2] as RiskLevel,
        factors: [
          {
            id: `factor-${i}-5`,
            name: 'Regulatory Compliance',
            description: 'Compliance with relevant regulations and standards',
            weight: 0.7,
            score: 95 - (i * 2),
            dataSource: 'Compliance Audit',
          },
          {
            id: `factor-${i}-6`,
            name: 'Environmental Compliance',
            description: 'Adherence to environmental regulations',
            weight: 0.3,
            score: 85 - (i * 3),
            dataSource: 'Environmental Audit',
          },
        ],
      },
    ],
    mitigationPlans: i % 2 === 0 ? [
      {
        id: `mitigation-${i}-1`,
        riskCategory: 'FINANCIAL',
        description: 'Implement additional financial monitoring and reporting',
        actions: [
          {
            id: `action-${i}-1`,
            description: 'Quarterly financial review meetings',
            assignedTo: {
              id: 'user-2',
              email: 'jane.smith@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              name: 'Jane Smith',
              roles: ['manager'],
              permissions: ['manage_suppliers'],
              status: 'active',
              mfaEnabled: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'PENDING',
          },
        ],
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] : [],
    nextAssessmentDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
    assessedBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['admin'],
      permissions: ['manage_suppliers'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    notes: i % 2 === 0 ? 'Regular monitoring recommended due to financial concerns' : undefined,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  }));

// Mock development plans
const MOCK_DEVELOPMENT_PLANS: SupplierDevelopmentPlan[] = MOCK_SUPPLIERS
  .filter((_, i) => i % 4 === 0)
  .map((supplier, i) => ({
    id: `dev-plan-${i + 1}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    title: 'Quality Improvement Initiative',
    area: 'QUALITY',
    description: 'Comprehensive plan to improve product quality and reduce defect rates',
    baseline: 80,
    target: 95,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'IN_PROGRESS' as DevelopmentStatus,
    progress: 40,
    milestones: [
      {
        id: `milestone-${i}-1`,
        title: 'Define Quality Metrics',
        description: 'Establish clear metrics for measuring quality improvements',
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'COMPLETED',
        completedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Metrics defined and approved by both parties',
      },
      {
        id: `milestone-${i}-2`,
        title: 'Implement New QA Process',
        description: 'Roll out enhanced quality assurance processes',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
      },
      {
        id: `milestone-${i}-3`,
        title: 'Staff Training',
        description: 'Train all relevant staff on new quality procedures',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'PENDING',
      },
    ],
    kpis: [
      {
        id: `kpi-${i}-1`,
        name: 'Defect Rate',
        description: 'Percentage of defective products',
        unit: '%',
        baseline: 5.0,
        target: 1.0,
        current: 3.5,
        measurements: [
          {
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            value: 5.0,
          },
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            value: 3.5,
          },
        ],
      },
      {
        id: `kpi-${i}-2`,
        name: 'First Pass Yield',
        description: 'Percentage of units that pass quality inspection on first attempt',
        unit: '%',
        baseline: 85,
        target: 98,
        current: 90,
        measurements: [
          {
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            value: 85,
          },
          {
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            value: 90,
          },
        ],
      },
    ],
    meetings: [
      {
        id: `meeting-${i}-1`,
        title: 'Kickoff Meeting',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        attendees: [
          {
            name: 'John Doe',
            organization: 'Our Company',
            role: 'Supplier Quality Manager',
          },
          {
            name: 'Jane Smith',
            organization: supplier.name,
            role: 'Quality Director',
          },
        ],
        notes: 'Discussed plan objectives and timeline',
        actionItems: [
          {
            description: 'Share current quality metrics',
            assignedTo: 'Jane Smith',
            dueDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
          },
          {
            description: 'Draft detailed implementation plan',
            assignedTo: 'John Doe',
            dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
          },
        ],
      },
      {
        id: `meeting-${i}-2`,
        title: 'Monthly Progress Review',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        attendees: [
          {
            name: 'John Doe',
            organization: 'Our Company',
            role: 'Supplier Quality Manager',
          },
          {
            name: 'Jane Smith',
            organization: supplier.name,
            role: 'Quality Director',
          },
        ],
        notes: 'Reviewed progress on metrics definition',
        actionItems: [
          {
            description: 'Finalize training materials',
            assignedTo: 'Jane Smith',
            dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'COMPLETED',
          },
        ],
      },
    ],
    resources: [
      {
        id: `resource-${i}-1`,
        type: 'PERSONNEL',
        description: 'Quality Consultant (2 days/week)',
        allocated: true,
      },
      {
        id: `resource-${i}-2`,
        type: 'FINANCIAL',
        description: 'Training Budget ($10,000)',
        allocated: true,
      },
      {
        id: `resource-${i}-3`,
        type: 'TECHNICAL',
        description: 'Quality Management Software',
        allocated: false,
      },
    ],
    notes: 'Making good progress on quality improvements',
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['admin'],
      permissions: ['manage_suppliers'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['admin'],
      permissions: ['manage_suppliers'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

// Mock performance data
const MOCK_PERFORMANCE_DATA: SupplierPerformance[] = MOCK_SUPPLIERS.map((supplier, i) => ({
  id: `perf-${i + 1}`,
  supplierId: supplier.id,
  supplierName: supplier.name,
  qualityScore: 85 + (i % 10),
  deliveryScore: 80 + (i % 15),
  costScore: 75 + (i % 20),
  overallScore: 80 + (i % 15),
  metrics: {
    defectRate: Math.random() * 5,
    onTimeDelivery: 85 + Math.random() * 15,
    leadTimeAdherence: 90 + Math.random() * 10,
    priceCompetitiveness: 75 + Math.random() * 20,
    responsiveness: 80 + Math.random() * 15,
    innovation: 70 + Math.random() * 25,
    sustainability: 65 + Math.random() * 30,
  },
  history: Array.from({ length: 12 }, (_, j) => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11 + j);
    return {
      period: date.toISOString().substring(0, 7), // YYYY-MM
      qualityScore: 75 + Math.floor(Math.random() * 20),
      deliveryScore: 70 + Math.floor(Math.random() * 25),
      costScore: 65 + Math.floor(Math.random() * 30),
      overallScore: 70 + Math.floor(Math.random() * 25),
    };
  }),
  issues: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
    id: `issue-${i}-${j}`,
    type: ['QUALITY', 'DELIVERY', 'COST'][j % 3],
    description: `Issue description for ${['quality', 'delivery', 'cost'][j % 3]}`,
    date: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'][Math.floor(Math.random() * 3)],
    severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
    impact: Math.floor(Math.random() * 5) + 1, // 1-5
    resolutionDate: Math.random() > 0.7 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    resolutionNotes: Math.random() > 0.7 ? 'Resolution notes' : undefined,
  })),
  lastUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
}));

// Mock sustainability data
const MOCK_SUSTAINABILITY_DATA: SupplierSustainability[] = MOCK_SUPPLIERS.map((supplier, i) => {
  const ratings = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
  const statuses = ['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW'];
  
  return {
    id: `sus-${i + 1}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    overallRating: ratings[Math.floor(Math.random() * ratings.length)],
    carbonFootprint: Math.floor(Math.random() * 1000) + 100,
    carbonUnit: 'tCO2e',
    waterUsage: Math.floor(Math.random() * 100000) + 10000,
    waterUnit: 'gallons',
    wasteGeneration: Math.floor(Math.random() * 100) + 10,
    wasteUnit: 'tons',
    renewableEnergy: Math.floor(Math.random() * 100),
    certifications: [
      'ISO 14001',
      'ISO 50001',
      'B Corp',
      'Carbon Trust',
      'Green Seal',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    complianceStatus: statuses[Math.floor(Math.random() * statuses.length)],
    lastAssessmentDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    nextAssessmentDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    goals: {
      carbonReduction: Math.floor(Math.random() * 50) + 10,
      waterReduction: Math.floor(Math.random() * 50) + 10,
      wasteReduction: Math.floor(Math.random() * 50) + 10,
      renewableTarget: Math.floor(Math.random() * 50) + 50,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
    },
    initiatives: [
      {
        id: `init-${i}-1`,
        name: 'Carbon Reduction Initiative',
        description: 'Implementing energy efficiency measures across operations',
        status: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
        impact: {
          category: 'CARBON',
          value: Math.floor(Math.random() * 100) + 50,
          unit: 'tCO2e',
        },
      },
      {
        id: `init-${i}-2`,
        name: 'Water Conservation Project',
        description: 'Implementing water recycling systems',
        status: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        impact: {
          category: 'WATER',
          value: Math.floor(Math.random() * 20000) + 5000,
          unit: 'gallons',
        },
      },
    ],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

// Mock quality data
const MOCK_QUALITY_DATA: SupplierQualityRecord[] = MOCK_SUPPLIERS.map((supplier, i) => {
  const statuses = ['APPROVED', 'CONDITIONAL', 'REJECTED', 'PENDING'];
  const qualityScore = Math.floor(Math.random() * 30) + 70; // 70-100
  
  return {
    id: `qual-${i + 1}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    qualityScore,
    defectRate: Math.random() * 5,
    firstPassYield: 80 + Math.random() * 20,
    onTimeDelivery: 85 + Math.random() * 15,
    lastAuditDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
    nextAuditDate: new Date(Date.now() + Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000).toISOString(),
    certifications: [
      'ISO 9001',
      'IATF 16949',
      'AS9100',
      'ISO 13485',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    qualitySystem: ['Six Sigma', 'TQM', 'Lean Manufacturing', 'APQP'][Math.floor(Math.random() * 4)],
    incidents: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => {
      const severities = ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'];
      const incidentDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
      const isResolved = Math.random() > 0.3;
      
      return {
        id: `inc-${i}-${j}`,
        date: incidentDate.toISOString(),
        type: ['Product Defect', 'Documentation Error', 'Process Deviation', 'Packaging Issue'][Math.floor(Math.random() * 4)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        description: 'Quality incident description',
        status: isResolved ? 'CLOSED' : ['OPEN', 'IN_PROGRESS'][Math.floor(Math.random() * 2)],
        resolutionDate: isResolved ? new Date(incidentDate.getTime() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        rootCause: isResolved ? 'Root cause analysis result' : undefined,
        correctiveAction: isResolved ? 'Corrective action taken' : undefined,
      };
    }),
    correctiveActions: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => {
      const dueDate = new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      const isCompleted = Math.random() > 0.5;
      
      return {
        id: `capa-${i}-${j}`,
        title: 'Improve Quality Control Process',
        description: 'Implement additional quality checks in the manufacturing process',
        dueDate: dueDate.toISOString(),
        status: isCompleted ? 'COMPLETED' : dueDate < new Date() ? 'OVERDUE' : ['OPEN', 'IN_PROGRESS'][Math.floor(Math.random() * 2)],
        assignedTo: 'John Doe',
        completedDate: isCompleted ? new Date(dueDate.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString() : undefined,
        effectiveness: isCompleted ? Math.floor(Math.random() * 40) + 60 : undefined, // 60-100%
      };
    }),
    auditResults: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => {
      return {
        id: `audit-${i}-${j}`,
        date: new Date(Date.now() - (j + 1) * 180 * 24 * 60 * 60 * 1000).toISOString(),
        score: Math.floor(Math.random() * 30) + 70, // 70-100
        findings: Math.floor(Math.random() * 10) + 1,
        majorNonConformities: Math.floor(Math.random() * 3),
        minorNonConformities: Math.floor(Math.random() * 5) + 1,
        observations: Math.floor(Math.random() * 5) + 1,
        auditor: 'Quality Auditor',
      };
    }),
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

// Mock financial health data
const MOCK_FINANCIAL_DATA: SupplierFinancialHealth[] = MOCK_SUPPLIERS.map((supplier, i) => {
  const statuses = ['STRONG', 'STABLE', 'MODERATE', 'WEAK', 'CRITICAL'];
  const ratings = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D'];
  const trends = ['IMPROVING', 'STABLE', 'DECLINING'];
  
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const creditRating = ratings[Math.min(Math.floor(Math.random() * ratings.length), status === 'STRONG' ? 2 : status === 'STABLE' ? 4 : status === 'MODERATE' ? 6 : 9)];
  const trend = trends[Math.floor(Math.random() * trends.length)];
  
  return {
    id: `fin-${i + 1}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    status,
    creditRating,
    creditScore: Math.floor(Math.random() * 300) + 500, // 500-800
    financialStability: Math.floor(Math.random() * 40) + 60, // 60-100
    liquidityRatio: (Math.random() * 2) + 0.5, // 0.5-2.5
    debtToEquityRatio: (Math.random() * 2) + 0.2, // 0.2-2.2
    profitMargin: (Math.random() * 20) - 5, // -5% to 15%
    revenueGrowth: (Math.random() * 30) - 10, // -10% to 20%
    paymentHistory: Math.floor(Math.random() * 40) + 60, // 60-100
    daysPayableOutstanding: Math.floor(Math.random() * 60) + 30, // 30-90 days
    bankruptcyRisk: status === 'CRITICAL' ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30), // 0-30 or 60-100
    trend,
    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    financialData: Array.from({ length: 3 }, (_, j) => {
      const year = new Date().getFullYear() - j;
      const baseRevenue = 10000000 + Math.random() * 90000000;
      const growthFactor = trend === 'IMPROVING' ? 1.1 - (j * 0.05) : trend === 'DECLINING' ? 0.9 + (j * 0.05) : 1;
      const revenue = baseRevenue * growthFactor;
      const profitMargin = (Math.random() * 20) - 5; // -5% to 15%
      
      return {
        year,
        revenue,
        profit: revenue * (profitMargin / 100),
        assets: revenue * (0.8 + Math.random() * 0.4), // 80-120% of revenue
        liabilities: revenue * (0.4 + Math.random() * 0.4), // 40-80% of revenue
        cashFlow: revenue * (0.05 + Math.random() * 0.1), // 5-15% of revenue
      };
    }),
    alerts: status === 'WEAK' || status === 'CRITICAL' ? [
      {
        id: `alert-${i}-1`,
        type: ['PAYMENT_DELAY', 'CREDIT_DOWNGRADE', 'BANKRUPTCY_FILING', 'ACQUISITION', 'RESTRUCTURING'][Math.floor(Math.random() * 5)],
        severity: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Financial alert description',
        status: ['ACTIVE', 'RESOLVED', 'MONITORING'][Math.floor(Math.random() * 3)],
      }
    ] : [],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

export const supplierService = {
  // Suppliers
  getSuppliers: async (
    params: PaginationParams & SupplierFilters
  ): Promise<PaginatedResponse<Supplier>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/suppliers', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for suppliers');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_SUPPLIERS];

      if (params.status) {
        filteredData = filteredData.filter(supplier => supplier.status === params.status);
      }
      if (params.type) {
        filteredData = filteredData.filter(supplier => supplier.type === params.type);
      }
      if (params.name) {
        filteredData = filteredData.filter(supplier => 
          supplier.name.toLowerCase().includes(params.name!.toLowerCase()) ||
          supplier.code.toLowerCase().includes(params.name!.toLowerCase())
        );
      }
      if (params.category) {
        filteredData = filteredData.filter(supplier => 
          supplier.categories.some(category => 
            category.toLowerCase().includes(params.category!.toLowerCase())
          )
        );
      }
      if (params.classification) {
        filteredData = filteredData.filter(supplier => 
          supplier.businessClassifications?.includes(params.classification!)
        );
      }
      if (params.riskLevel) {
        filteredData = filteredData.filter(supplier => 
          supplier.riskAssessment?.overallRiskLevel === params.riskLevel
        );
      }
      if (params.qualificationStatus) {
        filteredData = filteredData.filter(supplier => 
          supplier.qualificationStatus === params.qualificationStatus
        );
      }
      if (params.dateRange) {
        const start = new Date(params.dateRange.start);
        const end = new Date(params.dateRange.end);
        filteredData = filteredData.filter(supplier => {
          const onboardingDate = supplier.onboardingDate ? 
            new Date(supplier.onboardingDate) : 
            new Date(supplier.createdAt);
          return onboardingDate >= start && onboardingDate <= end;
        });
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getSupplierById: async (id: string): Promise<ApiResponse<Supplier>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const supplier = MOCK_SUPPLIERS.find(supplier => supplier.id === id);

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return {
        data: supplier,
        status: 200,
      };
    }
  },

  createSupplier: async (supplier: Omit<Supplier, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'createdBy' | 'audit'>): Promise<ApiResponse<Supplier>> => {
    try {
      // First try to create in Supabase
      const response = await api.post('/api/v1/suppliers', supplier);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier creation');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newSupplier: Supplier = {
        id: `supplier-${MOCK_SUPPLIERS.length + 1}`,
        code: `SUP${String(MOCK_SUPPLIERS.length + 1).padStart(3, '0')}`,
        ...supplier,
        createdBy: {
          id: 'user-1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          name: 'John Doe',
          roles: ['admin'],
          permissions: ['manage_suppliers'],
          status: 'active',
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        audit: {
          statusHistory: [
            {
              status: supplier.status || 'DRAFT',
              timestamp: new Date().toISOString(),
              user: {
                id: 'user-1',
                name: 'John Doe',
              },
            },
          ],
        },
      };

      MOCK_SUPPLIERS.push(newSupplier);

      return {
        data: newSupplier,
        status: 201,
      };
    }
  },

  updateSupplier: async (id: string, supplier: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    try {
      // First try to update in Supabase
      const response = await api.put(`/api/v1/suppliers/${id}`, supplier);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier update');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Supplier not found');
      }

      // If status is changing, add to status history
      let updatedAudit = { ...MOCK_SUPPLIERS[index].audit };
      if (supplier.status && supplier.status !== MOCK_SUPPLIERS[index].status) {
        updatedAudit = {
          ...updatedAudit,
          statusHistory: [
            ...updatedAudit.statusHistory,
            {
              status: supplier.status,
              timestamp: new Date().toISOString(),
              user: {
                id: 'user-1',
                name: 'John Doe',
              },
            },
          ],
        };
      }

      MOCK_SUPPLIERS[index] = {
        ...MOCK_SUPPLIERS[index],
        ...supplier,
        updatedAt: new Date().toISOString(),
        audit: updatedAudit,
      };

      return {
        data: MOCK_SUPPLIERS[index],
        status: 200,
      };
    }
  },

  deleteSupplier: async (id: string): Promise<ApiResponse<void>> => {
    try {
      // First try to delete from Supabase
      const response = await api.delete(`/api/v1/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier deletion');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Supplier not found');
      }

      MOCK_SUPPLIERS.splice(index, 1);

      return {
        status: 204,
      };
    }
  },

  // Qualifications
  getQualifications: async (
    params: PaginationParams & { supplierId?: string; status?: AssessmentStatus }
  ): Promise<PaginatedResponse<SupplierQualification>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-qualifications', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for qualifications');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_QUALIFICATIONS];

      if (params.supplierId) {
        filteredData = filteredData.filter(qual => qual.supplierId === params.supplierId);
      }
      if (params.status) {
        filteredData = filteredData.filter(qual => qual.status === params.status);
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getQualificationById: async (id: string): Promise<ApiResponse<SupplierQualification>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-qualifications/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for qualification details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const qualification = MOCK_QUALIFICATIONS.find(qual => qual.id === id);

      if (!qualification) {
        throw new Error('Qualification not found');
      }

      return {
        data: qualification,
        status: 200,
      };
    }
  },

  createQualification: async (qualification: Omit<SupplierQualification, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SupplierQualification>> => {
    try {
      // First try to create in Supabase
      const response = await api.post('/api/v1/supplier-qualifications', qualification);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for qualification creation');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newQualification: SupplierQualification = {
        id: `qual-${MOCK_QUALIFICATIONS.length + 1}`,
        ...qualification,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_QUALIFICATIONS.push(newQualification);

      // Update supplier qualification status if needed
      const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === qualification.supplierId);
      if (supplierIndex !== -1) {
        MOCK_SUPPLIERS[supplierIndex] = {
          ...MOCK_SUPPLIERS[supplierIndex],
          qualificationStatus: 'IN_PROGRESS',
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        data: newQualification,
        status: 201,
      };
    }
  },

  updateQualification: async (id: string, qualification: Partial<SupplierQualification>): Promise<ApiResponse<SupplierQualification>> => {
    try {
      // First try to update in Supabase
      const response = await api.put(`/api/v1/supplier-qualifications/${id}`, qualification);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for qualification update');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = MOCK_QUALIFICATIONS.findIndex(q => q.id === id);
      if (index === -1) {
        throw new Error('Qualification not found');
      }

      MOCK_QUALIFICATIONS[index] = {
        ...MOCK_QUALIFICATIONS[index],
        ...qualification,
        updatedAt: new Date().toISOString(),
      };

      // Update supplier qualification status if completed
      if (qualification.status === 'COMPLETED' && qualification.supplierId) {
        const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === qualification.supplierId);
        if (supplierIndex !== -1) {
          MOCK_SUPPLIERS[supplierIndex] = {
            ...MOCK_SUPPLIERS[supplierIndex],
            qualificationStatus: 'QUALIFIED',
            qualificationScore: qualification.overallScore,
            qualificationDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      }

      return {
        data: MOCK_QUALIFICATIONS[index],
        status: 200,
      };
    }
  },

  // Risk Assessments
  getRiskAssessments: async (
    params: PaginationParams & { supplierId?: string; riskLevel?: RiskLevel }
  ): Promise<PaginatedResponse<SupplierRiskAssessment>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-risk-assessments', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for risk assessments');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_RISK_ASSESSMENTS];

      if (params.supplierId) {
        filteredData = filteredData.filter(assessment => assessment.supplierId === params.supplierId);
      }
      if (params.riskLevel) {
        filteredData = filteredData.filter(assessment => assessment.overallRiskLevel === params.riskLevel);
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getRiskAssessmentById: async (id: string): Promise<ApiResponse<SupplierRiskAssessment>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-risk-assessments/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for risk assessment details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const assessment = MOCK_RISK_ASSESSMENTS.find(assessment => assessment.id === id);

      if (!assessment) {
        throw new Error('Risk assessment not found');
      }

      return {
        data: assessment,
        status: 200,
      };
    }
  },

  createRiskAssessment: async (assessment: Omit<SupplierRiskAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SupplierRiskAssessment>> => {
    try {
      // First try to create in Supabase
      const response = await api.post('/api/v1/supplier-risk-assessments', assessment);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for risk assessment creation');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAssessment: SupplierRiskAssessment = {
        id: `risk-${MOCK_RISK_ASSESSMENTS.length + 1}`,
        ...assessment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_RISK_ASSESSMENTS.push(newAssessment);

      // Update supplier risk assessment
      const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === assessment.supplierId);
      if (supplierIndex !== -1) {
        MOCK_SUPPLIERS[supplierIndex] = {
          ...MOCK_SUPPLIERS[supplierIndex],
          riskAssessment: {
            overallRiskLevel: assessment.overallRiskLevel,
            lastAssessmentDate: assessment.assessmentDate,
            nextAssessmentDate: assessment.nextAssessmentDate,
            categories: assessment.categories.map(category => ({
              category: category.category,
              riskLevel: category.riskLevel,
              score: category.score,
              factors: category.factors,
              mitigationPlan: assessment.mitigationPlans?.find(plan => plan.riskCategory === category.category)?.description,
            })),
          },
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        data: newAssessment,
        status: 201,
      };
    }
  },

  updateRiskAssessment: async (id: string, assessment: Partial<SupplierRiskAssessment>): Promise<ApiResponse<SupplierRiskAssessment>> => {
    try {
      // First try to update in Supabase
      const response = await api.put(`/api/v1/supplier-risk-assessments/${id}`, assessment);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for risk assessment update');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = MOCK_RISK_ASSESSMENTS.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Risk assessment not found');
      }

      MOCK_RISK_ASSESSMENTS[index] = {
        ...MOCK_RISK_ASSESSMENTS[index],
        ...assessment,
        updatedAt: new Date().toISOString(),
      };

      // Update supplier risk assessment if overall risk level changed
      if (assessment.overallRiskLevel) {
        const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === MOCK_RISK_ASSESSMENTS[index].supplierId);
        if (supplierIndex !== -1 && MOCK_SUPPLIERS[supplierIndex].riskAssessment) {
          MOCK_SUPPLIERS[supplierIndex] = {
            ...MOCK_SUPPLIERS[supplierIndex],
            riskAssessment: {
              ...MOCK_SUPPLIERS[supplierIndex].riskAssessment!,
              overallRiskLevel: assessment.overallRiskLevel,
              lastAssessmentDate: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
      }

      return {
        data: MOCK_RISK_ASSESSMENTS[index],
        status: 200,
      };
    }
  },

  // Development Plans
  getDevelopmentPlans: async (
    params: PaginationParams & { supplierId?: string; status?: DevelopmentStatus; area?: string }
  ): Promise<PaginatedResponse<SupplierDevelopmentPlan>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-development-plans', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for development plans');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_DEVELOPMENT_PLANS];

      if (params.supplierId) {
        filteredData = filteredData.filter(plan => plan.supplierId === params.supplierId);
      }
      if (params.status) {
        filteredData = filteredData.filter(plan => plan.status === params.status);
      }
      if (params.area) {
        filteredData = filteredData.filter(plan => plan.area === params.area);
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getDevelopmentPlanById: async (id: string): Promise<ApiResponse<SupplierDevelopmentPlan>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-development-plans/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for development plan details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const plan = MOCK_DEVELOPMENT_PLANS.find(plan => plan.id === id);

      if (!plan) {
        throw new Error('Development plan not found');
      }

      return {
        data: plan,
        status: 200,
      };
    }
  },

  createDevelopmentPlan: async (plan: Omit<SupplierDevelopmentPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SupplierDevelopmentPlan>> => {
    try {
      // First try to create in Supabase
      const response = await api.post('/api/v1/supplier-development-plans', plan);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for development plan creation');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPlan: SupplierDevelopmentPlan = {
        id: `dev-plan-${MOCK_DEVELOPMENT_PLANS.length + 1}`,
        ...plan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      MOCK_DEVELOPMENT_PLANS.push(newPlan);

      // Update supplier development plans
      const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === plan.supplierId);
      if (supplierIndex !== -1) {
        const currentPlans = MOCK_SUPPLIERS[supplierIndex].developmentPlans || [];
        MOCK_SUPPLIERS[supplierIndex] = {
          ...MOCK_SUPPLIERS[supplierIndex],
          developmentPlans: [
            ...currentPlans,
            {
              id: newPlan.id,
              title: newPlan.title,
              area: newPlan.area,
              description: newPlan.description,
              baseline: newPlan.baseline,
              target: newPlan.target,
              startDate: newPlan.startDate,
              targetDate: newPlan.targetDate,
              status: newPlan.status,
              progress: newPlan.progress,
              milestones: newPlan.milestones,
              notes: newPlan.notes,
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        data: newPlan,
        status: 201,
      };
    }
  },

  updateDevelopmentPlan: async (id: string, plan: Partial<SupplierDevelopmentPlan>): Promise<ApiResponse<SupplierDevelopmentPlan>> => {
    try {
      // First try to update in Supabase
      const response = await api.put(`/api/v1/supplier-development-plans/${id}`, plan);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for development plan update');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = MOCK_DEVELOPMENT_PLANS.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Development plan not found');
      }

      MOCK_DEVELOPMENT_PLANS[index] = {
        ...MOCK_DEVELOPMENT_PLANS[index],
        ...plan,
        updatedAt: new Date().toISOString(),
      };

      // Update supplier development plans if status changed
      if (plan.status) {
        const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === MOCK_DEVELOPMENT_PLANS[index].supplierId);
        if (supplierIndex !== -1 && MOCK_SUPPLIERS[supplierIndex].developmentPlans) {
          const planIndex = MOCK_SUPPLIERS[supplierIndex].developmentPlans!.findIndex(p => p.id === id);
          if (planIndex !== -1) {
            const updatedPlans = [...MOCK_SUPPLIERS[supplierIndex].developmentPlans!];
            updatedPlans[planIndex] = {
              ...updatedPlans[planIndex],
              status: plan.status,
              progress: plan.progress || updatedPlans[planIndex].progress,
            };
            
            MOCK_SUPPLIERS[supplierIndex] = {
              ...MOCK_SUPPLIERS[supplierIndex],
              developmentPlans: updatedPlans,
              updatedAt: new Date().toISOString(),
            };
          }
        }
      }

      return {
        data: MOCK_DEVELOPMENT_PLANS[index],
        status: 200,
      };
    }
  },

  // Performance Management
  getSupplierPerformance: async (supplierId: string): Promise<ApiResponse<SupplierPerformance>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-performance/${supplierId}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier performance');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const performance = MOCK_PERFORMANCE_DATA.find(p => p.supplierId === supplierId);

      if (!performance) {
        throw new Error('Supplier performance data not found');
      }

      return {
        data: performance,
        status: 200,
      };
    }
  },

  updateSupplierPerformance: async (supplierId: string, data: Partial<SupplierPerformance>): Promise<ApiResponse<SupplierPerformance>> => {
    try {
      // First try to update in Supabase
      const response = await api.put(`/api/v1/supplier-performance/${supplierId}`, data);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier performance update');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const index = MOCK_PERFORMANCE_DATA.findIndex(p => p.supplierId === supplierId);
      if (index === -1) {
        throw new Error('Supplier performance data not found');
      }

      MOCK_PERFORMANCE_DATA[index] = {
        ...MOCK_PERFORMANCE_DATA[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // Update supplier performance data
      const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === supplierId);
      if (supplierIndex !== -1) {
        MOCK_SUPPLIERS[supplierIndex] = {
          ...MOCK_SUPPLIERS[supplierIndex],
          performance: {
            qualityScore: data.qualityScore || MOCK_PERFORMANCE_DATA[index].qualityScore,
            deliveryScore: data.deliveryScore || MOCK_PERFORMANCE_DATA[index].deliveryScore,
            costScore: data.costScore || MOCK_PERFORMANCE_DATA[index].costScore,
            overallScore: data.overallScore || MOCK_PERFORMANCE_DATA[index].overallScore,
            lastUpdated: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };
      }

      return {
        data: MOCK_PERFORMANCE_DATA[index],
        status: 200,
      };
    }
  },

  // Sustainability
  getSupplierSustainability: async (
    params: PaginationParams & { supplierId?: string; rating?: string; status?: string }
  ): Promise<PaginatedResponse<SupplierSustainability>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-sustainability', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for sustainability');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_SUSTAINABILITY_DATA];

      if (params.supplierId) {
        filteredData = filteredData.filter(item => item.supplierId === params.supplierId);
      }
      if (params.rating) {
        filteredData = filteredData.filter(item => item.overallRating === params.rating);
      }
      if (params.status) {
        filteredData = filteredData.filter(item => item.complianceStatus === params.status);
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getSupplierSustainabilityById: async (id: string): Promise<ApiResponse<SupplierSustainability>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-sustainability/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for sustainability details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const sustainability = MOCK_SUSTAINABILITY_DATA.find(s => s.id === id);

      if (!sustainability) {
        throw new Error('Supplier sustainability data not found');
      }

      return {
        data: sustainability,
        status: 200,
      };
    }
  },

  // Quality Management
  getSupplierQualityRecords: async (
    params: PaginationParams & { supplierId?: string; status?: string }
  ): Promise<PaginatedResponse<SupplierQualityRecord>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-quality', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for quality records');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_QUALITY_DATA];

      if (params.supplierId) {
        filteredData = filteredData.filter(item => item.supplierId === params.supplierId);
      }
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getSupplierQualityRecordById: async (id: string): Promise<ApiResponse<SupplierQualityRecord>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-quality/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for quality record details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const qualityRecord = MOCK_QUALITY_DATA.find(q => q.id === id);

      if (!qualityRecord) {
        throw new Error('Supplier quality record not found');
      }

      return {
        data: qualityRecord,
        status: 200,
      };
    }
  },

  // Financial Health
  getSupplierFinancialHealth: async (
    params: PaginationParams & { supplierId?: string; status?: string; trend?: string }
  ): Promise<PaginatedResponse<SupplierFinancialHealth>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-financial-health', { params });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for financial health');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredData = [...MOCK_FINANCIAL_DATA];

      if (params.supplierId) {
        filteredData = filteredData.filter(item => item.supplierId === params.supplierId);
      }
      if (params.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      if (params.trend) {
        filteredData = filteredData.filter(item => item.trend === params.trend);
      }

      // Apply sorting
      if (params.sortBy) {
        filteredData.sort((a: any, b: any) => {
          const aValue = a[params.sortBy!];
          const bValue = b[params.sortBy!];
          return params.sortOrder === 'desc' ? 
            (bValue > aValue ? 1 : -1) : 
            (aValue > bValue ? 1 : -1);
        });
      }

      const start = (params.page - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        items: paginatedData,
        total: filteredData.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filteredData.length / params.pageSize),
      };
    }
  },

  getSupplierFinancialHealthById: async (id: string): Promise<ApiResponse<SupplierFinancialHealth>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-financial-health/${id}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for financial health details');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      const financialHealth = MOCK_FINANCIAL_DATA.find(f => f.id === id);

      if (!financialHealth) {
        throw new Error('Supplier financial health data not found');
      }

      return {
        data: financialHealth,
        status: 200,
      };
    }
  },

  // Supplier Analytics
  getSupplierAnalytics: async (): Promise<ApiResponse<{
    supplierCounts: {
      total: number;
      active: number;
      inactive: number;
      pending: number;
    };
    suppliersByType: Record<string, number>;
    suppliersByRiskLevel: Record<string, number>;
    performanceAverages: {
      quality: number;
      delivery: number;
      cost: number;
      overall: number;
    };
    topSuppliers: Array<{
      id: string;
      name: string;
      spend: number;
      performance: number;
    }>;
    qualificationStats: {
      qualified: number;
      inProgress: number;
      notStarted: number;
      disqualified: number;
    };
    sustainabilityStats: {
      compliant: number;
      partiallyCompliant: number;
      nonCompliant: number;
      pendingReview: number;
      avgCarbonFootprint: number;
      avgRenewableEnergy: number;
    };
    qualityStats: {
      approved: number;
      conditional: number;
      rejected: number;
      pending: number;
      avgQualityScore: number;
      avgDefectRate: number;
    };
    financialStats: {
      strong: number;
      stable: number;
      moderate: number;
      weak: number;
      critical: number;
      avgFinancialStability: number;
    };
  }>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get('/api/v1/supplier-analytics');
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier analytics');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate supplier counts
      const supplierCounts = {
        total: MOCK_SUPPLIERS.length,
        active: MOCK_SUPPLIERS.filter(s => s.status === 'ACTIVE').length,
        inactive: MOCK_SUPPLIERS.filter(s => s.status === 'INACTIVE').length,
        pending: MOCK_SUPPLIERS.filter(s => s.status === 'PENDING_APPROVAL').length,
      };

      // Count suppliers by type
      const suppliersByType = MOCK_SUPPLIERS.reduce((acc, supplier) => {
        acc[supplier.type] = (acc[supplier.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Count suppliers by risk level
      const suppliersByRiskLevel = MOCK_SUPPLIERS.reduce((acc, supplier) => {
        if (supplier.riskAssessment) {
          acc[supplier.riskAssessment.overallRiskLevel] = (acc[supplier.riskAssessment.overallRiskLevel] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate performance averages
      const performanceSuppliers = MOCK_SUPPLIERS.filter(s => s.performance);
      const performanceAverages = {
        quality: performanceSuppliers.reduce((sum, s) => sum + s.performance!.qualityScore, 0) / (performanceSuppliers.length || 1),
        delivery: performanceSuppliers.reduce((sum, s) => sum + s.performance!.deliveryScore, 0) / (performanceSuppliers.length || 1),
        cost: performanceSuppliers.reduce((sum, s) => sum + s.performance!.costScore, 0) / (performanceSuppliers.length || 1),
        overall: performanceSuppliers.reduce((sum, s) => sum + s.performance!.overallScore, 0) / (performanceSuppliers.length || 1),
      };

      // Get top suppliers
      const topSuppliers = MOCK_SUPPLIERS
        .filter(s => s.performance)
        .map(s => ({
          id: s.id,
          name: s.name,
          spend: s.annualRevenue ? s.annualRevenue / 10 : 100000, // Mock spend as 10% of their revenue
          performance: s.performance!.overallScore,
        }))
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 5);

      // Qualification stats
      const qualificationStats = {
        qualified: MOCK_SUPPLIERS.filter(s => s.qualificationStatus === 'QUALIFIED').length,
        inProgress: MOCK_SUPPLIERS.filter(s => s.qualificationStatus === 'IN_PROGRESS').length,
        notStarted: MOCK_SUPPLIERS.filter(s => !s.qualificationStatus || s.qualificationStatus === 'NOT_STARTED').length,
        disqualified: MOCK_SUPPLIERS.filter(s => s.qualificationStatus === 'DISQUALIFIED').length,
      };

      // Sustainability stats
      const sustainabilityStats = {
        compliant: MOCK_SUSTAINABILITY_DATA.filter(s => s.complianceStatus === 'COMPLIANT').length,
        partiallyCompliant: MOCK_SUSTAINABILITY_DATA.filter(s => s.complianceStatus === 'PARTIALLY_COMPLIANT').length,
        nonCompliant: MOCK_SUSTAINABILITY_DATA.filter(s => s.complianceStatus === 'NON_COMPLIANT').length,
        pendingReview: MOCK_SUSTAINABILITY_DATA.filter(s => s.complianceStatus === 'PENDING_REVIEW').length,
        avgCarbonFootprint: MOCK_SUSTAINABILITY_DATA.reduce((sum, s) => sum + s.carbonFootprint, 0) / MOCK_SUSTAINABILITY_DATA.length,
        avgRenewableEnergy: MOCK_SUSTAINABILITY_DATA.reduce((sum, s) => sum + s.renewableEnergy, 0) / MOCK_SUSTAINABILITY_DATA.length,
      };

      // Quality stats
      const qualityStats = {
        approved: MOCK_QUALITY_DATA.filter(q => q.status === 'APPROVED').length,
        conditional: MOCK_QUALITY_DATA.filter(q => q.status === 'CONDITIONAL').length,
        rejected: MOCK_QUALITY_DATA.filter(q => q.status === 'REJECTED').length,
        pending: MOCK_QUALITY_DATA.filter(q => q.status === 'PENDING').length,
        avgQualityScore: MOCK_QUALITY_DATA.reduce((sum, q) => sum + q.qualityScore, 0) / MOCK_QUALITY_DATA.length,
        avgDefectRate: MOCK_QUALITY_DATA.reduce((sum, q) => sum + q.defectRate, 0) / MOCK_QUALITY_DATA.length,
      };

      // Financial stats
      const financialStats = {
        strong: MOCK_FINANCIAL_DATA.filter(f => f.status === 'STRONG').length,
        stable: MOCK_FINANCIAL_DATA.filter(f => f.status === 'STABLE').length,
        moderate: MOCK_FINANCIAL_DATA.filter(f => f.status === 'MODERATE').length,
        weak: MOCK_FINANCIAL_DATA.filter(f => f.status === 'WEAK').length,
        critical: MOCK_FINANCIAL_DATA.filter(f => f.status === 'CRITICAL').length,
        avgFinancialStability: MOCK_FINANCIAL_DATA.reduce((sum, f) => sum + f.financialStability, 0) / MOCK_FINANCIAL_DATA.length,
      };

      return {
        data: {
          supplierCounts,
          suppliersByType,
          suppliersByRiskLevel,
          performanceAverages,
          topSuppliers,
          qualificationStats,
          sustainabilityStats,
          qualityStats,
          financialStats,
        },
        status: 200,
      };
    }
  },

  // Document Management
  uploadDocument: async (
    supplierId: string,
    document: {
      name: string;
      type: 'REGISTRATION' | 'FINANCIAL' | 'CERTIFICATION' | 'COMPLIANCE' | 'CONTRACT' | 'OTHER';
      file: File;
      expiryDate?: string;
    }
  ): Promise<ApiResponse<Supplier['documents'][0]>> => {
    try {
      // First try to upload to Supabase
      const formData = new FormData();
      formData.append('file', document.file);
      formData.append('name', document.name);
      formData.append('type', document.type);
      if (document.expiryDate) {
        formData.append('expiryDate', document.expiryDate);
      }
      
      const response = await api.post(`/api/v1/suppliers/${supplierId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for document upload');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDocument = {
        id: `doc-${Date.now()}`,
        name: document.name,
        type: document.type,
        url: `https://example.com/documents/${document.file.name}`,
        uploadedBy: {
          id: 'user-1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          name: 'John Doe',
          roles: ['admin'],
          permissions: ['manage_suppliers'],
          status: 'active',
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        uploadedAt: new Date().toISOString(),
        expiryDate: document.expiryDate,
        status: 'ACTIVE',
      };

      const supplierIndex = MOCK_SUPPLIERS.findIndex(s => s.id === supplierId);
      if (supplierIndex !== -1) {
        MOCK_SUPPLIERS[supplierIndex].documents.push(newDocument);
      }

      return {
        data: newDocument,
        status: 201,
      };
    }
  },

  // Supplier Portal
  registerSupplier: async (data: {
    name: string;
    taxId: string;
    registrationNumber: string;
    contactEmail: string;
    contactName: string;
    contactPhone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  }): Promise<ApiResponse<{ registrationId: string; message: string }>> => {
    try {
      // First try to register in Supabase
      const response = await api.post('/api/v1/supplier-registration', data);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for supplier registration');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        data: {
          registrationId: `reg-${Date.now()}`,
          message: 'Registration submitted successfully. You will receive an email with further instructions.',
        },
        status: 201,
      };
    }
  },

  getSupplierRegistrationStatus: async (registrationId: string): Promise<ApiResponse<{
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message: string;
    nextSteps?: string;
  }>> => {
    try {
      // First try to fetch from Supabase
      const response = await api.get(`/api/v1/supplier-registration/${registrationId}`);
      return response.data;
    } catch (error) {
      console.log('Falling back to mock data for registration status');
      
      // Fall back to mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        data: {
          status: 'PENDING',
          message: 'Your registration is being reviewed by our team.',
          nextSteps: 'You will receive an email once your registration has been processed.',
        },
        status: 200,
      };
    }
  },
};