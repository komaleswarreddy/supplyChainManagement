import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupplierService } from '@/services/supplier';
import type { PaginationParams } from '@/types/common';
import type { 
  SupplierFilters, 
  SupplierFormData,
  AssessmentStatus, 
  RiskLevel, 
  DevelopmentStatus,
  SupplierPerformance,
  SupplierSustainability,
  SupplierQualityRecord,
  SupplierFinancialHealth
} from '@/types/supplier';

export function useSuppliers() {
  const queryClient = useQueryClient();

  // Suppliers
  const useSupplierList = (params: PaginationParams & SupplierFilters) => {
    return useQuery({
      queryKey: ['suppliers', params],
      queryFn: () => SupplierService.getSuppliers(params),
    });
  };

  const useSupplier = (id: string) => {
    return useQuery({
      queryKey: ['supplier', id],
      queryFn: () => SupplierService.getSupplierById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateSupplier = () => {
    return useMutation({
      mutationFn: (data: SupplierFormData) => SupplierService.createSupplier(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      },
    });
  };

  const useUpdateSupplier = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<SupplierFormData> }) => 
        SupplierService.updateSupplier(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      },
    });
  };

  const useDeleteSupplier = () => {
    return useMutation({
      mutationFn: (id: string) => SupplierService.deleteSupplier(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      },
    });
  };

  // Qualifications
  const useQualifications = (params: PaginationParams & { supplierId?: string; status?: AssessmentStatus }) => {
    return useQuery({
      queryKey: ['qualifications', params],
      queryFn: () => SupplierService.getQualifications(params),
    });
  };

  const useQualification = (id: string) => {
    return useQuery({
      queryKey: ['qualification', id],
      queryFn: () => SupplierService.getQualifications({ page: 1, pageSize: 1 }),
      select: (response) => response.items.find(q => q.id === id),
      enabled: !!id,
    });
  };

  // Analytics
  const useSupplierAnalytics = (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    riskLevel?: string;
  }) => {
    return useQuery({
      queryKey: ['supplier-analytics', params],
      queryFn: () => SupplierService.getSupplierAnalytics(params),
    });
  };

  // Document Management
  const useUploadDocument = () => {
    return useMutation({
      mutationFn: ({ 
        supplierId, 
        document 
      }: { 
        supplierId: string; 
        document: {
          name: string;
          type: 'REGISTRATION' | 'FINANCIAL' | 'CERTIFICATION' | 'COMPLIANCE' | 'CONTRACT' | 'OTHER';
          file: File;
          expiryDate?: string;
        };
      }) => SupplierService.uploadDocument(supplierId, document),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
      },
    });
  };

  // Supplier Portal
  const useRegisterSupplier = () => {
    return useMutation({
      mutationFn: (data: {
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
      }) => SupplierService.registerSupplier(data),
    });
  };

  const useSupplierRegistrationStatus = (registrationId: string) => {
    return useQuery({
      queryKey: ['supplier-registration-status', registrationId],
      queryFn: () => SupplierService.getSupplierRegistrationStatus(registrationId),
      select: (response) => response.data,
      enabled: !!registrationId,
    });
  };

  return {
    useSupplierList,
    useSupplier,
    useCreateSupplier,
    useUpdateSupplier,
    useDeleteSupplier,
    useQualifications,
    useQualification,
    useSupplierAnalytics,
    useUploadDocument,
    useRegisterSupplier,
    useSupplierRegistrationStatus,
  };
} 