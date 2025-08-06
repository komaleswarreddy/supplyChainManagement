import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Supplier,
  SupplierFilters,
  SupplierFormData,
  SupplierQualification,
  SupplierRiskAssessment,
  SupplierDevelopmentPlan,
  SupplierPerformance,
  SupplierSustainability,
  SupplierQualityRecord,
  SupplierFinancialHealth,
  AssessmentStatus,
  RiskLevel,
  DevelopmentStatus
} from '@/types/supplier';

// Configuration
const API_ENDPOINTS = {
  SUPPLIERS: '/api/suppliers',
  SUPPLIER_QUALIFICATIONS: '/api/suppliers/qualifications',
  SUPPLIER_RISK_ASSESSMENTS: '/api/suppliers/risk-assessments',
  SUPPLIER_DEVELOPMENT_PLANS: '/api/suppliers/development-plans',
  SUPPLIER_PERFORMANCE: (id: string) => `/api/suppliers/${id}/performance`,
  SUPPLIER_SUSTAINABILITY: (id: string) => `/api/suppliers/${id}/sustainability`,
  SUPPLIER_QUALITY_RECORDS: (id: string) => `/api/suppliers/${id}/quality-records`,
  SUPPLIER_FINANCIAL_HEALTH: (id: string) => `/api/suppliers/${id}/financial-health`,
  SUPPLIER_ANALYTICS: '/api/suppliers/analytics',
  SUPPLIER_DOCUMENTS: (id: string) => `/api/suppliers/${id}/documents`,
  SUPPLIER_REGISTRATION: '/api/suppliers/registration',
} as const;

// Enhanced mock data for development/fallback
const MOCK_SUPPLIERS: Supplier[] = Array.from({ length: 100 }, (_, i) => {
  const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  const annualRevenue = Math.floor(Math.random() * 100000000) + 1000000;
  const employeeCount = Math.floor(Math.random() * 5000) + 10;
  
  return {
    id: `sup-${i + 1}`,
    name: `${['Acme Corp', 'Global Solutions Inc', 'Tech Innovations Ltd', 'Industrial Supply Co', 'Premium Services Group', 'Advanced Manufacturing', 'Quality Products LLC', 'Strategic Partners Inc', 'Excellence Enterprises', 'Dynamic Systems'][i % 10]} ${Math.floor(i / 10) + 1}`,
    code: `SUP-${String(i + 1).padStart(4, '0')}`,
    type: ['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER'][i % 5],
    status: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISQUALIFIED'][i % 7],
    taxId: `${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
    registrationNumber: `REG-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
    website: `https://${['acme', 'global', 'tech', 'industrial', 'premium', 'advanced', 'quality', 'strategic', 'excellence', 'dynamic'][i % 10]}.example.com`,
    industry: ['Technology', 'Manufacturing', 'Healthcare', 'Automotive', 'Aerospace', 'Construction', 'Energy', 'Telecommunications', 'Financial Services', 'Retail'][i % 10],
    description: `${['Leading provider of innovative solutions', 'Specialized manufacturer with global reach', 'Premium service provider', 'Industry leader in quality products', 'Trusted partner for enterprise solutions'][i % 5]}`,
    yearEstablished: 1990 + Math.floor(Math.random() * 33),
    annualRevenue,
    employeeCount,
    businessClassifications: [
      ...(Math.random() > 0.7 ? ['LARGE_ENTERPRISE'] : []),
      ...(Math.random() > 0.8 ? ['SMALL_BUSINESS'] : []),
      ...(Math.random() > 0.9 ? ['MINORITY_OWNED'] : []),
      ...(Math.random() > 0.85 ? ['WOMEN_OWNED'] : []),
      ...(Math.random() > 0.95 ? ['VETERAN_OWNED'] : []),
    ],
    categories: [
      ['Office Supplies', 'IT Equipment', 'Software', 'Professional Services', 'Manufacturing', 'Construction', 'Healthcare', 'Automotive', 'Energy', 'Telecommunications'][i % 10],
      ...(Math.random() > 0.5 ? [['Raw Materials', 'Components', 'Tools', 'Consulting', 'Maintenance', 'Training', 'Logistics', 'Security', 'Facilities', 'Marketing'][i % 10]] : []),
    ],
    paymentTerms: ['NET_30', 'NET_60', 'NET_90', 'COD', 'ADVANCE'][i % 5],
    preferredCurrency: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'][i % 5],
    addresses: [
      {
        id: `addr-${i}-1`,
        type: 'HEADQUARTERS',
        street: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Blvd', 'Elm Way', 'Park Dr', 'First St', 'Second Ave', 'Third Rd', 'Fourth Blvd'][i % 10]}`,
        city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'][i % 10],
        state: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA'][i % 10],
        country: 'United States',
        postalCode: String(Math.floor(Math.random() * 90000) + 10000),
        isPrimary: true,
      },
      ...(Math.random() > 0.6 ? [
        {
          id: `addr-${i}-2`,
          type: 'WAREHOUSE',
          street: `${Math.floor(Math.random() * 9999) + 1} Industrial Blvd`,
          city: ['Miami', 'Seattle', 'Denver', 'Atlanta', 'Boston'][i % 5],
          state: ['FL', 'WA', 'CO', 'GA', 'MA'][i % 5],
          country: 'United States',
          postalCode: String(Math.floor(Math.random() * 90000) + 10000),
          isPrimary: false,
        },
      ] : []),
    ],
    contacts: [
      {
        id: `contact-${i}-1`,
        type: 'PRIMARY',
        name: `${['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emily', 'Chris', 'Amanda'][i % 10]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'][i % 10]}`,
        title: ['CEO', 'Sales Manager', 'Account Manager', 'Business Development', 'Operations Director'][i % 5],
        email: `${['john', 'jane', 'mike', 'sarah', 'david', 'lisa', 'tom', 'emily', 'chris', 'amanda'][i % 10]}.${['smith', 'johnson', 'williams', 'brown', 'jones'][i % 5]}@${['acme', 'global', 'tech', 'industrial', 'premium'][i % 5]}.example.com`,
        phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        mobile: Math.random() > 0.5 ? `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` : undefined,
        isPrimary: true,
      },
      ...(Math.random() > 0.7 ? [
        {
          id: `contact-${i}-2`,
          type: 'TECHNICAL',
          name: `${['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'][i % 5]} ${['Wilson', 'Anderson', 'Thomas', 'Jackson', 'White'][i % 5]}`,
          title: 'Technical Manager',
          email: `tech.support@${['acme', 'global', 'tech', 'industrial', 'premium'][i % 5]}.example.com`,
          phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          isPrimary: false,
        },
      ] : []),
    ],
    bankInformation: [
      {
        id: `bank-${i}-1`,
        bankName: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'US Bank'][i % 5],
        accountNumber: `****${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        routingNumber: String(Math.floor(Math.random() * 900000000) + 100000000),
        accountType: ['CHECKING', 'SAVINGS'][i % 2],
        currency: 'USD',
        isPrimary: true,
      },
    ],
    documents: [
      {
        id: `doc-${i}-1`,
        name: 'Business Registration Certificate',
        type: 'REGISTRATION',
        size: Math.floor(Math.random() * 5000000) + 100000,
        uploadedAt: createdDate.toISOString(),
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'VERIFIED',
        uploadedBy: {
          id: 'admin-1',
          name: 'Admin User',
        },
      },
      ...(Math.random() > 0.5 ? [
        {
          id: `doc-${i}-2`,
          name: 'ISO 9001 Certificate',
          type: 'CERTIFICATION',
          size: Math.floor(Math.random() * 3000000) + 100000,
          uploadedAt: createdDate.toISOString(),
          expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'VERIFIED',
          uploadedBy: {
            id: 'admin-1',
            name: 'Admin User',
          },
        },
      ] : []),
    ],
    qualificationStatus: ['PENDING', 'QUALIFIED', 'DISQUALIFIED', 'EXPIRED'][i % 4],
    riskAssessment: {
      overallRiskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4] as RiskLevel,
      financialRisk: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
      operationalRisk: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
      complianceRisk: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
      reputationalRisk: ['LOW', 'MEDIUM', 'HIGH'][i % 3] as RiskLevel,
      lastAssessmentDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      nextAssessmentDate: new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      assessor: {
        id: 'assessor-1',
        name: 'Risk Assessor',
        email: 'risk.assessor@example.com',
      },
    },
    performanceMetrics: {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
      qualityScore: Math.floor(Math.random() * 40) + 60,
      deliveryScore: Math.floor(Math.random() * 40) + 60,
      serviceScore: Math.floor(Math.random() * 40) + 60,
      costScore: Math.floor(Math.random() * 40) + 60,
      onTimeDeliveryRate: Math.floor(Math.random() * 30) + 70, // 70-100%
      defectRate: Math.random() * 5, // 0-5%
      responseTime: Math.floor(Math.random() * 48) + 2, // 2-50 hours
      lastEvaluationDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    sustainabilityMetrics: Math.random() > 0.3 ? {
      carbonFootprint: Math.floor(Math.random() * 10000) + 1000,
      energyEfficiencyRating: ['A', 'B', 'C', 'D'][i % 4],
      wasteReductionPercentage: Math.floor(Math.random() * 50) + 10,
      renewableEnergyUsage: Math.floor(Math.random() * 80) + 10,
      sustainabilityCertifications: [
        ...(Math.random() > 0.5 ? ['ISO 14001'] : []),
        ...(Math.random() > 0.7 ? ['LEED Certified'] : []),
        ...(Math.random() > 0.8 ? ['Energy Star'] : []),
      ],
      lastAuditDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    } : undefined,
    contractInfo: Math.random() > 0.4 ? {
      contractType: ['MASTER_AGREEMENT', 'PURCHASE_AGREEMENT', 'SERVICE_AGREEMENT'][i % 3],
      contractValue: annualRevenue * (Math.random() * 0.1 + 0.05), // 5-15% of annual revenue
      contractStartDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      contractEndDate: new Date(Date.now() + Math.random() * 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
      renewalTerms: ['AUTOMATIC', 'MANUAL', 'NON_RENEWABLE'][i % 3],
      paymentTerms: ['NET_30', 'NET_60', 'NET_90'][i % 3],
      currency: 'USD',
    } : undefined,
    notes: Math.random() > 0.6 ? `${['Preferred supplier for critical components', 'Excellent track record in quality delivery', 'Strategic partner for innovation projects', 'Cost-effective solution provider', 'Reliable service partner'][i % 5]}` : undefined,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date(createdDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

// Mock data for qualifications, assessments, etc.
const MOCK_QUALIFICATIONS: SupplierQualification[] = Array.from({ length: 50 }, (_, i) => ({
  id: `qual-${i + 1}`,
  supplierId: `sup-${(i % 20) + 1}`,
  supplierName: `Supplier ${(i % 20) + 1}`,
  status: ['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'EXPIRED'][i % 5] as AssessmentStatus,
  qualificationType: ['INITIAL', 'RENEWAL', 'RE_QUALIFICATION'][i % 3],
  startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
  completionDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : undefined,
  expiryDate: new Date(Date.now() + Math.random() * 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
  score: Math.random() > 0.3 ? Math.floor(Math.random() * 40) + 60 : undefined,
  maxScore: 100,
  categories: [
    {
      name: 'Financial Stability',
      score: Math.floor(Math.random() * 40) + 60,
      maxScore: 100,
      criteria: [
        { name: 'Credit Rating', score: Math.floor(Math.random() * 25) + 75, maxScore: 100, weight: 0.4 },
        { name: 'Financial Statements', score: Math.floor(Math.random() * 25) + 75, maxScore: 100, weight: 0.6 },
      ],
    },
    {
      name: 'Quality Management',
      score: Math.floor(Math.random() * 40) + 60,
      maxScore: 100,
      criteria: [
        { name: 'ISO Certification', score: Math.floor(Math.random() * 25) + 75, maxScore: 100, weight: 0.5 },
        { name: 'Quality Processes', score: Math.floor(Math.random() * 25) + 75, maxScore: 100, weight: 0.5 },
      ],
    },
  ],
  assessor: {
    id: 'assessor-1',
    name: 'Qualification Assessor',
    email: 'assessor@example.com',
  },
  comments: Math.random() > 0.5 ? `Assessment comments for qualification ${i + 1}` : undefined,
  createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Service class for Supplier operations
export class SupplierService {
  /**
   * Get all suppliers with pagination and filters
   */
  static async getSuppliers(params: PaginationParams & SupplierFilters): Promise<PaginatedResponse<Supplier>> {
    try {
      const response = await api.get<PaginatedResponse<Supplier>>(API_ENDPOINTS.SUPPLIERS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
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
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(supplier => 
          supplier.name.toLowerCase().includes(searchLower) ||
          supplier.code.toLowerCase().includes(searchLower) ||
          supplier.industry?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const response = await api.get<ApiResponse<Supplier>>(`${API_ENDPOINTS.SUPPLIERS}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const supplier = MOCK_SUPPLIERS.find(s => s.id === id);
      if (!supplier) {
        throw new Error(`Supplier with ID ${id} not found`);
      }
      
      return {
        data: supplier,
        status: 200,
      };
    }
  }

  /**
   * Create new supplier
   */
  static async createSupplier(data: SupplierFormData): Promise<ApiResponse<Supplier>> {
    try {
      const response = await api.post<ApiResponse<Supplier>>(API_ENDPOINTS.SUPPLIERS, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newSupplier: Supplier = {
        id: `sup-${Date.now()}`,
        code: `SUP-${String(MOCK_SUPPLIERS.length + 1).padStart(4, '0')}`,
        status: 'DRAFT',
        qualificationStatus: 'PENDING',
        riskAssessment: {
          overallRiskLevel: 'MEDIUM',
          financialRisk: 'MEDIUM',
          operationalRisk: 'MEDIUM',
          complianceRisk: 'MEDIUM',
          reputationalRisk: 'MEDIUM',
          lastAssessmentDate: new Date().toISOString(),
          nextAssessmentDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          assessor: {
            id: 'current-user',
            name: 'Current User',
            email: 'user@example.com',
          },
        },
        performanceMetrics: {
          overallScore: 75,
          qualityScore: 75,
          deliveryScore: 75,
          serviceScore: 75,
          costScore: 75,
          onTimeDeliveryRate: 85,
          defectRate: 2.5,
          responseTime: 24,
          lastEvaluationDate: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      
      MOCK_SUPPLIERS.unshift(newSupplier);
      
      return {
        data: newSupplier,
        status: 201,
      };
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: Partial<SupplierFormData>): Promise<ApiResponse<Supplier>> {
    try {
      const response = await api.put<ApiResponse<Supplier>>(`${API_ENDPOINTS.SUPPLIERS}/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock update:', error);
      
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Supplier with ID ${id} not found`);
      }
      
      MOCK_SUPPLIERS[index] = {
        ...MOCK_SUPPLIERS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        data: MOCK_SUPPLIERS[index],
        status: 200,
      };
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete<ApiResponse<void>>(`${API_ENDPOINTS.SUPPLIERS}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock deletion:', error);
      
      const index = MOCK_SUPPLIERS.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Supplier with ID ${id} not found`);
      }
      
      MOCK_SUPPLIERS.splice(index, 1);
      
      return {
        data: undefined,
        status: 204,
      };
    }
  }

  /**
   * Get supplier qualifications
   */
  static async getQualifications(params: PaginationParams & { supplierId?: string; status?: AssessmentStatus }): Promise<PaginatedResponse<SupplierQualification>> {
    try {
      const response = await api.get<PaginatedResponse<SupplierQualification>>(API_ENDPOINTS.SUPPLIER_QUALIFICATIONS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_QUALIFICATIONS];
      
      if (params.supplierId) {
        filteredData = filteredData.filter(q => q.supplierId === params.supplierId);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(q => q.status === params.status);
      }
      
      // Apply pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = filteredData.slice(offset, offset + pageSize);
      
      return {
        items,
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize),
      };
    }
  }

  /**
   * Get supplier analytics
   */
  static async getSupplierAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    riskLevel?: string;
  }): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.SUPPLIER_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock analytics:', error);
      
      // Mock analytics data
      return {
        summary: {
          totalSuppliers: MOCK_SUPPLIERS.length,
          activeSuppliers: MOCK_SUPPLIERS.filter(s => s.status === 'ACTIVE').length,
          qualifiedSuppliers: MOCK_SUPPLIERS.filter(s => s.qualificationStatus === 'QUALIFIED').length,
          highRiskSuppliers: MOCK_SUPPLIERS.filter(s => s.riskAssessment?.overallRiskLevel === 'HIGH' || s.riskAssessment?.overallRiskLevel === 'CRITICAL').length,
          averagePerformanceScore: MOCK_SUPPLIERS.reduce((sum, s) => sum + (s.performanceMetrics?.overallScore || 0), 0) / MOCK_SUPPLIERS.length,
          totalSpend: MOCK_SUPPLIERS.reduce((sum, s) => sum + (s.contractInfo?.contractValue || 0), 0),
        },
        byStatus: [
          { status: 'ACTIVE', count: MOCK_SUPPLIERS.filter(s => s.status === 'ACTIVE').length },
          { status: 'INACTIVE', count: MOCK_SUPPLIERS.filter(s => s.status === 'INACTIVE').length },
          { status: 'PENDING_APPROVAL', count: MOCK_SUPPLIERS.filter(s => s.status === 'PENDING_APPROVAL').length },
          { status: 'SUSPENDED', count: MOCK_SUPPLIERS.filter(s => s.status === 'SUSPENDED').length },
        ],
        byRiskLevel: [
          { level: 'LOW', count: MOCK_SUPPLIERS.filter(s => s.riskAssessment?.overallRiskLevel === 'LOW').length },
          { level: 'MEDIUM', count: MOCK_SUPPLIERS.filter(s => s.riskAssessment?.overallRiskLevel === 'MEDIUM').length },
          { level: 'HIGH', count: MOCK_SUPPLIERS.filter(s => s.riskAssessment?.overallRiskLevel === 'HIGH').length },
          { level: 'CRITICAL', count: MOCK_SUPPLIERS.filter(s => s.riskAssessment?.overallRiskLevel === 'CRITICAL').length },
        ],
        byCategory: [
          { category: 'Office Supplies', count: MOCK_SUPPLIERS.filter(s => s.categories.includes('Office Supplies')).length },
          { category: 'IT Equipment', count: MOCK_SUPPLIERS.filter(s => s.categories.includes('IT Equipment')).length },
          { category: 'Software', count: MOCK_SUPPLIERS.filter(s => s.categories.includes('Software')).length },
          { category: 'Professional Services', count: MOCK_SUPPLIERS.filter(s => s.categories.includes('Professional Services')).length },
          { category: 'Manufacturing', count: MOCK_SUPPLIERS.filter(s => s.categories.includes('Manufacturing')).length },
        ],
        performanceTrends: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            averageScore: Math.floor(Math.random() * 20) + 70,
            onTimeDelivery: Math.floor(Math.random() * 20) + 75,
            qualityScore: Math.floor(Math.random() * 20) + 75,
          };
        }),
      };
    }
  }

  /**
   * Upload document for supplier
   */
  static async uploadDocument(
    supplierId: string,
    document: {
      name: string;
      type: 'REGISTRATION' | 'FINANCIAL' | 'CERTIFICATION' | 'COMPLIANCE' | 'CONTRACT' | 'OTHER';
      file: File;
      expiryDate?: string;
    }
  ): Promise<ApiResponse<Supplier['documents'][0]>> {
    try {
      const formData = new FormData();
      formData.append('file', document.file);
      formData.append('name', document.name);
      formData.append('type', document.type);
      if (document.expiryDate) {
        formData.append('expiryDate', document.expiryDate);
      }
      
      const response = await api.post<ApiResponse<Supplier['documents'][0]>>(
        API_ENDPOINTS.SUPPLIER_DOCUMENTS(supplierId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock upload:', error);
      
      const newDocument: Supplier['documents'][0] = {
        id: `doc-${Date.now()}`,
        name: document.name,
        type: document.type,
        size: document.file.size,
        uploadedAt: new Date().toISOString(),
        expiryDate: document.expiryDate,
        status: 'PENDING',
        uploadedBy: {
          id: 'current-user',
          name: 'Current User',
        },
      };
      
      // Update mock supplier
      const supplier = MOCK_SUPPLIERS.find(s => s.id === supplierId);
      if (supplier) {
        if (!supplier.documents) supplier.documents = [];
        supplier.documents.push(newDocument);
      }
      
      return {
        data: newDocument,
        status: 201,
      };
    }
  }

  /**
   * Register new supplier (supplier portal)
   */
  static async registerSupplier(data: {
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
  }): Promise<ApiResponse<{ registrationId: string; message: string }>> {
    try {
      const response = await api.post<ApiResponse<{ registrationId: string; message: string }>>(
        API_ENDPOINTS.SUPPLIER_REGISTRATION,
        data
      );
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock registration:', error);
      
      return {
        data: {
          registrationId: `reg-${Date.now()}`,
          message: 'Registration submitted successfully. You will receive an email with further instructions.',
        },
        status: 201,
      };
    }
  }

  /**
   * Get supplier registration status
   */
  static async getSupplierRegistrationStatus(registrationId: string): Promise<ApiResponse<{
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    message: string;
    nextSteps?: string;
  }>> {
    try {
      const response = await api.get<ApiResponse<{
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        message: string;
        nextSteps?: string;
      }>>(`${API_ENDPOINTS.SUPPLIER_REGISTRATION}/${registrationId}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock status:', error);
      
      return {
        data: {
          status: 'PENDING',
          message: 'Your registration is being reviewed by our team.',
          nextSteps: 'You will receive an email once your registration has been processed.',
        },
        status: 200,
      };
    }
  }
}

// Export service instance
export const supplierService = {
  getSuppliers: SupplierService.getSuppliers,
  getSupplierById: SupplierService.getSupplierById,
  createSupplier: SupplierService.createSupplier,
  updateSupplier: SupplierService.updateSupplier,
  deleteSupplier: SupplierService.deleteSupplier,
  getQualifications: SupplierService.getQualifications,
  getSupplierAnalytics: SupplierService.getSupplierAnalytics,
  uploadDocument: SupplierService.uploadDocument,
  registerSupplier: SupplierService.registerSupplier,
  getSupplierRegistrationStatus: SupplierService.getSupplierRegistrationStatus,
}; 