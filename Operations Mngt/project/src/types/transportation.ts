import type { User } from './user';

// Transportation Management Types
export type CarrierType = 
  | 'LTL'
  | 'FTL'
  | 'PARCEL'
  | 'AIR'
  | 'OCEAN'
  | 'RAIL'
  | 'INTERMODAL';

export type CarrierStatus = 
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING'
  | 'SUSPENDED';

export type ShipmentStatus = 
  | 'PLANNED'
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'EXCEPTION'
  | 'CANCELLED';

export type LoadStatus = 
  | 'PLANNING'
  | 'PLANNED'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type DocumentType = 
  | 'BOL'
  | 'COMMERCIAL_INVOICE'
  | 'PACKING_LIST'
  | 'CUSTOMS_DECLARATION'
  | 'CERTIFICATE_OF_ORIGIN'
  | 'DANGEROUS_GOODS'
  | 'DELIVERY_NOTE';

export type InvoiceStatus = 
  | 'PENDING'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID';

export type ServiceLevel = 
  | 'STANDARD'
  | 'EXPRESS'
  | 'PRIORITY'
  | 'ECONOMY';

export type Carrier = {
  id: string;
  name: string;
  code: string;
  type: CarrierType;
  status: CarrierStatus;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  scacCode?: string; // Standard Carrier Alpha Code
  dotNumber?: string; // Department of Transportation Number
  mcNumber?: string; // Motor Carrier Number
  taxId: string;
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    coverageAmount: number;
    expiryDate: string;
  };
  serviceAreas: {
    countries: string[];
    regions?: string[];
  };
  serviceTypes: CarrierType[];
  transitTimes: {
    origin: string;
    destination: string;
    transitDays: number;
    serviceLevel: ServiceLevel;
  }[];
  rates: {
    origin: string;
    destination: string;
    serviceLevel: ServiceLevel;
    baseRate: number;
    fuelSurcharge: number;
    currency: string;
    effectiveDate: string;
    expiryDate: string;
  }[];
  performanceMetrics: {
    onTimeDelivery: number;
    damageRate: number;
    claimResolutionTime: number;
    averageTransitTime: number;
    lastUpdated: string;
  };
  contractInfo: {
    contractNumber: string;
    startDate: string;
    endDate: string;
    paymentTerms: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type Shipment = {
  id: string;
  shipmentNumber: string;
  referenceNumber?: string;
  carrier: {
    id: string;
    name: string;
    scacCode?: string;
  };
  status: ShipmentStatus;
  origin: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
  };
  destination: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
  };
  pickupDate: string;
  deliveryDate: string;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  serviceLevel: ServiceLevel;
  trackingNumber?: string;
  trackingUrl?: string;
  items: {
    itemId: string;
    itemCode: string;
    description: string;
    quantity: number;
    weight: number;
    weightUnit: 'LB' | 'KG';
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: 'IN' | 'CM';
    };
    hazardous: boolean;
    hazmatInfo?: {
      unNumber: string;
      class: string;
      packingGroup: string;
    };
    value: number;
    currency: string;
    countryOfOrigin?: string;
    hsCode?: string;
  }[];
  packages: {
    packageId: string;
    packageType: 'BOX' | 'PALLET' | 'CONTAINER' | 'ENVELOPE' | 'OTHER';
    quantity: number;
    weight: number;
    weightUnit: 'LB' | 'KG';
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: 'IN' | 'CM';
    };
    trackingNumber?: string;
  }[];
  totalWeight: number;
  weightUnit: 'LB' | 'KG';
  totalVolume: number;
  volumeUnit: 'CUFT' | 'CBM';
  freightClass?: string;
  specialInstructions?: string;
  documents: {
    id: string;
    type: DocumentType;
    url: string;
    createdAt: string;
    createdBy: User;
  }[];
  costs: {
    baseRate: number;
    fuelSurcharge: number;
    accessorials: {
      code: string;
      description: string;
      amount: number;
    }[];
    taxes: number;
    totalCost: number;
    currency: string;
    invoiceNumber?: string;
    invoiceStatus?: InvoiceStatus;
    invoiceDate?: string;
  };
  events: {
    timestamp: string;
    status: string;
    location?: string;
    notes?: string;
  }[];
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type Load = {
  id: string;
  loadNumber: string;
  status: LoadStatus;
  shipments: string[];
  carrier?: {
    id: string;
    name: string;
  };
  equipment: {
    type: 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'CONTAINER' | 'OTHER';
    length: number;
    width: number;
    height: number;
    dimensionUnit: 'FT' | 'M';
    maxWeight: number;
    weightUnit: 'LB' | 'KG';
  };
  loadPlan: {
    totalWeight: number;
    weightUnit: 'LB' | 'KG';
    totalVolume: number;
    volumeUnit: 'CUFT' | 'CBM';
    utilizationPercentage: number;
    items: {
      itemId: string;
      itemCode: string;
      description: string;
      quantity: number;
      position: {
        x: number;
        y: number;
        z: number;
      };
      dimensions: {
        length: number;
        width: number;
        height: number;
        unit: 'IN' | 'CM';
      };
      weight: number;
      weightUnit: 'LB' | 'KG';
      stackable: boolean;
      stackingLimit?: number;
    }[];
    visualizationUrl?: string;
  };
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
};

export type ShippingDocument = {
  id: string;
  shipmentId: string;
  type: DocumentType;
  documentNumber: string;
  issuedDate: string;
  issuedBy: User;
  signedBy?: string;
  signatureDate?: string;
  url: string;
  data: Record<string, any>; // Document-specific data
  createdAt: string;
  updatedAt: string;
};

export type FreightInvoice = {
  id: string;
  invoiceNumber: string;
  carrierId: string;
  carrierName: string;
  shipmentIds: string[];
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  charges: {
    description: string;
    amount: number;
    category: 'FREIGHT' | 'FUEL' | 'ACCESSORIAL' | 'TAX' | 'OTHER';
    shipmentId?: string;
  }[];
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  auditResults?: {
    status: 'MATCH' | 'VARIANCE' | 'PENDING';
    variances: {
      chargeType: string;
      expected: number;
      actual: number;
      difference: number;
      approved: boolean;
      approvedBy?: User;
      approvedAt?: string;
      notes?: string;
    }[];
    auditedBy?: User;
    auditedAt?: string;
  };
  paymentInfo?: {
    paymentDate: string;
    paymentMethod: string;
    paymentReference: string;
    paidBy: User;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransportationFilters = {
  carrier?: string;
  status?: string;
  origin?: string;
  destination?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  referenceNumber?: string;
  serviceLevel?: ServiceLevel;
  createdBy?: string;
};