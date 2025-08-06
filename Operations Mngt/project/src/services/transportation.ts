import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Carrier, 
  Shipment, 
  Load, 
  ShippingDocument, 
  FreightInvoice,
  TransportationFilters,
  CarrierType,
  ServiceLevel,
  DocumentType
} from '@/types/transportation';

// Mock data for development
const MOCK_CARRIERS: Carrier[] = Array.from({ length: 5 }, (_, i) => {
  const carrierTypes: CarrierType[] = ['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN'];
  const type = carrierTypes[i % carrierTypes.length];
  
  return {
    id: `carrier-${i + 1}`,
    name: `${['Express', 'Global', 'Fast', 'Premium', 'Reliable'][i]} ${type} Carriers`,
    code: `${type}-${String(i + 1).padStart(3, '0')}`,
    type,
    status: 'ACTIVE',
    contactInfo: {
      name: 'John Smith',
      email: `contact@${type.toLowerCase()}carrier${i + 1}.com`,
      phone: '+1-555-123-4567',
    },
    address: {
      street: '123 Carrier Street',
      city: 'Logistics City',
      state: 'CA',
      country: 'USA',
      postalCode: '90210',
    },
    scacCode: `${type.substring(0, 2)}${i + 1}`,
    dotNumber: `DOT${100000 + i}`,
    mcNumber: `MC${200000 + i}`,
    taxId: `TAX-${i + 1}-123456`,
    insuranceInfo: {
      provider: 'Logistics Insurance Co.',
      policyNumber: `POL-${i + 1}-987654`,
      coverageAmount: 1000000 + (i * 500000),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    serviceAreas: {
      countries: ['USA', 'Canada', 'Mexico'],
      regions: ['North America', 'Europe'],
    },
    serviceTypes: [type],
    transitTimes: [
      {
        origin: 'Los Angeles, CA',
        destination: 'New York, NY',
        transitDays: 3 + i,
        serviceLevel: 'STANDARD',
      },
      {
        origin: 'Los Angeles, CA',
        destination: 'New York, NY',
        transitDays: 1 + i,
        serviceLevel: 'EXPRESS',
      },
    ],
    rates: [
      {
        origin: 'Los Angeles, CA',
        destination: 'New York, NY',
        serviceLevel: 'STANDARD',
        baseRate: 1000 + (i * 100),
        fuelSurcharge: 150 + (i * 20),
        currency: 'USD',
        effectiveDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        origin: 'Los Angeles, CA',
        destination: 'New York, NY',
        serviceLevel: 'EXPRESS',
        baseRate: 2000 + (i * 200),
        fuelSurcharge: 300 + (i * 30),
        currency: 'USD',
        effectiveDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    performanceMetrics: {
      onTimeDelivery: 95 - (i * 2),
      damageRate: 0.5 + (i * 0.2),
      claimResolutionTime: 5 + i,
      averageTransitTime: 3 + i,
      lastUpdated: new Date().toISOString(),
    },
    contractInfo: {
      contractNumber: `CONTRACT-${i + 1}`,
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      paymentTerms: 'Net 30',
    },
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

const MOCK_SHIPMENTS: Shipment[] = Array.from({ length: 10 }, (_, i) => {
  const carrier = MOCK_CARRIERS[i % MOCK_CARRIERS.length];
  const statuses: ShipmentStatus[] = ['PLANNED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const pickupDate = new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000);
  const estimatedDeliveryDate = new Date(pickupDate);
  estimatedDeliveryDate.setDate(pickupDate.getDate() + 3 + Math.floor(Math.random() * 5));
  
  const actualDeliveryDate = status === 'DELIVERED' ? 
    new Date(estimatedDeliveryDate.getTime() + (Math.random() * 2 - 1) * 24 * 60 * 60 * 1000).toISOString() : 
    undefined;
  
  return {
    id: `shipment-${i + 1}`,
    shipmentNumber: `SHP-${String(i + 1).padStart(6, '0')}`,
    referenceNumber: `REF-${String(i + 1).padStart(6, '0')}`,
    carrier: {
      id: carrier.id,
      name: carrier.name,
      scacCode: carrier.scacCode,
    },
    status,
    origin: {
      name: 'Main Warehouse',
      address: '123 Warehouse St',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      postalCode: '90001',
      contactName: 'John Smith',
      contactPhone: '+1-555-123-4567',
      contactEmail: 'john.smith@example.com',
    },
    destination: {
      name: 'East Coast Distribution Center',
      address: '456 Distribution Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      contactName: 'Jane Doe',
      contactPhone: '+1-555-987-6543',
      contactEmail: 'jane.doe@example.com',
    },
    pickupDate: pickupDate.toISOString(),
    deliveryDate: estimatedDeliveryDate.toISOString(),
    estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
    actualDeliveryDate,
    serviceLevel: ['STANDARD', 'EXPRESS', 'PRIORITY', 'ECONOMY'][Math.floor(Math.random() * 4)] as ServiceLevel,
    trackingNumber: `TRK${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
    trackingUrl: `https://track.carrier.com/${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
    items: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => ({
      itemId: `item-${j + 1}`,
      itemCode: `ITEM-${String(j + 1).padStart(4, '0')}`,
      description: `Product ${j + 1}`,
      quantity: 10 + Math.floor(Math.random() * 90),
      weight: 5 + Math.floor(Math.random() * 45),
      weightUnit: 'LB' as const,
      dimensions: {
        length: 10 + Math.floor(Math.random() * 20),
        width: 10 + Math.floor(Math.random() * 10),
        height: 5 + Math.floor(Math.random() * 15),
        unit: 'IN' as const,
      },
      hazardous: Math.random() > 0.9,
      hazmatInfo: Math.random() > 0.9 ? {
        unNumber: 'UN1234',
        class: '3',
        packingGroup: 'II',
      } : undefined,
      value: 100 + Math.floor(Math.random() * 900),
      currency: 'USD',
      countryOfOrigin: 'USA',
      hsCode: '8471.30.0100',
    })),
    packages: Array.from({ length: 1 + Math.floor(Math.random() * 3) }, (_, j) => ({
      packageId: `pkg-${j + 1}`,
      packageType: ['BOX', 'PALLET'][Math.floor(Math.random() * 2)] as 'BOX' | 'PALLET',
      quantity: 1 + Math.floor(Math.random() * 5),
      weight: 20 + Math.floor(Math.random() * 80),
      weightUnit: 'LB' as const,
      dimensions: {
        length: 20 + Math.floor(Math.random() * 30),
        width: 20 + Math.floor(Math.random() * 20),
        height: 10 + Math.floor(Math.random() * 20),
        unit: 'IN' as const,
      },
      trackingNumber: `PKG${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
    })),
    totalWeight: 100 + Math.floor(Math.random() * 900),
    weightUnit: 'LB',
    totalVolume: 50 + Math.floor(Math.random() * 150),
    volumeUnit: 'CUFT',
    freightClass: '70',
    specialInstructions: Math.random() > 0.7 ? 'Call recipient before delivery' : undefined,
    documents: Array.from({ length: 1 + Math.floor(Math.random() * 2) }, (_, j) => {
      const docTypes: DocumentType[] = ['BOL', 'COMMERCIAL_INVOICE', 'PACKING_LIST'];
      return {
        id: `doc-${j + 1}`,
        type: docTypes[j % docTypes.length],
        url: `https://example.com/documents/shipment-${i + 1}-${docTypes[j % docTypes.length].toLowerCase()}.pdf`,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'user-1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          name: 'John Doe',
          roles: ['logistics_coordinator'],
          permissions: ['manage_shipments'],
          status: 'active',
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }),
    costs: {
      baseRate: 500 + Math.floor(Math.random() * 1500),
      fuelSurcharge: 50 + Math.floor(Math.random() * 150),
      accessorials: Array.from({ length: Math.floor(Math.random() * 3) }, (_, j) => ({
        code: ['LIFT', 'INSD', 'RESD'][j],
        description: ['Liftgate', 'Inside Delivery', 'Residential Delivery'][j],
        amount: 25 + Math.floor(Math.random() * 75),
      })),
      taxes: 50 + Math.floor(Math.random() * 150),
      totalCost: 0, // Will be calculated below
      currency: 'USD',
      invoiceNumber: status === 'DELIVERED' ? `INV-${String(i + 1).padStart(6, '0')}` : undefined,
      invoiceStatus: status === 'DELIVERED' ? 'PENDING' : undefined,
      invoiceDate: status === 'DELIVERED' ? new Date().toISOString() : undefined,
    },
    events: Array.from({ length: 2 + Math.floor(Math.random() * 4) }, (_, j) => {
      const eventDate = new Date(pickupDate);
      eventDate.setHours(eventDate.getHours() + j * 12);
      return {
        timestamp: eventDate.toISOString(),
        status: ['PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'][Math.min(j, 4)],
        location: ['Los Angeles, CA', 'Phoenix, AZ', 'Dallas, TX', 'Chicago, IL', 'New York, NY'][Math.min(j, 4)],
        notes: j === 0 ? 'Shipment created and scheduled for pickup' : undefined,
      };
    }),
    notes: Math.random() > 0.7 ? 'High priority customer order' : undefined,
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['logistics_coordinator'],
      permissions: ['manage_shipments'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

// Calculate total costs for each shipment
MOCK_SHIPMENTS.forEach(shipment => {
  const accessorialTotal = shipment.costs.accessorials.reduce((sum, acc) => sum + acc.amount, 0);
  shipment.costs.totalCost = shipment.costs.baseRate + shipment.costs.fuelSurcharge + accessorialTotal + shipment.costs.taxes;
});

const MOCK_LOADS: Load[] = Array.from({ length: 5 }, (_, i) => {
  const statuses: LoadStatus[] = ['PLANNING', 'PLANNED', 'READY', 'SHIPPED', 'DELIVERED'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `load-${i + 1}`,
    loadNumber: `LOAD-${String(i + 1).padStart(6, '0')}`,
    status,
    shipments: MOCK_SHIPMENTS.slice(i * 2, i * 2 + 2).map(s => s.id),
    carrier: status !== 'PLANNING' ? {
      id: MOCK_CARRIERS[i % MOCK_CARRIERS.length].id,
      name: MOCK_CARRIERS[i % MOCK_CARRIERS.length].name,
    } : undefined,
    equipment: {
      type: 'DRY_VAN',
      length: 53,
      width: 8.5,
      height: 9,
      dimensionUnit: 'FT',
      maxWeight: 45000,
      weightUnit: 'LB',
    },
    loadPlan: {
      totalWeight: 15000 + Math.floor(Math.random() * 20000),
      weightUnit: 'LB',
      totalVolume: 2000 + Math.floor(Math.random() * 1000),
      volumeUnit: 'CUFT',
      utilizationPercentage: 60 + Math.floor(Math.random() * 35),
      items: Array.from({ length: 5 + Math.floor(Math.random() * 5) }, (_, j) => ({
        itemId: `item-${j + 1}`,
        itemCode: `ITEM-${String(j + 1).padStart(4, '0')}`,
        description: `Product ${j + 1}`,
        quantity: 10 + Math.floor(Math.random() * 90),
        position: {
          x: Math.floor(Math.random() * 45),
          y: 0,
          z: Math.floor(Math.random() * 8),
        },
        dimensions: {
          length: 10 + Math.floor(Math.random() * 20),
          width: 10 + Math.floor(Math.random() * 10),
          height: 5 + Math.floor(Math.random() * 15),
          unit: 'IN',
        },
        weight: 50 + Math.floor(Math.random() * 200),
        weightUnit: 'LB',
        stackable: Math.random() > 0.3,
        stackingLimit: Math.random() > 0.3 ? 3 + Math.floor(Math.random() * 3) : undefined,
      })),
      visualizationUrl: `https://example.com/load-plans/${i + 1}.png`,
    },
    scheduledDate: new Date(Date.now() + (Math.random() * 14) * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: status === 'DELIVERED' ? new Date().toISOString() : undefined,
    notes: Math.random() > 0.7 ? 'Ensure proper load securement' : undefined,
    createdBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['logistics_planner'],
      permissions: ['manage_loads'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

const MOCK_DOCUMENTS: ShippingDocument[] = MOCK_SHIPMENTS.flatMap((shipment, i) => {
  const docTypes: DocumentType[] = ['BOL', 'COMMERCIAL_INVOICE', 'PACKING_LIST'];
  
  return docTypes.map((type, j) => ({
    id: `doc-${i}-${j}`,
    shipmentId: shipment.id,
    type,
    documentNumber: `${type}-${String(i + 1).padStart(6, '0')}`,
    issuedDate: new Date().toISOString(),
    issuedBy: {
      id: 'user-1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      roles: ['logistics_coordinator'],
      permissions: ['manage_shipments'],
      status: 'active',
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    signedBy: type === 'BOL' ? 'John Smith' : undefined,
    signatureDate: type === 'BOL' ? new Date().toISOString() : undefined,
    url: `https://example.com/documents/shipment-${i + 1}-${type.toLowerCase()}.pdf`,
    data: {
      // Document-specific data would go here
      shipmentNumber: shipment.shipmentNumber,
      carrierName: shipment.carrier.name,
      originAddress: `${shipment.origin.address}, ${shipment.origin.city}, ${shipment.origin.state} ${shipment.origin.postalCode}`,
      destinationAddress: `${shipment.destination.address}, ${shipment.destination.city}, ${shipment.destination.state} ${shipment.destination.postalCode}`,
      items: shipment.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        weight: item.weight,
      })),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
});

const MOCK_INVOICES: FreightInvoice[] = MOCK_SHIPMENTS.filter(s => s.status === 'DELIVERED').map((shipment, i) => {
  const invoiceStatuses: InvoiceStatus[] = ['PENDING', 'VERIFIED', 'APPROVED', 'PAID'];
  const status = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
  
  return {
    id: `invoice-${i + 1}`,
    invoiceNumber: `INV-${String(i + 1).padStart(6, '0')}`,
    carrierId: shipment.carrier.id,
    carrierName: shipment.carrier.name,
    shipmentIds: [shipment.id],
    invoiceDate: new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status,
    charges: [
      {
        description: 'Base Freight',
        amount: shipment.costs.baseRate,
        category: 'FREIGHT',
        shipmentId: shipment.id,
      },
      {
        description: 'Fuel Surcharge',
        amount: shipment.costs.fuelSurcharge,
        category: 'FUEL',
        shipmentId: shipment.id,
      },
      ...shipment.costs.accessorials.map(acc => ({
        description: acc.description,
        amount: acc.amount,
        category: 'ACCESSORIAL' as const,
        shipmentId: shipment.id,
      })),
      {
        description: 'Taxes',
        amount: shipment.costs.taxes,
        category: 'TAX' as const,
        shipmentId: shipment.id,
      },
    ],
    subtotal: shipment.costs.baseRate + shipment.costs.fuelSurcharge + 
      shipment.costs.accessorials.reduce((sum, acc) => sum + acc.amount, 0),
    taxes: shipment.costs.taxes,
    total: shipment.costs.totalCost,
    currency: 'USD',
    auditResults: status !== 'PENDING' ? {
      status: Math.random() > 0.8 ? 'VARIANCE' : 'MATCH',
      variances: Math.random() > 0.8 ? [
        {
          chargeType: 'Fuel Surcharge',
          expected: shipment.costs.fuelSurcharge,
          actual: shipment.costs.fuelSurcharge + 50,
          difference: 50,
          approved: Math.random() > 0.5,
          approvedBy: Math.random() > 0.5 ? {
            id: 'user-2',
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            name: 'Jane Smith',
            roles: ['finance_manager'],
            permissions: ['approve_invoices'],
            status: 'active',
            mfaEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } : undefined,
          approvedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
          notes: 'Rate increase not in contract',
        },
      ] : [],
      auditedBy: {
        id: 'user-3',
        email: 'mike.johnson@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        name: 'Mike Johnson',
        roles: ['accounts_payable'],
        permissions: ['audit_invoices'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      auditedAt: new Date().toISOString(),
    } : undefined,
    paymentInfo: status === 'PAID' ? {
      paymentDate: new Date().toISOString(),
      paymentMethod: 'ACH',
      paymentReference: `PAY-${String(i + 1).padStart(6, '0')}`,
      paidBy: {
        id: 'user-4',
        email: 'sarah.williams@example.com',
        firstName: 'Sarah',
        lastName: 'Williams',
        name: 'Sarah Williams',
        roles: ['finance_manager'],
        permissions: ['process_payments'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    } : undefined,
    notes: Math.random() > 0.7 ? 'Invoice received via EDI' : undefined,
    createdAt: new Date(Date.now() - (Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

export const transportationService = {
  // Carriers
  getCarriers: async (
    params: PaginationParams & TransportationFilters
  ): Promise<PaginatedResponse<Carrier>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_CARRIERS];

    if (params.carrier) {
      filteredData = filteredData.filter(carrier => 
        carrier.name.toLowerCase().includes(params.carrier!.toLowerCase()) ||
        carrier.code.toLowerCase().includes(params.carrier!.toLowerCase())
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(carrier => carrier.status === params.status);
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
  },

  getCarrierById: async (id: string): Promise<ApiResponse<Carrier>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const carrier = MOCK_CARRIERS.find(carrier => carrier.id === id);

    if (!carrier) {
      throw new Error('Carrier not found');
    }

    return {
      data: carrier,
      status: 200,
    };
  },

  createCarrier: async (carrier: Omit<Carrier, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Carrier>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCarrier: Carrier = {
      id: `carrier-${MOCK_CARRIERS.length + 1}`,
      ...carrier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_CARRIERS.push(newCarrier);

    return {
      data: newCarrier,
      status: 201,
    };
  },

  updateCarrier: async (id: string, carrier: Partial<Carrier>): Promise<ApiResponse<Carrier>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_CARRIERS.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Carrier not found');
    }

    MOCK_CARRIERS[index] = {
      ...MOCK_CARRIERS[index],
      ...carrier,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CARRIERS[index],
      status: 200,
    };
  },

  // Shipments
  getShipments: async (
    params: PaginationParams & TransportationFilters
  ): Promise<PaginatedResponse<Shipment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_SHIPMENTS];

    if (params.carrier) {
      filteredData = filteredData.filter(shipment => 
        shipment.carrier.name.toLowerCase().includes(params.carrier!.toLowerCase())
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(shipment => shipment.status === params.status);
    }
    if (params.origin) {
      filteredData = filteredData.filter(shipment => 
        shipment.origin.city.toLowerCase().includes(params.origin!.toLowerCase()) ||
        shipment.origin.state.toLowerCase().includes(params.origin!.toLowerCase()) ||
        shipment.origin.country.toLowerCase().includes(params.origin!.toLowerCase())
      );
    }
    if (params.destination) {
      filteredData = filteredData.filter(shipment => 
        shipment.destination.city.toLowerCase().includes(params.destination!.toLowerCase()) ||
        shipment.destination.state.toLowerCase().includes(params.destination!.toLowerCase()) ||
        shipment.destination.country.toLowerCase().includes(params.destination!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(shipment => {
        const pickupDate = new Date(shipment.pickupDate);
        return pickupDate >= start && pickupDate <= end;
      });
    }
    if (params.referenceNumber) {
      filteredData = filteredData.filter(shipment => 
        shipment.referenceNumber?.toLowerCase().includes(params.referenceNumber!.toLowerCase())
      );
    }
    if (params.serviceLevel) {
      filteredData = filteredData.filter(shipment => shipment.serviceLevel === params.serviceLevel);
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
  },

  getShipmentById: async (id: string): Promise<ApiResponse<Shipment>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const shipment = MOCK_SHIPMENTS.find(shipment => shipment.id === id);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return {
      data: shipment,
      status: 200,
    };
  },

  createShipment: async (shipment: Omit<Shipment, 'id' | 'shipmentNumber' | 'events' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Shipment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newShipment: Shipment = {
      id: `shipment-${MOCK_SHIPMENTS.length + 1}`,
      shipmentNumber: `SHP-${String(MOCK_SHIPMENTS.length + 1).padStart(6, '0')}`,
      ...shipment,
      events: [
        {
          timestamp: new Date().toISOString(),
          status: 'SHIPMENT_CREATED',
          notes: 'Shipment created in system',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_SHIPMENTS.push(newShipment);

    return {
      data: newShipment,
      status: 201,
    };
  },

  updateShipment: async (id: string, shipment: Partial<Shipment>): Promise<ApiResponse<Shipment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_SHIPMENTS.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Shipment not found');
    }

    // If status is changing, add an event
    if (shipment.status && shipment.status !== MOCK_SHIPMENTS[index].status) {
      const newEvent = {
        timestamp: new Date().toISOString(),
        status: `STATUS_CHANGED_TO_${shipment.status}`,
        notes: `Status changed from ${MOCK_SHIPMENTS[index].status} to ${shipment.status}`,
      };
      
      if (!shipment.events) {
        shipment.events = [...MOCK_SHIPMENTS[index].events, newEvent];
      } else {
        shipment.events = [...shipment.events, newEvent];
      }
    }

    MOCK_SHIPMENTS[index] = {
      ...MOCK_SHIPMENTS[index],
      ...shipment,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_SHIPMENTS[index],
      status: 200,
    };
  },

  // Loads
  getLoads: async (
    params: PaginationParams & TransportationFilters
  ): Promise<PaginatedResponse<Load>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_LOADS];

    if (params.status) {
      filteredData = filteredData.filter(load => load.status === params.status);
    }
    if (params.carrier && params.carrier !== '') {
      filteredData = filteredData.filter(load => 
        load.carrier?.name.toLowerCase().includes(params.carrier!.toLowerCase())
      );
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(load => {
        const scheduledDate = new Date(load.scheduledDate);
        return scheduledDate >= start && scheduledDate <= end;
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
  },

  getLoadById: async (id: string): Promise<ApiResponse<Load>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const load = MOCK_LOADS.find(load => load.id === id);

    if (!load) {
      throw new Error('Load not found');
    }

    return {
      data: load,
      status: 200,
    };
  },

  createLoad: async (load: Omit<Load, 'id' | 'loadNumber' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Load>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newLoad: Load = {
      id: `load-${MOCK_LOADS.length + 1}`,
      loadNumber: `LOAD-${String(MOCK_LOADS.length + 1).padStart(6, '0')}`,
      ...load,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_LOADS.push(newLoad);

    return {
      data: newLoad,
      status: 201,
    };
  },

  updateLoad: async (id: string, load: Partial<Load>): Promise<ApiResponse<Load>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_LOADS.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Load not found');
    }

    MOCK_LOADS[index] = {
      ...MOCK_LOADS[index],
      ...load,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_LOADS[index],
      status: 200,
    };
  },

  // Documents
  getDocuments: async (
    shipmentId: string
  ): Promise<ApiResponse<ShippingDocument[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const documents = MOCK_DOCUMENTS.filter(doc => doc.shipmentId === shipmentId);

    return {
      data: documents,
      status: 200,
    };
  },

  getDocumentById: async (id: string): Promise<ApiResponse<ShippingDocument>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const document = MOCK_DOCUMENTS.find(doc => doc.id === id);

    if (!document) {
      throw new Error('Document not found');
    }

    return {
      data: document,
      status: 200,
    };
  },

  createDocument: async (
    shipmentId: string,
    documentType: DocumentType,
    data: Record<string, any>
  ): Promise<ApiResponse<ShippingDocument>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newDocument: ShippingDocument = {
      id: `doc-${MOCK_DOCUMENTS.length + 1}`,
      shipmentId,
      type: documentType,
      documentNumber: `${documentType}-${String(MOCK_DOCUMENTS.length + 1).padStart(6, '0')}`,
      issuedDate: new Date().toISOString(),
      issuedBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['logistics_coordinator'],
        permissions: ['manage_shipments'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      url: `https://example.com/documents/shipment-${shipmentId}-${documentType.toLowerCase()}.pdf`,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_DOCUMENTS.push(newDocument);

    // Update the shipment to include the new document
    const shipmentIndex = MOCK_SHIPMENTS.findIndex(s => s.id === shipmentId);
    if (shipmentIndex !== -1) {
      MOCK_SHIPMENTS[shipmentIndex].documents.push({
        id: newDocument.id,
        type: documentType,
        url: newDocument.url,
        createdAt: newDocument.createdAt,
        createdBy: newDocument.issuedBy,
      });
    }

    return {
      data: newDocument,
      status: 201,
    };
  },

  // Invoices
  getInvoices: async (
    params: PaginationParams & TransportationFilters
  ): Promise<PaginatedResponse<FreightInvoice>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let filteredData = [...MOCK_INVOICES];

    if (params.carrier) {
      filteredData = filteredData.filter(invoice => 
        invoice.carrierName.toLowerCase().includes(params.carrier!.toLowerCase())
      );
    }
    if (params.status) {
      filteredData = filteredData.filter(invoice => invoice.status === params.status);
    }
    if (params.dateRange) {
      const start = new Date(params.dateRange.start);
      const end = new Date(params.dateRange.end);
      filteredData = filteredData.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= start && invoiceDate <= end;
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
  },

  getInvoiceById: async (id: string): Promise<ApiResponse<FreightInvoice>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const invoice = MOCK_INVOICES.find(invoice => invoice.id === id);

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      data: invoice,
      status: 200,
    };
  },

  auditInvoice: async (
    id: string, 
    auditResults: FreightInvoice['auditResults']
  ): Promise<ApiResponse<FreightInvoice>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_INVOICES.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error('Invoice not found');
    }

    MOCK_INVOICES[index] = {
      ...MOCK_INVOICES[index],
      status: 'VERIFIED',
      auditResults: {
        ...auditResults,
        auditedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_INVOICES[index],
      status: 200,
    };
  },

  approveInvoice: async (id: string): Promise<ApiResponse<FreightInvoice>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_INVOICES.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error('Invoice not found');
    }

    MOCK_INVOICES[index] = {
      ...MOCK_INVOICES[index],
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_INVOICES[index],
      status: 200,
    };
  },

  rejectInvoice: async (id: string, reason: string): Promise<ApiResponse<FreightInvoice>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_INVOICES.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error('Invoice not found');
    }

    MOCK_INVOICES[index] = {
      ...MOCK_INVOICES[index],
      status: 'REJECTED',
      notes: reason,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_INVOICES[index],
      status: 200,
    };
  },

  // Tracking
  getShipmentTracking: async (id: string): Promise<ApiResponse<Shipment['events']>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const shipment = MOCK_SHIPMENTS.find(shipment => shipment.id === id);

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return {
      data: shipment.events,
      status: 200,
    };
  },

  updateShipmentTracking: async (
    id: string, 
    event: { status: string; location?: string; notes?: string; }
  ): Promise<ApiResponse<Shipment>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const index = MOCK_SHIPMENTS.findIndex(shipment => shipment.id === id);
    if (index === -1) {
      throw new Error('Shipment not found');
    }

    const newEvent = {
      timestamp: new Date().toISOString(),
      ...event,
    };

    MOCK_SHIPMENTS[index] = {
      ...MOCK_SHIPMENTS[index],
      events: [...MOCK_SHIPMENTS[index].events, newEvent],
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_SHIPMENTS[index],
      status: 200,
    };
  },

  // Carrier Selection
  getEligibleCarriers: async (
    origin: string,
    destination: string,
    serviceLevel: ServiceLevel,
    weight: number,
    pickupDate: string
  ): Promise<ApiResponse<{
    carriers: Array<{
      carrier: Carrier;
      rate: number;
      transitDays: number;
      availableCapacity: boolean;
      performanceScore: number;
    }>;
  }>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Filter carriers that serve the route and service level
    const eligibleCarriers = MOCK_CARRIERS.filter(carrier => {
      // Check if carrier has rates for this route and service level
      return carrier.rates.some(rate => 
        rate.origin.includes(origin.split(',')[0]) && 
        rate.destination.includes(destination.split(',')[0]) && 
        rate.serviceLevel === serviceLevel
      );
    });

    // Generate carrier selection data
    const carrierSelectionData = eligibleCarriers.map(carrier => {
      const rateInfo = carrier.rates.find(rate => 
        rate.origin.includes(origin.split(',')[0]) && 
        rate.destination.includes(destination.split(',')[0]) && 
        rate.serviceLevel === serviceLevel
      );

      const transitInfo = carrier.transitTimes.find(transit => 
        transit.origin.includes(origin.split(',')[0]) && 
        transit.destination.includes(destination.split(',')[0]) && 
        transit.serviceLevel === serviceLevel
      );

      // Calculate total rate based on weight
      const baseRate = rateInfo?.baseRate || 500;
      const fuelSurcharge = rateInfo?.fuelSurcharge || 100;
      const totalRate = baseRate + fuelSurcharge + (weight * 0.1); // $0.10 per pound

      return {
        carrier,
        rate: totalRate,
        transitDays: transitInfo?.transitDays || 3,
        availableCapacity: Math.random() > 0.2, // 80% chance of capacity being available
        performanceScore: carrier.performanceMetrics.onTimeDelivery,
      };
    });

    // Sort by rate
    carrierSelectionData.sort((a, b) => a.rate - b.rate);

    return {
      data: {
        carriers: carrierSelectionData,
      },
      status: 200,
    };
  },

  // Load Planning
  calculateLoadPlan: async (
    items: Array<{
      itemId: string;
      itemCode: string;
      description: string;
      quantity: number;
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
    }>,
    equipmentType: 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'CONTAINER'
  ): Promise<ApiResponse<Load['loadPlan']>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Define equipment dimensions based on type
    const equipmentDimensions = {
      'DRY_VAN': { length: 53, width: 8.5, height: 9, maxWeight: 45000 },
      'REEFER': { length: 53, width: 8.5, height: 9, maxWeight: 43000 },
      'FLATBED': { length: 48, width: 8.5, height: 8.5, maxWeight: 48000 },
      'CONTAINER': { length: 40, width: 8, height: 8.5, maxWeight: 44000 },
    }[equipmentType];

    // Convert all dimensions to inches and weights to pounds if needed
    const normalizedItems = items.map(item => ({
      ...item,
      dimensions: {
        ...item.dimensions,
        length: item.dimensions.unit === 'CM' ? item.dimensions.length / 2.54 : item.dimensions.length,
        width: item.dimensions.unit === 'CM' ? item.dimensions.width / 2.54 : item.dimensions.width,
        height: item.dimensions.unit === 'CM' ? item.dimensions.height / 2.54 : item.dimensions.height,
        unit: 'IN' as const,
      },
      weight: item.weightUnit === 'KG' ? item.weight * 2.20462 : item.weight,
      weightUnit: 'LB' as const,
    }));

    // Simple load planning algorithm (in a real system, this would be much more sophisticated)
    let totalWeight = 0;
    let totalVolume = 0;
    const maxVolume = equipmentDimensions.length * equipmentDimensions.width * equipmentDimensions.height;
    
    // Position items in the trailer (very simplified)
    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;
    let maxHeightInCurrentRow = 0;
    
    const positionedItems = normalizedItems.flatMap(item => {
      return Array.from({ length: item.quantity }, (_, i) => {
        const itemVolume = item.dimensions.length * item.dimensions.width * item.dimensions.height;
        totalVolume += itemVolume;
        totalWeight += item.weight;
        
        // Check if we need to start a new row
        if (currentX + item.dimensions.length > equipmentDimensions.length) {
          currentX = 0;
          currentZ += maxHeightInCurrentRow;
          maxHeightInCurrentRow = 0;
        }
        
        // Position the item
        const position = {
          x: currentX,
          y: currentY,
          z: currentZ,
        };
        
        // Update position for next item
        currentX += item.dimensions.length;
        maxHeightInCurrentRow = Math.max(maxHeightInCurrentRow, item.dimensions.height);
        
        return {
          ...item,
          position,
        };
      });
    });

    // Calculate utilization
    const utilizationPercentage = Math.min(100, Math.round((totalVolume / maxVolume) * 100));

    return {
      data: {
        totalWeight,
        weightUnit: 'LB',
        totalVolume,
        volumeUnit: 'CUFT',
        utilizationPercentage,
        items: positionedItems,
        visualizationUrl: 'https://example.com/load-plans/visualization.png',
      },
      status: 200,
    };
  },
};