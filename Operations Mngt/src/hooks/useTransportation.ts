import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransportationService } from '@/services/transportation';
import type { PaginationParams } from '@/types/common';
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

export function useTransportation() {
  const queryClient = useQueryClient();

  // Carriers
  const useCarriers = (params: PaginationParams & TransportationFilters) => {
    return useQuery({
      queryKey: ['carriers', params],
      queryFn: () => TransportationService.getCarriers(params),
    });
  };

  const useCarrier = (id: string) => {
    return useQuery({
      queryKey: ['carrier', id],
      queryFn: () => TransportationService.getCarrierById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateCarrier = () => {
    return useMutation({
      mutationFn: (data: CarrierFormData) => TransportationService.createCarrier(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['carriers'] });
      },
    });
  };

  const useUpdateCarrier = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<CarrierFormData> }) => 
        TransportationService.updateCarrier(id, data),
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
      queryFn: () => TransportationService.getShipments(params),
    });
  };

  const useShipment = (id: string) => {
    return useQuery({
      queryKey: ['shipment', id],
      queryFn: () => TransportationService.getShipmentById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateShipment = () => {
    return useMutation({
      mutationFn: (data: ShipmentFormData) => TransportationService.createShipment(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      },
    });
  };

  const useUpdateShipment = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ShipmentFormData> }) => 
        TransportationService.updateShipment(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['shipments'] });
      },
    });
  };

  // Documents
  const useDocuments = (shipmentId: string) => {
    return useQuery({
      queryKey: ['documents', shipmentId],
      queryFn: () => TransportationService.getDocuments(shipmentId),
      select: (response) => response.data,
      enabled: !!shipmentId,
    });
  };

  const useDocument = (id: string) => {
    return useQuery({
      queryKey: ['document', id],
      queryFn: () => TransportationService.getDocumentById(id),
      select: (response) => response.data,
      enabled: !!id,
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
      }) => TransportationService.createDocument(shipmentId, documentType, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['documents', variables.shipmentId] });
        queryClient.invalidateQueries({ queryKey: ['shipment', variables.shipmentId] });
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
      queryFn: () => TransportationService.getEligibleCarriers(
        origin, 
        destination, 
        serviceLevel, 
        weight, 
        pickupDate
      ),
      select: (response) => response.data,
      enabled: !!(origin && destination && serviceLevel && weight && pickupDate),
    });
  };

  // Analytics
  const useTransportationAnalytics = (params?: {
    startDate?: string;
    endDate?: string;
    carrier?: string;
    serviceLevel?: string;
  }) => {
    return useQuery({
      queryKey: ['transportation-analytics', params],
      queryFn: () => TransportationService.getTransportationAnalytics(params),
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
    
    // Documents
    useDocuments,
    useDocument,
    useCreateDocument,
    
    // Carrier Selection
    useEligibleCarriers,
    
    // Analytics
    useTransportationAnalytics,
  };
} 