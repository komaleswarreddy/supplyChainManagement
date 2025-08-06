import type { User } from './user';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';
export type MovementType = 'RECEIPT' | 'ISSUE' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER';
export type CostingMethod = 'FIFO' | 'LIFO' | 'AVERAGE';
export type InspectionStatus = 'PENDING' | 'PASSED' | 'FAILED';
export type ProductType = 'SIMPLE' | 'CONFIGURABLE' | 'BUNDLE' | 'VIRTUAL';
export type CatalogStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'DISCONTINUED';
export type AttributeType = 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN' | 'DATE' | 'FILE';
export type InputType = 'TEXT' | 'TEXTAREA' | 'SELECT' | 'MULTISELECT' | 'CHECKBOX' | 'RADIO' | 'DATE' | 'FILE';
export type RelationshipType = 'RELATED' | 'CROSS_SELL' | 'UP_SELL' | 'SUBSTITUTE' | 'COMPLEMENTARY' | 'BUNDLE';
export type DisplayMode = 'PRODUCTS' | 'PAGE' | 'BOTH';
export type ChangeType = 'INCREASE' | 'DECREASE' | 'SET';

export type UnitOfMeasure = {
  code: string;
  name: string;
  baseUnit: boolean;
  conversionFactor: number;
};

export type BatchLot = {
  number: string;
  expiryDate?: string;
  manufacturingDate?: string;
  quantity: number;
  cost: number;
  status: 'ACTIVE' | 'QUARANTINE' | 'EXPIRED';
  qualityChecks?: {
    checkDate: string;
    inspector: string;
    result: InspectionStatus;
    notes?: string;
  }[];
};

export type SerialNumber = {
  number: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'SOLD' | 'DEFECTIVE';
  location?: {
    warehouse: string;
    zone: string;
    bin: string;
  };
  warranty?: {
    startDate: string;
    endDate: string;
    terms?: string;
  };
};

export type StorageLocation = {
  warehouse: string;
  zone: string;
  bin: string;
  capacity: number;
  currentQuantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  reorderPoint?: number;
};

export type VendorPerformance = {
  vendorId: string;
  metrics: {
    deliveryOnTime: number;
    qualityRating: number;
    priceCompetitiveness: number;
    responseTime: number;
  };
  lastEvaluation: string;
  historicalData: {
    period: string;
    deliveryOnTime: number;
    qualityRating: number;
    priceCompetitiveness: number;
    responseTime: number;
  }[];
};

export type CostTracking = {
  method: CostingMethod;
  currentCost: number;
  historicalCosts: {
    date: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    reference: string;
  }[];
  lastRevaluation?: {
    date: string;
    oldCost: number;
    newCost: number;
    reason: string;
  };
};

export type StockItem = {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  category: string;
  status: StockStatus;
  
  // Enhanced catalog fields
  sku?: string;
  barcode?: string;
  productType: ProductType;
  parentItemId?: string;
  attributes?: Record<string, any>;
  catalogStatus: CatalogStatus;
  catalogCategoryId?: string;
  brand?: string;
  model?: string;
  images?: ProductImage[];
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    urlKey?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  urlKey?: string;
  isFeatured: boolean;
  sortOrder: number;
  
  // Enhanced fields
  unitsOfMeasure: UnitOfMeasure[];
  defaultUOM: string;
  batches: BatchLot[];
  serialNumbers?: SerialNumber[];
  locations: StorageLocation[];
  
  specifications: {
    technical?: string;
    quality?: string;
    safety?: string;
    environmental?: string;
    certifications?: string[];
  };
  
  dimensions?: {
    length: number;
    width: number;
    height: number;
    weight: number;
    uom: string;
  };

  supplier: {
    id: string;
    name: string;
    leadTime: number;
    performance: VendorPerformance;
  };

  cost: CostTracking;
  
  quality: {
    inspectionRequired: boolean;
    inspectionFrequency?: 'EVERY_RECEIPT' | 'PERIODIC' | 'RANDOM';
    qualityParameters?: {
      parameter: string;
      specification: string;
      method: string;
    }[];
    certificates?: {
      type: string;
      number: string;
      issueDate: string;
      expiryDate: string;
      issuer: string;
    }[];
  };

  attachments?: {
    type: 'SPECIFICATION' | 'SAFETY_DATA' | 'CERTIFICATE' | 'OTHER';
    name: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }[];

  createdAt: string;
  updatedAt: string;
};

export type MovementValidation = {
  rules: {
    type: 'QUANTITY' | 'LOCATION' | 'QUALITY' | 'VALUE';
    condition: string;
    message: string;
  }[];
  approvalRequired: boolean;
  approvalThresholds?: {
    quantity?: number;
    value?: number;
  };
};

export type MovementReservation = {
  id: string;
  itemId: string;
  quantity: number;
  reservedFor: {
    type: 'SALES_ORDER' | 'PRODUCTION_ORDER' | 'TRANSFER';
    reference: string;
  };
  location: {
    warehouse: string;
    zone: string;
    bin: string;
  };
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
  expiryDate?: string;
  createdAt: string;
  createdBy: User;
};

export type QualityCheck = {
  id: string;
  type: 'RECEIPT' | 'MOVEMENT' | 'PERIODIC';
  status: InspectionStatus;
  parameters: {
    parameter: string;
    specification: string;
    actual: string;
    result: 'PASS' | 'FAIL';
  }[];
  inspector: User;
  date: string;
  notes?: string;
};

export type CostImpact = {
  oldValue: number;
  newValue: number;
  difference: number;
  accounts: {
    account: string;
    debit?: number;
    credit?: number;
  }[];
  currency: string;
};

export type StockMovement = {
  id: string;
  type: MovementType;
  referenceNumber: string;
  item: {
    id: string;
    itemCode: string;
    name: string;
  };
  quantity: number;
  fromLocation?: {
    warehouse: string;
    zone: string;
    bin: string;
  };
  toLocation?: {
    warehouse: string;
    zone: string;
    bin: string;
  };
  
  // Enhanced fields
  validation?: MovementValidation;
  reservation?: MovementReservation;
  qualityCheck?: QualityCheck;
  costImpact?: CostImpact;
  
  batches?: {
    batchNumber: string;
    quantity: number;
  }[];
  
  serialNumbers?: string[];
  
  reference?: {
    type: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'PRODUCTION_ORDER';
    number: string;
  };
  
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  processedBy: User;
  processedAt: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  
  reversal?: {
    reversedBy: User;
    reversedAt: string;
    reason: string;
    reference: string;
  };
  
  attachments?: string[];
  notes?: string;
};

export type StockAdjustment = {
  id: string;
  adjustmentNumber: string;
  item: {
    id: string;
    itemCode: string;
    name: string;
  };
  type: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
  
  // Enhanced fields
  costCenter?: string;
  reasonCode: {
    code: string;
    description: string;
    category: 'DAMAGE' | 'EXPIRY' | 'THEFT' | 'COUNT' | 'OTHER';
  };
  
  variance?: {
    expected: number;
    actual: number;
    difference: number;
    percentage: number;
  };
  
  cycleCount?: {
    countNumber: string;
    counter: User;
    supervisor: User;
    date: string;
  };
  
  thresholds?: {
    warning: number;
    alert: number;
    exceeded: boolean;
  };
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  approver?: User;
  approvedAt?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  
  attachments?: string[];
  notes?: string;
};

export type StockFilters = {
  status?: StockStatus;
  category?: string;
  warehouse?: string;
  supplier?: string;
  minQuantity?: number;
  maxQuantity?: number;
};

export type MovementFilters = {
  type?: MovementType;
  dateRange?: {
    start: string;
    end: string;
  };
  item?: string;
  warehouse?: string;
  status?: StockMovement['status'];
};

export type AdjustmentFilters = {
  type?: StockAdjustment['type'];
  dateRange?: {
    start: string;
    end: string;
  };
  item?: string;
  status?: StockAdjustment['status'];
  costCenter?: string;
  reasonCode?: string;
};

// Product Category Types
export type ProductCategory = {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  urlKey: string;
  displayMode: DisplayMode;
  pageLayout: string;
  customDesign?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
  children?: ProductCategory[];
  productCount?: number;
};

// Product Attribute Types
export type ProductAttribute = {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: AttributeType;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isComparable: boolean;
  isVisible: boolean;
  isSystem: boolean;
  options?: AttributeOption[];
  validationRules?: Record<string, any>;
  defaultValue?: string;
  inputType: InputType;
  frontendLabel?: string;
  frontendInput?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  updatedBy?: User;
};

export type AttributeOption = {
  value: string;
  label: string;
  sortOrder?: number;
  isDefault?: boolean;
};

export type ProductAttributeValue = {
  id: string;
  tenantId: string;
  itemId: string;
  attributeId: string;
  value?: string;
  createdAt: string;
  updatedAt: string;
  attribute?: ProductAttribute;
};

// Product Image Types
export type ProductImage = {
  id: string;
  tenantId: string;
  itemId: string;
  url: string;
  altText?: string;
  title?: string;
  sortOrder: number;
  isPrimary: boolean;
  isGallery: boolean;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: User;
};

// Product Relationship Types
export type ProductRelationship = {
  id: string;
  tenantId: string;
  parentItemId: string;
  relatedItemId: string;
  relationshipType: RelationshipType;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  relatedItem?: StockItem;
};

// Product Bundle Types
export type ProductBundle = {
  id: string;
  tenantId: string;
  bundleItemId: string;
  componentItemId: string;
  quantity: number;
  isOptional: boolean;
  discountPercentage: number;
  discountAmount: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  componentItem?: StockItem;
};

// Product Review Types
export type ProductReview = {
  id: string;
  tenantId: string;
  itemId: string;
  customerId: string;
  rating: number;
  title?: string;
  review: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: User;
  customer?: User;
};

// Product Price History Types
export type ProductPriceHistory = {
  id: string;
  tenantId: string;
  itemId: string;
  oldPrice?: number;
  newPrice: number;
  changeType: ChangeType;
  reason?: string;
  effectiveDate: string;
  createdAt: string;
  createdBy: User;
};

// Catalog Management Types
export type CatalogFilters = {
  categoryId?: string;
  brand?: string;
  productType?: ProductType;
  catalogStatus?: CatalogStatus;
  isFeatured?: boolean;
  priceMin?: number;
  priceMax?: number;
  attributes?: Record<string, any>;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
};

export type CategoryFilters = {
  parentId?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'sortOrder' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type AttributeFilters = {
  type?: AttributeType;
  isSystem?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  search?: string;
  sortBy?: 'name' | 'code' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
};

// SKU Generation Types
export type SKUGenerationRule = {
  prefix?: string;
  includeCategory?: boolean;
  includeBrand?: boolean;
  includeAttributes?: string[];
  separator?: string;
  length?: number;
  suffix?: string;
};

export type VariantConfiguration = {
  parentItemId: string;
  attributes: Record<string, string[]>;
  generateSKUs: boolean;
  skuRule?: SKUGenerationRule;
};