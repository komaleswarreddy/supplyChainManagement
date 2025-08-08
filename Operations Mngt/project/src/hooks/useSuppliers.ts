import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '@/services/supplier';
import type { PaginationParams } from '@/types/common';
import type { 
  SupplierFilters, 
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
      queryFn: () => supplierService.getSuppliers(params),
    });
  };

  const useSupplier = (id: string) => {
    return useQuery({
      queryKey: ['supplier', id],
      queryFn: () => supplierService.getSupplierById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateSupplier = () => {
    return useMutation({
      mutationFn: supplierService.createSupplier,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      },
    });
  };

  const useUpdateSupplier = () => {
    return useMutation({
      mutationFn: ({ id, data }) => supplierService.updateSupplier(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      },
    });
  };

  const useDeleteSupplier = () => {
    return useMutation({
      mutationFn: supplierService.deleteSupplier,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      },
    });
  };

  // Qualifications
  const useQualifications = (params: PaginationParams & { supplierId?: string; status?: AssessmentStatus }) => {
    return useQuery({
      queryKey: ['qualifications', params],
      queryFn: () => supplierService.getQualifications(params),
    });
  };

  const useQualification = (id: string) => {
    return useQuery({
      queryKey: ['qualification', id],
      queryFn: () => supplierService.getQualificationById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateQualification = () => {
    return useMutation({
      mutationFn: supplierService.createQualification,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['qualifications'] });
        if (variables.supplierId) {
          queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
        }
      },
    });
  };

  const useUpdateQualification = () => {
    return useMutation({
      mutationFn: ({ id, data }) => supplierService.updateQualification(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['qualification', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['qualifications'] });
        
        // If the qualification status is updated, also update the supplier
        if (variables.data.status === 'COMPLETED' && variables.data.supplierId) {
          queryClient.invalidateQueries({ queryKey: ['supplier', variables.data.supplierId] });
        }
      },
    });
  };

  // Risk Assessments
  const useRiskAssessments = (params: PaginationParams & { supplierId?: string; riskLevel?: RiskLevel }) => {
    return useQuery({
      queryKey: ['risk-assessments', params],
      queryFn: () => supplierService.getRiskAssessments(params),
    });
  };

  const useRiskAssessment = (id: string) => {
    return useQuery({
      queryKey: ['risk-assessment', id],
      queryFn: () => supplierService.getRiskAssessmentById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateRiskAssessment = () => {
    return useMutation({
      mutationFn: supplierService.createRiskAssessment,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
      },
    });
  };

  const useUpdateRiskAssessment = () => {
    return useMutation({
      mutationFn: ({ id, data }) => supplierService.updateRiskAssessment(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['risk-assessment', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
        
        // If the risk level is updated, also update the supplier
        if (variables.data.overallRiskLevel) {
          const assessment = queryClient.getQueryData<{ data: { supplierId: string } }>(['risk-assessment', variables.id]);
          if (assessment?.data.supplierId) {
            queryClient.invalidateQueries({ queryKey: ['supplier', assessment.data.supplierId] });
          }
        }
      },
    });
  };

  // Development Plans
  const useDevelopmentPlans = (params: PaginationParams & { supplierId?: string; status?: DevelopmentStatus; area?: string }) => {
    return useQuery({
      queryKey: ['development-plans', params],
      queryFn: () => supplierService.getDevelopmentPlans(params),
    });
  };

  const useDevelopmentPlan = (id: string) => {
    return useQuery({
      queryKey: ['development-plan', id],
      queryFn: () => supplierService.getDevelopmentPlanById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateDevelopmentPlan = () => {
    return useMutation({
      mutationFn: supplierService.createDevelopmentPlan,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['development-plans'] });
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
      },
    });
  };

  const useUpdateDevelopmentPlan = () => {
    return useMutation({
      mutationFn: ({ id, data }) => supplierService.updateDevelopmentPlan(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['development-plan', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['development-plans'] });
        
        // If the plan status changed, also update the supplier
        if (variables.data.status) {
          const plan = queryClient.getQueryData<{ data: { supplierId: string } }>(['development-plan', variables.id]);
          if (plan?.data.supplierId) {
            queryClient.invalidateQueries({ queryKey: ['supplier', plan.data.supplierId] });
          }
        }
      },
    });
  };

  // Performance Management
  const useSupplierPerformance = (supplierId: string) => {
    return useQuery({
      queryKey: ['supplier-performance', supplierId],
      queryFn: () => supplierService.getSupplierPerformance(supplierId),
      select: (response) => response.data,
      enabled: !!supplierId,
    });
  };

  const useUpdateSupplierPerformance = () => {
    return useMutation({
      mutationFn: ({ supplierId, data }: { supplierId: string; data: Partial<SupplierPerformance> }) => 
        supplierService.updateSupplierPerformance(supplierId, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['supplier-performance', variables.supplierId] });
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
      },
    });
  };

  // Sustainability
  const useSupplierSustainability = (params: PaginationParams & { supplierId?: string; rating?: string; status?: string }) => {
    return useQuery({
      queryKey: ['supplier-sustainability', params],
      queryFn: () => supplierService.getSupplierSustainability(params),
    });
  };

  const useSupplierSustainabilityById = (id: string) => {
    return useQuery({
      queryKey: ['supplier-sustainability-detail', id],
      queryFn: () => supplierService.getSupplierSustainabilityById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  // Quality Management
  const useSupplierQualityRecords = (params: PaginationParams & { supplierId?: string; status?: string }) => {
    return useQuery({
      queryKey: ['supplier-quality', params],
      queryFn: () => supplierService.getSupplierQualityRecords(params),
    });
  };

  const useSupplierQualityRecordById = (id: string) => {
    return useQuery({
      queryKey: ['supplier-quality-detail', id],
      queryFn: () => supplierService.getSupplierQualityRecordById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  // Financial Health
  const useSupplierFinancialHealth = (params: PaginationParams & { supplierId?: string; status?: string; trend?: string }) => {
    return useQuery({
      queryKey: ['supplier-financial-health', params],
      queryFn: () => supplierService.getSupplierFinancialHealth(params),
    });
  };

  const useSupplierFinancialHealthById = (id: string) => {
    return useQuery({
      queryKey: ['supplier-financial-health-detail', id],
      queryFn: () => supplierService.getSupplierFinancialHealthById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateQualityRecord = () => {
    return useMutation({
      mutationFn: supplierService.createQualityRecord,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-quality'] });
      },
    });
  };

  const useCreateFinancialHealth = () => {
    return useMutation({
      mutationFn: supplierService.createFinancialHealth,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-financial-health'] });
      },
    });
  };

  const useCreateSustainability = () => {
    return useMutation({
      mutationFn: supplierService.createSustainability,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['supplier-sustainability'] });
      },
    });
  };

  // Supplier Analytics
  const useSupplierAnalytics = () => {
    return useQuery({
      queryKey: ['supplier-analytics'],
      queryFn: () => supplierService.getSupplierAnalytics(),
      select: (response) => response.data,
    });
  };

  // Document Management
  const useUploadDocument = () => {
    return useMutation({
      mutationFn: ({ supplierId, document }: { supplierId: string; document: Parameters<typeof supplierService.uploadDocument>[1] }) => 
        supplierService.uploadDocument(supplierId, document),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['supplier', variables.supplierId] });
      },
    });
  };

  // Supplier Portal
  const useRegisterSupplier = () => {
    return useMutation({
      mutationFn: supplierService.registerSupplier,
    });
  };

  const useSupplierRegistrationStatus = (registrationId: string) => {
    return useQuery({
      queryKey: ['supplier-registration-status', registrationId],
      queryFn: () => supplierService.getSupplierRegistrationStatus(registrationId),
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
    useCreateQualification,
    useUpdateQualification,
    useRiskAssessments,
    useRiskAssessment,
    useCreateRiskAssessment,
    useUpdateRiskAssessment,
    useDevelopmentPlans,
    useDevelopmentPlan,
    useCreateDevelopmentPlan,
    useUpdateDevelopmentPlan,
    useSupplierPerformance,
    useUpdateSupplierPerformance,
    useSupplierSustainability,
    useSupplierSustainabilityById,
    useSupplierQualityRecords,
    useSupplierQualityRecordById,
    useCreateQualityRecord,
    useSupplierFinancialHealth,
    useSupplierFinancialHealthById,
    useCreateFinancialHealth,
    useCreateSustainability,
    useSupplierAnalytics,
    useUploadDocument,
    useRegisterSupplier,
    useSupplierRegistrationStatus,
  };
}