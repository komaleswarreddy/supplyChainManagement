import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxComplianceService } from '@/services/tax-compliance';
import type { PaginationParams } from '@/types/common';
import type { 
  TaxComplianceFilters,
  TaxRule,
  TaxCode,
  TaxDetermination,
  TaxDocument,
  TaxReport,
  TaxJurisdiction,
  TaxType,
  TaxDocumentType,
  TaxReportType,
  TaxReportPeriod,
  TaxFilingStatus
} from '@/types/tax-compliance';

export function useTaxCompliance() {
  const queryClient = useQueryClient();

  // Tax Rules
  const useTaxRules = (params: PaginationParams & TaxComplianceFilters) => {
    return useQuery({
      queryKey: ['tax-rules', params],
      queryFn: () => taxComplianceService.getTaxRules(params),
    });
  };

  const useTaxRule = (id: string) => {
    return useQuery({
      queryKey: ['tax-rule', id],
      queryFn: () => taxComplianceService.getTaxRuleById(id),
      select: (response) => response.data,
    });
  };

  const useCreateTaxRule = () => {
    return useMutation({
      mutationFn: taxComplianceService.createTaxRule,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tax-rules'] });
      },
    });
  };

  const useUpdateTaxRule = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<TaxRule> }) => 
        taxComplianceService.updateTaxRule(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-rule', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tax-rules'] });
      },
    });
  };

  // Tax Codes
  const useTaxCodes = (params: PaginationParams & TaxComplianceFilters) => {
    return useQuery({
      queryKey: ['tax-codes', params],
      queryFn: () => taxComplianceService.getTaxCodes(params),
    });
  };

  const useTaxCode = (id: string) => {
    return useQuery({
      queryKey: ['tax-code', id],
      queryFn: () => taxComplianceService.getTaxCodeById(id),
      select: (response) => response.data,
    });
  };

  const useCreateTaxCode = () => {
    return useMutation({
      mutationFn: taxComplianceService.createTaxCode,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tax-codes'] });
      },
    });
  };

  const useUpdateTaxCode = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<TaxCode> }) => 
        taxComplianceService.updateTaxCode(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-code', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tax-codes'] });
      },
    });
  };

  // Tax Determination
  const useTaxDeterminations = (params: PaginationParams & TaxComplianceFilters) => {
    return useQuery({
      queryKey: ['tax-determinations', params],
      queryFn: () => taxComplianceService.getTaxDeterminations(params),
    });
  };

  const useTaxDetermination = (id: string) => {
    return useQuery({
      queryKey: ['tax-determination', id],
      queryFn: () => taxComplianceService.getTaxDeterminationById(id),
      select: (response) => response.data,
    });
  };

  const useTaxDeterminationByInvoice = (invoiceId: string) => {
    return useQuery({
      queryKey: ['tax-determination-by-invoice', invoiceId],
      queryFn: () => taxComplianceService.getTaxDeterminationByInvoiceId(invoiceId),
      select: (response) => response.data,
      enabled: !!invoiceId,
    });
  };

  const useCreateTaxDetermination = () => {
    return useMutation({
      mutationFn: ({ 
        invoiceId, 
        lineItems 
      }: { 
        invoiceId: string; 
        lineItems: Array<{
          lineItemId: string;
          description: string;
          taxableAmount: number;
          taxCode: string;
        }>;
      }) => 
        taxComplianceService.createTaxDetermination(invoiceId, lineItems),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-determinations'] });
        queryClient.invalidateQueries({ queryKey: ['tax-determination-by-invoice', variables.invoiceId] });
      },
    });
  };

  // Tax Documents
  const useTaxDocuments = (params: PaginationParams & TaxComplianceFilters) => {
    return useQuery({
      queryKey: ['tax-documents', params],
      queryFn: () => taxComplianceService.getTaxDocuments(params),
    });
  };

  const useTaxDocument = (id: string) => {
    return useQuery({
      queryKey: ['tax-document', id],
      queryFn: () => taxComplianceService.getTaxDocumentById(id),
      select: (response) => response.data,
    });
  };

  const useTaxDocumentsBySupplier = (supplierId: string) => {
    return useQuery({
      queryKey: ['tax-documents-by-supplier', supplierId],
      queryFn: () => taxComplianceService.getTaxDocumentsBySupplier(supplierId),
      select: (response) => response.data,
      enabled: !!supplierId,
    });
  };

  const useCreateTaxDocument = () => {
    return useMutation({
      mutationFn: taxComplianceService.createTaxDocument,
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-documents'] });
        queryClient.invalidateQueries({ queryKey: ['tax-documents-by-supplier', variables.supplierId] });
      },
    });
  };

  const useUpdateTaxDocument = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<TaxDocument> }) => 
        taxComplianceService.updateTaxDocument(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-document', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tax-documents'] });
        const document = queryClient.getQueryData<{ data: TaxDocument }>(['tax-document', variables.id]);
        if (document) {
          queryClient.invalidateQueries({ queryKey: ['tax-documents-by-supplier', document.data.supplierId] });
        }
      },
    });
  };

  const useValidateTaxDocument = () => {
    return useMutation({
      mutationFn: ({ 
        id, 
        isValid, 
        rejectionReason 
      }: { 
        id: string; 
        isValid: boolean; 
        rejectionReason?: string; 
      }) => 
        taxComplianceService.validateTaxDocument(id, isValid, rejectionReason),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-document', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tax-documents'] });
        const document = queryClient.getQueryData<{ data: TaxDocument }>(['tax-document', variables.id]);
        if (document) {
          queryClient.invalidateQueries({ queryKey: ['tax-documents-by-supplier', document.data.supplierId] });
        }
      },
    });
  };

  const useSendDocumentReminder = () => {
    return useMutation({
      mutationFn: taxComplianceService.sendDocumentReminder,
      onSuccess: (_, id) => {
        queryClient.invalidateQueries({ queryKey: ['tax-document', id] });
        queryClient.invalidateQueries({ queryKey: ['tax-documents'] });
      },
    });
  };

  // Tax Reports
  const useTaxReports = (params: PaginationParams & TaxComplianceFilters) => {
    return useQuery({
      queryKey: ['tax-reports', params],
      queryFn: () => taxComplianceService.getTaxReports(params),
    });
  };

  const useTaxReport = (id: string) => {
    return useQuery({
      queryKey: ['tax-report', id],
      queryFn: () => taxComplianceService.getTaxReportById(id),
      select: (response) => response.data,
    });
  };

  const useCreateTaxReport = () => {
    return useMutation({
      mutationFn: taxComplianceService.createTaxReport,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tax-reports'] });
      },
    });
  };

  const useUpdateTaxReport = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<TaxReport> }) => 
        taxComplianceService.updateTaxReport(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-report', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tax-reports'] });
      },
    });
  };

  const useFileTaxReport = () => {
    return useMutation({
      mutationFn: ({ 
        id, 
        filingData 
      }: { 
        id: string; 
        filingData: {
          filingStatus: TaxFilingStatus;
          notes?: string;
          reportUrl?: string;
        }; 
      }) => 
        taxComplianceService.fileTaxReport(id, filingData),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['tax-report', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tax-reports'] });
      },
    });
  };

  // Tax Compliance Analytics
  const useTaxComplianceAnalytics = () => {
    return useQuery({
      queryKey: ['tax-compliance-analytics'],
      queryFn: () => taxComplianceService.getTaxComplianceAnalytics(),
      select: (response) => response.data,
    });
  };

  return {
    // Tax Rules
    useTaxRules,
    useTaxRule,
    useCreateTaxRule,
    useUpdateTaxRule,
    
    // Tax Codes
    useTaxCodes,
    useTaxCode,
    useCreateTaxCode,
    useUpdateTaxCode,
    
    // Tax Determination
    useTaxDeterminations,
    useTaxDetermination,
    useTaxDeterminationByInvoice,
    useCreateTaxDetermination,
    
    // Tax Documents
    useTaxDocuments,
    useTaxDocument,
    useTaxDocumentsBySupplier,
    useCreateTaxDocument,
    useUpdateTaxDocument,
    useValidateTaxDocument,
    useSendDocumentReminder,
    
    // Tax Reports
    useTaxReports,
    useTaxReport,
    useCreateTaxReport,
    useUpdateTaxReport,
    useFileTaxReport,
    
    // Tax Compliance Analytics
    useTaxComplianceAnalytics,
  };
}