import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportationService } from '@/services/transportation';
import type { PaginationParams } from '@/types/common';
import type { 
  TransportationFilters,
  Carrier,
  Shipment,
  Load,
  ShippingDocument,
  FreightInvoice,
  DocumentType,
  ServiceLevel
} from '@/types/transportation';

export function useTransportation() {
  const queryClient = useQueryClient();

  // Carriers
  const useCarriers = (params: PaginationParams & TransportationFilters) => {
    return useQuery({
      queryKey: ['carriers', params],
      queryFn: () => transportationService.getCarriers(params),
    });
  };

  const useCarrier = (id: string) => {
    return useQuery({
      queryKey: ['carrier', id],
      queryFn: () => transportationService.getCarrierById(id),
      select: (response) => response.data,
    });
  };

  const useCreateCarrier = () => {
    return useMutation({
      mutationFn: transportationService.createCarrier,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['carriers'] });
      },
    });
  };

  const useUpdateCarrier = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Carrier> }) => 
        transportationService.updateCarrier(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['carrier', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['carriers'] });
      },
    });
  };

  // Shipments
  const useShipments = (params: PaginationParams & TransportationFilters) => {
    return useQuery({
      queryKey: ['shipments', params],
      queryFn: () => transportationService.getShipments(params),
    });
  };

  const useShipment = (id: string) => {
    return useQuery({
      queryKey: ['shipment', id],
      queryFn: () => transportationService.getShipmentById(id),
      select: (response) => response.data,
    });
  };

  const useCreateShipment = () => {
    return useMutation({
      mutationFn: transportationService.createShipment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      },
    });
  };

  const useUpdateShipment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Shipment> }) => 
        transportationService.updateShipment(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      },
    });
  };

  // Loads
  const useLoads = (params: PaginationParams & TransportationFilters) => {
    return useQuery({
      queryKey: ['loads', params],
      queryFn: () => transportationService.getLoads(params),
    });
  };

  const useLoad = (id: string) => {
    return useQuery({
      queryKey: ['load', id],
      queryFn: () => transportationService.getLoadById(id),
      select: (response) => response.data,
    });
  };

  const useCreateLoad = () => {
    return useMutation({
      mutationFn: transportationService.createLoad,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['loads'] });
      },
    });
  };

  const useUpdateLoad = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Load> }) => 
        transportationService.updateLoad(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['load', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['loads'] });
      },
    });
  };

  // Documents
  const useDocuments = (shipmentId: string) => {
    return useQuery({
      queryKey: ['documents', shipmentId],
      queryFn: () => transportationService.getDocuments(shipmentId),
      select: (response) => response.data,
    });
  };

  const useDocument = (id: string) => {
    return useQuery({
      queryKey: ['document', id],
      queryFn: () => transportationService.getDocumentById(id),
      select: (response) => response.data,
    });
  };

  const useCreateDocument = () => {
    return useMutation({
      mutationFn: ({ 
        shipmentId, 
        documentType, 
        data 
      }: { 
        shipmentId: string; 
        documentType: DocumentType; 
        data: Record<string, any>; 
      }) => 
        transportationService.createDocument(shipmentId, documentType, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['documents', variables.shipmentId] });
        queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] });
      },
    });
  };

  // Invoices
  const useInvoices = (params: PaginationParams & TransportationFilters) => {
    return useQuery({
      queryKey: ['invoices', params],
      queryFn: () => transportationService.getInvoices(params),
    });
  };

  const useInvoice = (id: string) => {
    return useQuery({
      queryKey: ['invoice', id],
      queryFn: () => transportationService.getInvoiceById(id),
      select: (response) => response.data,
    });
  };

  const useAuditInvoice = () => {
    return useMutation({
      mutationFn: ({ id, auditResults }: { id: string; auditResults: FreightInvoice['auditResults'] }) => 
        transportationService.auditInvoice(id, auditResults),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      },
    });
  };

  const useApproveInvoice = () => {
    return useMutation({
      mutationFn: transportationService.approveInvoice,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['invoice', id] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      },
    });
  };

  const useRejectInvoice = () => {
    return useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) => 
        transportationService.rejectInvoice(id, reason),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      },
    });
  };

  // Tracking
  const useShipmentTracking = (id: string) => {
    return useQuery({
      queryKey: ['shipment-tracking', id],
      queryFn: () => transportationService.getShipmentTracking(id),
      select: (response) => response.data,
    });
  };

  const useUpdateShipmentTracking = () => {
    return useMutation({
      mutationFn: ({ 
        id, 
        event 
      }: { 
        id: string; 
        event: { status: string; location?: string; notes?: string; }; 
      }) => 
        transportationService.updateShipmentTracking(id, event),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['shipment-tracking', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      },
    });
  };

  // Carrier Selection
  const useEligibleCarriers = (
    origin: string,
    destination: string,
    serviceLevel: ServiceLevel,
    weight: number,
    pickupDate: string
  ) => {
    return useQuery({
      queryKey: ['eligible-carriers', origin, destination, serviceLevel, weight, pickupDate],
      queryFn: () => transportationService.getEligibleCarriers(
        origin, 
        destination, 
        serviceLevel, 
        weight, 
        pickupDate
      ),
      select: (response) => response.data,
    });
  };

  // Load Planning
  const useCalculateLoadPlan = () => {
    return useMutation({
      mutationFn: ({ 
        items, 
        equipmentType 
      }: { 
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
        }>;
        equipmentType: 'DRY_VAN' | 'REEFER' | 'FLATBED' | 'CONTAINER';
      }) => 
        transportationService.calculateLoadPlan(items, equipmentType),
    });
  };

  return {
    // Carriers
    useCarriers,
    useCarrier,
    useCreateCarrier,
    useUpdateCarrier,
    
    // Shipments
    useShipments,
    useShipment,
    useCreateShipment,
    useUpdateShipment,
    
    // Loads
    useLoads,
    useLoad,
    useCreateLoad,
    useUpdateLoad,
    
    // Documents
    useDocuments,
    useDocument,
    useCreateDocument,
    
    // Invoices
    useInvoices,
    useInvoice,
    useAuditInvoice,
    useApproveInvoice,
    useRejectInvoice,
    
    // Tracking
    useShipmentTracking,
    useUpdateShipmentTracking,
    
    // Carrier Selection
    useEligibleCarriers,
    
    // Load Planning
    useCalculateLoadPlan,
  };
}