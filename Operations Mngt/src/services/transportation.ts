import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  TransportationFilters,
  Carrier,
  Shipment,
  Load,
  ShippingDocument,
  FreightInvoice,
  DocumentType,
  ServiceLevel,
  CarrierFormData,
  ShipmentFormData,
  LoadFormData
} from '@/types/transportation';

// Configuration
const API_ENDPOINTS = {
  CARRIERS: '/api/transportation/carriers',
  SHIPMENTS: '/api/transportation/shipments',
  LOADS: '/api/transportation/loads',
  DOCUMENTS: (shipmentId: string) => `/api/transportation/shipments/${shipmentId}/documents`,
  INVOICES: '/api/transportation/invoices',
  TRACKING: (shipmentId: string) => `/api/transportation/shipments/${shipmentId}/tracking`,
  ELIGIBLE_CARRIERS: '/api/transportation/eligible-carriers',
  LOAD_PLANNING: '/api/transportation/load-planning',
  TRANSPORTATION_ANALYTICS: '/api/transportation/analytics',
} as const;

// Enhanced mock data for development/fallback
const MOCK_CARRIERS: Carrier[] = Array.from({ length: 25 }, (_, i) => {
  const createdDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  
  return {
    id: `carrier-${i + 1}`,
    name: `${['Express Logistics', 'Global Freight', 'Swift Transport', 'Reliable Carriers', 'Premium Shipping', 'Fast Track Logistics', 'Nationwide Transport', 'International Freight', 'Regional Express', 'Cargo Solutions'][i % 10]} ${Math.floor(i / 10) + 1}`,
    code: `CAR-${String(i + 1).padStart(4, '0')}`,
    type: ['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL'][i % 7],
    status: ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'][i % 4],
    contactInfo: {
      name: `${['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emily', 'Chris', 'Amanda'][i % 10]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]}`,
      email: `contact@${['express', 'global', 'swift', 'reliable', 'premium'][i % 5]}logistics.example.com`,
      phone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    },
    address: {
      street: `${Math.floor(Math.random() * 9999) + 1} ${['Logistics Blvd', 'Transport Ave', 'Freight St', 'Cargo Way', 'Shipping Dr'][i % 5]}`,
      city: ['Atlanta', 'Chicago', 'Dallas', 'Los Angeles', 'Memphis', 'Miami', 'New York', 'Phoenix', 'Seattle', 'Denver'][i % 10],
      state: ['GA', 'IL', 'TX', 'CA', 'TN', 'FL', 'NY', 'AZ', 'WA', 'CO'][i % 10],
      country: 'United States',
      postalCode: String(Math.floor(Math.random() * 90000) + 10000),
    },
    scacCode: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    dotNumber: String(Math.floor(Math.random() * 9000000) + 1000000),
    mcNumber: `MC-${String(Math.floor(Math.random() * 900000) + 100000)}`,
    taxId: `${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
    insuranceInfo: {
      provider: ['State Farm', 'Progressive', 'Liberty Mutual', 'Travelers', 'Nationwide'][i % 5],
      policyNumber: `POL-${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
      coverageAmount: [1000000, 2000000, 5000000, 10000000][i % 4],
      expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    serviceAreas: {
      countries: ['United States', ...(Math.random() > 0.7 ? ['Canada'] : []), ...(Math.random() > 0.9 ? ['Mexico'] : [])],
      regions: [
        ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast'][i % 5],
        ...(Math.random() > 0.5 ? [['Great Lakes', 'Gulf Coast', 'Mountain West', 'Pacific Northwest', 'Atlantic Coast'][i % 5]] : []),
      ],
    },
    serviceTypes: [
      ['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL'][i % 7],
      ...(Math.random() > 0.6 ? [['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL'][(i + 1) % 7]] : []),
    ],
    transitTimes: [
      {
        origin: 'Atlanta, GA',
        destination: 'New York, NY',
        serviceLevel: 'STANDARD',
        transitDays: 2,
        cutoffTime: '17:00',
      },
      {
        origin: 'Los Angeles, CA',
        destination: 'Chicago, IL',
        serviceLevel: 'EXPRESS',
        transitDays: 1,
        cutoffTime: '15:00',
      },
    ],
    rates: [
      {
        serviceType: 'LTL',
        rateType: 'PER_CWT',
        baseRate: Math.floor(Math.random() * 50) + 25,
        currency: 'USD',
        effectiveDate: createdDate.toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        minimumCharge: Math.floor(Math.random() * 200) + 100,
      },
    ],
    performanceMetrics: {
      onTimePerformance: Math.floor(Math.random() * 20) + 80, // 80-100%
      damageRate: Math.random() * 2, // 0-2%
      customerSatisfaction: Math.floor(Math.random() * 20) + 80, // 80-100%
      responseTime: Math.floor(Math.random() * 24) + 1, // 1-24 hours
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    contractInfo: Math.random() > 0.3 ? {
      contractType: ['SPOT', 'CONTRACT', 'DEDICATED'][i % 3],
      contractStartDate: createdDate.toISOString(),
      contractEndDate: new Date(Date.now() + Math.random() * 365 * 2 * 24 * 60 * 60 * 1000).toISOString(),
      paymentTerms: ['NET_30', 'NET_60', 'NET_90', 'COD'][i % 4],
      currency: 'USD',
      minimumVolume: Math.floor(Math.random() * 50000) + 10000,
      discountTiers: [
        { minimumVolume: 10000, discountPercentage: 5 },
        { minimumVolume: 25000, discountPercentage: 10 },
        { minimumVolume: 50000, discountPercentage: 15 },
      ],
    } : undefined,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date(createdDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

const MOCK_SHIPMENTS: Shipment[] = Array.from({ length: 75 }, (_, i) => {
  const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const pickupDate = new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  const deliveryDate = new Date(pickupDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
  
  return {
    id: `shipment-${i + 1}`,
    shipmentNumber: `SH-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}`,
    status: ['PLANNED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION', 'CANCELLED'][i % 6],
    type: ['INBOUND', 'OUTBOUND', 'TRANSFER'][i % 3],
    serviceLevel: ['STANDARD', 'EXPRESS', 'OVERNIGHT', 'ECONOMY'][i % 4] as ServiceLevel,
    carrier: {
      id: `carrier-${(i % 25) + 1}`,
      name: `Carrier ${(i % 25) + 1}`,
      code: `CAR-${String((i % 25) + 1).padStart(4, '0')}`,
      scacCode: `CAR${(i % 25) + 1}`,
    },
    origin: {
      name: `${['Warehouse A', 'Distribution Center', 'Manufacturing Plant', 'Supplier Location', 'Retail Store'][i % 5]}`,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Industrial Blvd', 'Commerce St', 'Factory Ave', 'Business Dr', 'Corporate Way'][i % 5]}`,
      city: ['Atlanta', 'Chicago', 'Dallas', 'Los Angeles', 'Memphis'][i % 5],
      state: ['GA', 'IL', 'TX', 'CA', 'TN'][i % 5],
      country: 'United States',
      postalCode: String(Math.floor(Math.random() * 90000) + 10000),
      contactPerson: `${['John', 'Jane', 'Mike', 'Sarah', 'David'][i % 5]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][i % 5]}`,
      contactPhone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    },
    destination: {
      name: `${['Customer Location', 'Retail Store', 'Distribution Hub', 'Warehouse B', 'End User'][i % 5]}`,
      address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Blvd', 'Elm Way'][i % 5]}`,
      city: ['New York', 'Miami', 'Seattle', 'Phoenix', 'Denver'][i % 5],
      state: ['NY', 'FL', 'WA', 'AZ', 'CO'][i % 5],
      country: 'United States',
      postalCode: String(Math.floor(Math.random() * 90000) + 10000),
      contactPerson: `${['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'][i % 5]} ${['Wilson', 'Anderson', 'Thomas', 'Jackson', 'White'][i % 5]}`,
      contactPhone: `+1-555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    },
    pickupDate: pickupDate.toISOString(),
    deliveryDate: deliveryDate.toISOString(),
    actualPickupDate: Math.random() > 0.3 ? new Date(pickupDate.getTime() + (Math.random() - 0.5) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    actualDeliveryDate: Math.random() > 0.5 ? new Date(deliveryDate.getTime() + (Math.random() - 0.5) * 48 * 60 * 60 * 1000).toISOString() : undefined,
    items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
      id: `item-${i}-${j}`,
      itemCode: `ITEM-${String((i * 10 + j) % 1000).padStart(4, '0')}`,
      description: `${['Electronics', 'Automotive Parts', 'Textiles', 'Machinery', 'Consumer Goods', 'Raw Materials', 'Food Products', 'Chemicals', 'Medical Supplies', 'Books'][j % 10]}`,
      quantity: Math.floor(Math.random() * 100) + 1,
      weight: Math.floor(Math.random() * 1000) + 10,
      dimensions: {
        length: Math.floor(Math.random() * 48) + 12,
        width: Math.floor(Math.random() * 48) + 12,
        height: Math.floor(Math.random() * 48) + 12,
        unit: 'IN',
      },
      value: Math.floor(Math.random() * 10000) + 100,
      currency: 'USD',
      hazardous: Math.random() > 0.9,
      fragile: Math.random() > 0.7,
      stackable: Math.random() > 0.3,
    })),
    totalWeight: Math.floor(Math.random() * 5000) + 500,
    totalValue: Math.floor(Math.random() * 50000) + 5000,
    currency: 'USD',
    specialInstructions: Math.random() > 0.6 ? `${['Handle with care', 'Temperature controlled', 'Fragile items', 'Rush delivery', 'Signature required'][i % 5]}` : undefined,
    trackingNumber: `TRK-${String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')}`,
    proNumber: `PRO-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
    bolNumber: `BOL-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
    freightCost: Math.floor(Math.random() * 2000) + 200,
    accessorialCharges: Math.random() > 0.5 ? Math.floor(Math.random() * 500) + 50 : 0,
    totalCost: 0, // Will be calculated
    trackingEvents: [
      {
        id: `event-${i}-1`,
        timestamp: createdDate.toISOString(),
        status: 'CREATED',
        location: 'System',
        description: 'Shipment created',
        notes: 'Initial shipment creation',
      },
      ...(Math.random() > 0.3 ? [
        {
          id: `event-${i}-2`,
          timestamp: new Date(pickupDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'DISPATCHED',
          location: 'Origin Terminal',
          description: 'Driver dispatched for pickup',
          notes: 'Pickup scheduled',
        },
      ] : []),
      ...(Math.random() > 0.5 ? [
        {
          id: `event-${i}-3`,
          timestamp: pickupDate.toISOString(),
          status: 'PICKED_UP',
          location: 'Origin Location',
          description: 'Package picked up',
          notes: 'Successfully picked up from origin',
        },
      ] : []),
    ],
    createdAt: createdDate.toISOString(),
    updatedAt: new Date(createdDate.getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString(),
  };
});

// Calculate total cost for shipments
MOCK_SHIPMENTS.forEach(shipment => {
  shipment.totalCost = shipment.freightCost + shipment.accessorialCharges;
});

const MOCK_DOCUMENTS: ShippingDocument[] = Array.from({ length: 150 }, (_, i) => ({
  id: `doc-${i + 1}`,
  shipmentId: `shipment-${(i % 75) + 1}`,
  documentType: ['BOL', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'CUSTOMS_DECLARATION', 'DELIVERY_RECEIPT'][i % 5] as DocumentType,
  documentNumber: `DOC-${String(i + 1).padStart(6, '0')}`,
  status: ['DRAFT', 'GENERATED', 'SENT', 'ACKNOWLEDGED', 'COMPLETED'][i % 5],
  generatedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  fileUrl: `/documents/shipping/${i + 1}.pdf`,
  fileSize: Math.floor(Math.random() * 5000000) + 100000,
  createdBy: {
    id: `user-${(i % 10) + 1}`,
    name: `User ${(i % 10) + 1}`,
    email: `user${(i % 10) + 1}@example.com`,
  },
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Service class for Transportation operations
export class TransportationService {
  /**
   * Get all carriers with pagination and filters
   */
  static async getCarriers(params: PaginationParams & TransportationFilters): Promise<PaginatedResponse<Carrier>> {
    try {
      const response = await api.get<PaginatedResponse<Carrier>>(API_ENDPOINTS.CARRIERS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_CARRIERS];
      
      if (params.status) {
        filteredData = filteredData.filter(carrier => carrier.status === params.status);
      }
      
      if (params.type) {
        filteredData = filteredData.filter(carrier => carrier.type === params.type);
      }
      
      if (params.name) {
        filteredData = filteredData.filter(carrier => 
          carrier.name.toLowerCase().includes(params.name!.toLowerCase()) ||
          carrier.code.toLowerCase().includes(params.name!.toLowerCase())
        );
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(carrier => 
          carrier.name.toLowerCase().includes(searchLower) ||
          carrier.code.toLowerCase().includes(searchLower) ||
          carrier.scacCode?.toLowerCase().includes(searchLower)
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
   * Get carrier by ID
   */
  static async getCarrierById(id: string): Promise<ApiResponse<Carrier>> {
    try {
      const response = await api.get<ApiResponse<Carrier>>(`${API_ENDPOINTS.CARRIERS}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const carrier = MOCK_CARRIERS.find(c => c.id === id);
      if (!carrier) {
        throw new Error(`Carrier with ID ${id} not found`);
      }
      
      return {
        data: carrier,
        status: 200,
      };
    }
  }

  /**
   * Create new carrier
   */
  static async createCarrier(data: CarrierFormData): Promise<ApiResponse<Carrier>> {
    try {
      const response = await api.post<ApiResponse<Carrier>>(API_ENDPOINTS.CARRIERS, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newCarrier: Carrier = {
        id: `carrier-${Date.now()}`,
        code: `CAR-${String(MOCK_CARRIERS.length + 1).padStart(4, '0')}`,
        status: 'PENDING',
        performanceMetrics: {
          onTimePerformance: 85,
          damageRate: 1.5,
          customerSatisfaction: 85,
          responseTime: 12,
          lastUpdated: new Date().toISOString(),
        },
        transitTimes: [],
        rates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      
      MOCK_CARRIERS.unshift(newCarrier);
      
      return {
        data: newCarrier,
        status: 201,
      };
    }
  }

  /**
   * Update carrier
   */
  static async updateCarrier(id: string, data: Partial<CarrierFormData>): Promise<ApiResponse<Carrier>> {
    try {
      const response = await api.put<ApiResponse<Carrier>>(`${API_ENDPOINTS.CARRIERS}/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock update:', error);
      
      const index = MOCK_CARRIERS.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Carrier with ID ${id} not found`);
      }
      
      MOCK_CARRIERS[index] = {
        ...MOCK_CARRIERS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        data: MOCK_CARRIERS[index],
        status: 200,
      };
    }
  }

  /**
   * Get all shipments with pagination and filters
   */
  static async getShipments(params: PaginationParams & TransportationFilters): Promise<PaginatedResponse<Shipment>> {
    try {
      const response = await api.get<PaginatedResponse<Shipment>>(API_ENDPOINTS.SHIPMENTS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_SHIPMENTS];
      
      if (params.status) {
        filteredData = filteredData.filter(shipment => shipment.status === params.status);
      }
      
      if (params.carrier) {
        filteredData = filteredData.filter(shipment => 
          shipment.carrier.name.toLowerCase().includes(params.carrier!.toLowerCase())
        );
      }
      
      if (params.origin) {
        filteredData = filteredData.filter(shipment => 
          shipment.origin.city.toLowerCase().includes(params.origin!.toLowerCase()) ||
          shipment.origin.state.toLowerCase().includes(params.origin!.toLowerCase())
        );
      }
      
      if (params.destination) {
        filteredData = filteredData.filter(shipment => 
          shipment.destination.city.toLowerCase().includes(params.destination!.toLowerCase()) ||
          shipment.destination.state.toLowerCase().includes(params.destination!.toLowerCase())
        );
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(shipment => 
          shipment.shipmentNumber.toLowerCase().includes(searchLower) ||
          shipment.trackingNumber.toLowerCase().includes(searchLower) ||
          shipment.proNumber?.toLowerCase().includes(searchLower) ||
          shipment.bolNumber?.toLowerCase().includes(searchLower)
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
   * Get shipment by ID
   */
  static async getShipmentById(id: string): Promise<ApiResponse<Shipment>> {
    try {
      const response = await api.get<ApiResponse<Shipment>>(`${API_ENDPOINTS.SHIPMENTS}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const shipment = MOCK_SHIPMENTS.find(s => s.id === id);
      if (!shipment) {
        throw new Error(`Shipment with ID ${id} not found`);
      }
      
      return {
        data: shipment,
        status: 200,
      };
    }
  }

  /**
   * Create new shipment
   */
  static async createShipment(data: ShipmentFormData): Promise<ApiResponse<Shipment>> {
    try {
      const response = await api.post<ApiResponse<Shipment>>(API_ENDPOINTS.SHIPMENTS, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newShipment: Shipment = {
        id: `shipment-${Date.now()}`,
        shipmentNumber: `SH-${new Date().getFullYear()}-${String(MOCK_SHIPMENTS.length + 1).padStart(5, '0')}`,
        status: 'PLANNED',
        trackingNumber: `TRK-${String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')}`,
        proNumber: `PRO-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        bolNumber: `BOL-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        totalWeight: data.items?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0,
        totalValue: data.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0,
        currency: 'USD',
        freightCost: Math.floor(Math.random() * 2000) + 200,
        accessorialCharges: 0,
        totalCost: 0, // Will be calculated
        trackingEvents: [
          {
            id: `event-${Date.now()}-1`,
            timestamp: new Date().toISOString(),
            status: 'CREATED',
            location: 'System',
            description: 'Shipment created',
            notes: 'Initial shipment creation',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      
      // Calculate total cost
      newShipment.totalCost = newShipment.freightCost + newShipment.accessorialCharges;
      
      MOCK_SHIPMENTS.unshift(newShipment);
      
      return {
        data: newShipment,
        status: 201,
      };
    }
  }

  /**
   * Update shipment
   */
  static async updateShipment(id: string, data: Partial<ShipmentFormData>): Promise<ApiResponse<Shipment>> {
    try {
      const response = await api.put<ApiResponse<Shipment>>(`${API_ENDPOINTS.SHIPMENTS}/${id}`, data);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock update:', error);
      
      const index = MOCK_SHIPMENTS.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Shipment with ID ${id} not found`);
      }
      
      MOCK_SHIPMENTS[index] = {
        ...MOCK_SHIPMENTS[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return {
        data: MOCK_SHIPMENTS[index],
        status: 200,
      };
    }
  }

  /**
   * Get documents for a shipment
   */
  static async getDocuments(shipmentId: string): Promise<ApiResponse<ShippingDocument[]>> {
    try {
      const response = await api.get<ApiResponse<ShippingDocument[]>>(API_ENDPOINTS.DOCUMENTS(shipmentId));
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const documents = MOCK_DOCUMENTS.filter(doc => doc.shipmentId === shipmentId);
      
      return {
        data: documents,
        status: 200,
      };
    }
  }

  /**
   * Get document by ID
   */
  static async getDocumentById(id: string): Promise<ApiResponse<ShippingDocument>> {
    try {
      const response = await api.get<ApiResponse<ShippingDocument>>(`/api/transportation/documents/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const document = MOCK_DOCUMENTS.find(doc => doc.id === id);
      if (!document) {
        throw new Error(`Document with ID ${id} not found`);
      }
      
      return {
        data: document,
        status: 200,
      };
    }
  }

  /**
   * Create document for shipment
   */
  static async createDocument(
    shipmentId: string,
    documentType: DocumentType,
    data: Record<string, any>
  ): Promise<ApiResponse<ShippingDocument>> {
    try {
      const response = await api.post<ApiResponse<ShippingDocument>>(
        API_ENDPOINTS.DOCUMENTS(shipmentId),
        { documentType, ...data }
      );
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newDocument: ShippingDocument = {
        id: `doc-${Date.now()}`,
        shipmentId,
        documentType,
        documentNumber: `DOC-${String(MOCK_DOCUMENTS.length + 1).padStart(6, '0')}`,
        status: 'DRAFT',
        generatedDate: new Date().toISOString(),
        fileUrl: `/documents/shipping/${Date.now()}.pdf`,
        fileSize: Math.floor(Math.random() * 2000000) + 100000,
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      MOCK_DOCUMENTS.push(newDocument);
      
      return {
        data: newDocument,
        status: 201,
      };
    }
  }

  /**
   * Get eligible carriers for a route
   */
  static async getEligibleCarriers(
    origin: string,
    destination: string,
    serviceLevel: ServiceLevel,
    weight: number,
    pickupDate: string
  ): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get<ApiResponse<any[]>>(API_ENDPOINTS.ELIGIBLE_CARRIERS, {
        params: { origin, destination, serviceLevel, weight, pickupDate }
      });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Mock eligible carriers
      const eligibleCarriers = MOCK_CARRIERS
        .filter(carrier => carrier.status === 'ACTIVE')
        .slice(0, Math.floor(Math.random() * 5) + 3) // 3-7 carriers
        .map(carrier => ({
          ...carrier,
          quote: {
            totalCost: Math.floor(Math.random() * 1000) + 200,
            transitDays: Math.floor(Math.random() * 5) + 1,
            serviceLevel,
            estimatedPickup: pickupDate,
            estimatedDelivery: new Date(new Date(pickupDate).getTime() + (Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000).toISOString(),
          },
        }))
        .sort((a, b) => a.quote.totalCost - b.quote.totalCost);
      
      return {
        data: eligibleCarriers,
        status: 200,
      };
    }
  }

  /**
   * Get transportation analytics
   */
  static async getTransportationAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    carrier?: string;
    serviceLevel?: string;
  }): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.TRANSPORTATION_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock analytics:', error);
      
      // Mock analytics data
      return {
        summary: {
          totalShipments: MOCK_SHIPMENTS.length,
          deliveredShipments: MOCK_SHIPMENTS.filter(s => s.status === 'DELIVERED').length,
          inTransitShipments: MOCK_SHIPMENTS.filter(s => s.status === 'IN_TRANSIT').length,
          exceptionShipments: MOCK_SHIPMENTS.filter(s => s.status === 'EXCEPTION').length,
          totalCost: MOCK_SHIPMENTS.reduce((sum, s) => sum + s.totalCost, 0),
          averageTransitTime: 3.5,
          onTimeDeliveryRate: 89.2,
          damageRate: 1.8,
        },
        byStatus: [
          { status: 'PLANNED', count: MOCK_SHIPMENTS.filter(s => s.status === 'PLANNED').length },
          { status: 'BOOKED', count: MOCK_SHIPMENTS.filter(s => s.status === 'BOOKED').length },
          { status: 'IN_TRANSIT', count: MOCK_SHIPMENTS.filter(s => s.status === 'IN_TRANSIT').length },
          { status: 'DELIVERED', count: MOCK_SHIPMENTS.filter(s => s.status === 'DELIVERED').length },
          { status: 'EXCEPTION', count: MOCK_SHIPMENTS.filter(s => s.status === 'EXCEPTION').length },
          { status: 'CANCELLED', count: MOCK_SHIPMENTS.filter(s => s.status === 'CANCELLED').length },
        ],
        byCarrier: MOCK_CARRIERS.slice(0, 5).map(carrier => ({
          carrier: carrier.name,
          shipments: MOCK_SHIPMENTS.filter(s => s.carrier.id === carrier.id).length,
          cost: MOCK_SHIPMENTS.filter(s => s.carrier.id === carrier.id).reduce((sum, s) => sum + s.totalCost, 0),
          onTimeRate: carrier.performanceMetrics.onTimePerformance,
        })),
        byServiceLevel: [
          { level: 'STANDARD', count: MOCK_SHIPMENTS.filter(s => s.serviceLevel === 'STANDARD').length },
          { level: 'EXPRESS', count: MOCK_SHIPMENTS.filter(s => s.serviceLevel === 'EXPRESS').length },
          { level: 'OVERNIGHT', count: MOCK_SHIPMENTS.filter(s => s.serviceLevel === 'OVERNIGHT').length },
          { level: 'ECONOMY', count: MOCK_SHIPMENTS.filter(s => s.serviceLevel === 'ECONOMY').length },
        ],
        timeline: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            shipments: Math.floor(Math.random() * 20) + 10,
            cost: Math.floor(Math.random() * 50000) + 20000,
            onTimeRate: Math.floor(Math.random() * 20) + 80,
          };
        }),
      };
    }
  }
}

// Export service instance
export const transportationService = {
  getCarriers: TransportationService.getCarriers,
  getCarrierById: TransportationService.getCarrierById,
  createCarrier: TransportationService.createCarrier,
  updateCarrier: TransportationService.updateCarrier,
  getShipments: TransportationService.getShipments,
  getShipmentById: TransportationService.getShipmentById,
  createShipment: TransportationService.createShipment,
  updateShipment: TransportationService.updateShipment,
  getDocuments: TransportationService.getDocuments,
  getDocumentById: TransportationService.getDocumentById,
  createDocument: TransportationService.createDocument,
  getEligibleCarriers: TransportationService.getEligibleCarriers,
  getTransportationAnalytics: TransportationService.getTransportationAnalytics,
}; 