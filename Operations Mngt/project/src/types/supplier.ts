import type { User } from './user';

export type SupplierStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'DISQUALIFIED';

export type SupplierType = 
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'WHOLESALER'
  | 'RETAILER'
  | 'SERVICE_PROVIDER';

export type BusinessClassification = 
  | 'LARGE_ENTERPRISE'
  | 'SMALL_BUSINESS'
  | 'MINORITY_OWNED'
  | 'WOMEN_OWNED'
  | 'VETERAN_OWNED'
  | 'DISABLED_OWNED'
  | 'DISADVANTAGED_BUSINESS';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskCategory = 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'REPUTATIONAL' | 'GEOPOLITICAL';

export type AssessmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

export type DevelopmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export type Supplier = {
  id: string;
  name: string;
  code: string;
  type: SupplierType;
  status: SupplierStatus;
  taxId: string;
  registrationNumber: string;
  website?: string;
  industry?: string;
  description?: string;
  yearEstablished?: number;
  annualRevenue?: number;
  employeeCount?: number;
  businessClassifications?: BusinessClassification[];
  addresses: {
    type: 'HEADQUARTERS' | 'BILLING' | 'SHIPPING' | 'MANUFACTURING' | 'OTHER';
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isPrimary: boolean;
  }[];
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    isPrimary: boolean;
    department?: string;
  }[];
  categories: string[];
  certifications?: {
    name: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    documentUrl?: string;
  }[];
  bankInformation?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    currency: string;
    swiftCode?: string;
    iban?: string;
  };
  paymentTerms?: string;
  preferredCurrency?: string;
  onboardingDate?: string;
  qualificationStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'QUALIFIED' | 'DISQUALIFIED';
  qualificationScore?: number;
  qualificationDate?: string;
  riskAssessment?: {
    overallRiskLevel: RiskLevel;
    lastAssessmentDate: string;
    nextAssessmentDate: string;
    categories: {
      category: RiskCategory;
      riskLevel: RiskLevel;
      score: number;
      factors: {
        name: string;
        score: number;
        weight: number;
        notes?: string;
      }[];
      mitigationPlan?: string;
    }[];
  };
  performance?: {
    qualityScore: number;
    deliveryScore: number;
    costScore: number;
    overallScore: number;
    lastUpdated: string;
  };
  developmentPlans?: {
    id: string;
    title: string;
    area: 'QUALITY' | 'DELIVERY' | 'COST' | 'SUSTAINABILITY' | 'INNOVATION' | 'OTHER';
    description: string;
    baseline: number;
    target: number;
    startDate: string;
    targetDate: string;
    status: DevelopmentStatus;
    progress: number;
    milestones: {
      id: string;
      title: string;
      dueDate: string;
      status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
      completedDate?: string;
    }[];
    notes?: string;
  }[];
  documents: {
    id: string;
    name: string;
    type: 'REGISTRATION' | 'FINANCIAL' | 'CERTIFICATION' | 'COMPLIANCE' | 'CONTRACT' | 'OTHER';
    url: string;
    uploadedBy: User;
    uploadedAt: string;
    expiryDate?: string;
    status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  }[];
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedBy?: User;
  updatedAt: string;
  audit: {
    statusHistory: Array<{
      status: SupplierStatus;
      timestamp: string;
      user: {
        id: string;
        name: string;
      };
      comment?: string;
    }>;
  };
};

export type SupplierQualification = {
  id: string;
  supplierId: string;
  supplierName: string;
  status: AssessmentStatus;
  questionnaire: {
    id: string;
    name: string;
    sections: {
      id: string;
      title: string;
      weight: number;
      questions: {
        id: string;
        text: string;
        type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILE';
        options?: string[];
        required: boolean;
        weight: number;
        answer?: any;
        score?: number;
        maxScore: number;
        comments?: string;
      }[];
    }[];
  };
  requiredDocuments: {
    id: string;
    name: string;
    description?: string;
    required: boolean;
    documentUrl?: string;
    uploadedAt?: string;
    status: 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED';
    comments?: string;
  }[];
  overallScore?: number;
  maxPossibleScore: number;
  startedAt?: string;
  completedAt?: string;
  evaluatedBy?: User;
  evaluatedAt?: string;
  approvalWorkflow?: {
    currentLevel: number;
    maxLevels: number;
    levels: Array<{
      level: number;
      approver: {
        id: string;
        name: string;
        position: string;
        department: string;
      };
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      comment?: string;
      timestamp?: string;
    }>;
  };
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type SupplierRiskAssessment = {
  id: string;
  supplierId: string;
  supplierName: string;
  assessmentDate: string;
  status: AssessmentStatus;
  overallRiskLevel: RiskLevel;
  overallScore: number;
  categories: {
    category: RiskCategory;
    weight: number;
    score: number;
    riskLevel: RiskLevel;
    factors: {
      id: string;
      name: string;
      description?: string;
      weight: number;
      score: number;
      dataSource?: string;
      notes?: string;
    }[];
  }[];
  mitigationPlans: {
    id: string;
    riskCategory: RiskCategory;
    description: string;
    actions: {
      id: string;
      description: string;
      assignedTo: User;
      dueDate: string;
      status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
      completedDate?: string;
      notes?: string;
    }[];
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
    createdAt: string;
    updatedAt: string;
  }[];
  nextAssessmentDate: string;
  assessedBy: User;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SupplierDevelopmentPlan = {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  area: 'QUALITY' | 'DELIVERY' | 'COST' | 'SUSTAINABILITY' | 'INNOVATION' | 'OTHER';
  description: string;
  baseline: number;
  target: number;
  startDate: string;
  targetDate: string;
  status: DevelopmentStatus;
  progress: number;
  milestones: {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    status: 'PENDING' | 'COMPLETED' | 'OVERDUE';
    completedDate?: string;
    notes?: string;
  }[];
  kpis: {
    id: string;
    name: string;
    description?: string;
    unit: string;
    baseline: number;
    target: number;
    current: number;
    measurements: {
      date: string;
      value: number;
      notes?: string;
    }[];
  }[];
  meetings: {
    id: string;
    title: string;
    date: string;
    attendees: {
      name: string;
      organization: string;
      role: string;
    }[];
    notes?: string;
    actionItems: {
      description: string;
      assignedTo: string;
      dueDate: string;
      status: 'PENDING' | 'COMPLETED';
    }[];
  }[];
  resources: {
    id: string;
    type: 'PERSONNEL' | 'FINANCIAL' | 'TECHNICAL' | 'OTHER';
    description: string;
    allocated: boolean;
  }[];
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedBy?: User;
  updatedAt: string;
};

export type SupplierPerformance = {
  id: string;
  supplierId: string;
  supplierName: string;
  qualityScore: number;
  deliveryScore: number;
  costScore: number;
  overallScore: number;
  metrics: {
    defectRate: number;
    onTimeDelivery: number;
    leadTimeAdherence: number;
    priceCompetitiveness: number;
    responsiveness: number;
    innovation: number;
    sustainability: number;
  };
  history: Array<{
    period: string; // YYYY-MM
    qualityScore: number;
    deliveryScore: number;
    costScore: number;
    overallScore: number;
  }>;
  issues: Array<{
    id: string;
    type: 'QUALITY' | 'DELIVERY' | 'COST';
    description: string;
    date: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    impact: number; // 1-5
    resolutionDate?: string;
    resolutionNotes?: string;
  }>;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
};

export type SustainabilityRating = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
export type SustainabilityStatus = 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';

export type SupplierSustainability = {
  id: string;
  supplierId: string;
  supplierName: string;
  overallRating: SustainabilityRating;
  carbonFootprint: number;
  carbonUnit: 'tCO2e' | 'kgCO2e';
  waterUsage: number;
  waterUnit: 'gallons' | 'liters';
  wasteGeneration: number;
  wasteUnit: 'tons' | 'kg';
  renewableEnergy: number;
  certifications: string[];
  complianceStatus: SustainabilityStatus;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  goals: {
    carbonReduction: number;
    waterReduction: number;
    wasteReduction: number;
    renewableTarget: number;
    targetDate: string;
  };
  initiatives: {
    id: string;
    name: string;
    description: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
    startDate: string;
    endDate: string;
    impact: {
      category: 'CARBON' | 'WATER' | 'WASTE' | 'ENERGY' | 'SOCIAL';
      value: number;
      unit: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
};

export type QualityStatus = 'APPROVED' | 'CONDITIONAL' | 'REJECTED' | 'PENDING';
export type QualityIncidentSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'OBSERVATION';

export type SupplierQualityRecord = {
  id: string;
  supplierId: string;
  supplierName: string;
  status: QualityStatus;
  qualityScore: number;
  defectRate: number;
  firstPassYield: number;
  onTimeDelivery: number;
  lastAuditDate: string;
  nextAuditDate: string;
  certifications: string[];
  qualitySystem: string;
  incidents: {
    id: string;
    date: string;
    type: string;
    severity: QualityIncidentSeverity;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    resolutionDate?: string;
    rootCause?: string;
    correctiveAction?: string;
  }[];
  correctiveActions: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    assignedTo: string;
    completedDate?: string;
    effectiveness?: number;
  }[];
  auditResults: {
    id: string;
    date: string;
    score: number;
    findings: number;
    majorNonConformities: number;
    minorNonConformities: number;
    observations: number;
    auditor: string;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type FinancialHealthStatus = 'STRONG' | 'STABLE' | 'MODERATE' | 'WEAK' | 'CRITICAL';
export type CreditRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C' | 'D';
export type TrendDirection = 'IMPROVING' | 'STABLE' | 'DECLINING';

export type SupplierFinancialHealth = {
  id: string;
  supplierId: string;
  supplierName: string;
  status: FinancialHealthStatus;
  creditRating: CreditRating;
  creditScore: number;
  financialStability: number;
  liquidityRatio: number;
  debtToEquityRatio: number;
  profitMargin: number;
  revenueGrowth: number;
  paymentHistory: number; // 0-100 score
  daysPayableOutstanding: number;
  bankruptcyRisk: number; // 0-100 score
  trend: TrendDirection;
  lastUpdated: string;
  nextReviewDate: string;
  financialData: {
    year: number;
    revenue: number;
    profit: number;
    assets: number;
    liabilities: number;
    cashFlow: number;
  }[];
  alerts: {
    id: string;
    type: 'PAYMENT_DELAY' | 'CREDIT_DOWNGRADE' | 'BANKRUPTCY_FILING' | 'ACQUISITION' | 'RESTRUCTURING';
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    date: string;
    description: string;
    status: 'ACTIVE' | 'RESOLVED' | 'MONITORING';
  }[];
  createdAt: string;
  updatedAt: string;
};

export type SupplierFilters = {
  status?: SupplierStatus;
  type?: SupplierType;
  name?: string;
  category?: string;
  classification?: BusinessClassification;
  riskLevel?: RiskLevel;
  qualificationStatus?: SupplierQualification['status'];
  dateRange?: {
    start: string;
    end: string;
  };
};