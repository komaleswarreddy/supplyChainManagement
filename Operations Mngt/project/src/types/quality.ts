import type { User } from './user';

// Quality Control Plan Types
export type QualityControlPlan = {
  id: string;
  tenantId: string;
  planName: string;
  description?: string;
  planType: 'INCOMING' | 'IN_PROCESS' | 'FINAL';
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  inspectionCriteria: InspectionCriteria[];
  samplingPlan: SamplingPlan;
  acceptanceCriteria: AcceptanceCriteria;
  applicableItems?: string[];
  applicableSuppliers?: string[];
  qualityStandards?: string[];
  regulatoryRequirements?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

export type InspectionCriteria = {
  id: string;
  name: string;
  type: 'VISUAL' | 'MEASUREMENT' | 'FUNCTIONAL' | 'DOCUMENTATION';
  description: string;
  expectedValue?: string;
  tolerance?: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  required: boolean;
};

export type SamplingPlan = {
  type: 'AQL' | 'RQL' | 'CUSTOM';
  sampleSize: number;
  acceptanceNumber: number;
  rejectionNumber: number;
  lotSize: number;
};

export type AcceptanceCriteria = {
  defectRate: number;
  firstPassYield: number;
  customerComplaints: number;
};

// Inspection Types
export type Inspection = {
  id: string;
  tenantId: string;
  inspectionNumber: string;
  planId?: string;
  itemId?: string;
  supplierId?: string;
  inspectionType: 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'ROUTINE' | 'SPECIAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  inspectorId: string;
  inspector: User;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  result?: 'PASS' | 'FAIL' | 'CONDITIONAL';
  sampleSize?: number;
  defectsFound: number;
  defectRate?: number;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

export type InspectionResult = {
  id: string;
  tenantId: string;
  inspectionId: string;
  criterionId: string;
  criterionName: string;
  criterionType: 'VISUAL' | 'MEASUREMENT' | 'FUNCTIONAL' | 'DOCUMENTATION';
  expectedValue?: string;
  actualValue?: string;
  tolerance?: string;
  result: 'PASS' | 'FAIL' | 'N/A';
  severity?: 'CRITICAL' | 'MAJOR' | 'MINOR';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
};

// Non-Conformance Types
export type NonConformance = {
  id: string;
  tenantId: string;
  ncNumber: string;
  inspectionId?: string;
  itemId?: string;
  supplierId?: string;
  type: 'SUPPLIER' | 'INTERNAL' | 'CUSTOMER';
  category: 'QUALITY' | 'SAFETY' | 'REGULATORY' | 'DOCUMENTATION';
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';
  description: string;
  rootCause?: string;
  impact?: string;
  quantityAffected?: number;
  costImpact?: number;
  assignedTo?: User;
  dueDate?: string;
  closedAt?: string;
  closedBy?: User;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

// Corrective Action Types
export type CorrectiveAction = {
  id: string;
  tenantId: string;
  actionNumber: string;
  nonConformanceId: string;
  type: 'CORRECTIVE' | 'PREVENTIVE';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  description: string;
  actionPlan: string;
  assignedTo: User;
  dueDate: string;
  startedAt?: string;
  completedAt?: string;
  completedBy?: User;
  effectiveness?: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE';
  verificationMethod?: string;
  verificationDate?: string;
  verifiedBy?: User;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

// Quality Standards Types
export type QualityStandard = {
  id: string;
  tenantId: string;
  standardCode: string;
  standardName: string;
  version: string;
  type: 'ISO' | 'FDA' | 'ASTM' | 'CUSTOM';
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  description?: string;
  requirements: QualityRequirement[];
  effectiveDate: string;
  expiryDate?: string;
  applicableItems?: string[];
  applicableSuppliers?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

export type QualityRequirement = {
  id: string;
  name: string;
  description: string;
  category: string;
  mandatory: boolean;
  verificationMethod: string;
};

// Quality Metrics Types
export type QualityMetric = {
  id: string;
  tenantId: string;
  metricName: string;
  metricType: 'DEFECT_RATE' | 'FIRST_PASS_YIELD' | 'CUSTOMER_COMPLAINTS';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  periodStart: string;
  periodEnd: string;
  target?: number;
  actual: number;
  unit: 'PERCENTAGE' | 'PPM' | 'COUNT';
  itemId?: string;
  supplierId?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
};

// Quality Audit Types
export type QualityAudit = {
  id: string;
  tenantId: string;
  auditNumber: string;
  auditType: 'INTERNAL' | 'EXTERNAL' | 'SUPPLIER' | 'CERTIFICATION';
  scope: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  auditorId: string;
  auditor: User;
  auditeeId?: string;
  auditee?: User;
  supplierId?: string;
  plannedDate: string;
  startedAt?: string;
  completedAt?: string;
  result?: 'PASS' | 'FAIL' | 'CONDITIONAL';
  findings?: AuditFinding[];
  recommendations?: AuditRecommendation[];
  followUpRequired: boolean;
  followUpDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

export type AuditFinding = {
  id: string;
  category: string;
  description: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  evidence: string;
  correctiveAction?: string;
};

export type AuditRecommendation = {
  id: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: string;
  dueDate?: string;
};

// Filter Types
export type QualityFilters = {
  planType?: string;
  inspectionType?: string;
  status?: string;
  inspectorId?: string;
  supplierId?: string;
  itemId?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
  result?: string;
};

// API Response Types
export type QualityControlPlanResponse = {
  data: QualityControlPlan;
  message?: string;
  status: number;
};

export type InspectionResponse = {
  data: Inspection;
  message?: string;
  status: number;
};

export type NonConformanceResponse = {
  data: NonConformance;
  message?: string;
  status: number;
};

export type CorrectiveActionResponse = {
  data: CorrectiveAction;
  message?: string;
  status: number;
};

export type QualityMetricResponse = {
  data: QualityMetric;
  message?: string;
  status: number;
};

export type QualityAuditResponse = {
  data: QualityAudit;
  message?: string;
  status: number;
}; 