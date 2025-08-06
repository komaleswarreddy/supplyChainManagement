import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { apiClient } from '../lib/api-client';
import type { 
  QualityControlPlan, 
  Inspection, 
  NonConformance, 
  CorrectiveAction,
  QualityStandard,
  QualityMetric,
  QualityAudit,
  QualityFilters 
} from '../types/quality';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const useQuality = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quality Control Plans
  const [qualityPlans, setQualityPlans] = useState<QualityControlPlan[]>([]);
  const [qualityPlansPagination, setQualityPlansPagination] = useState<PaginatedResponse<QualityControlPlan> | null>(null);

  const fetchQualityPlans = useCallback(async (filters?: QualityFilters, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters?.planType && { planType: filters.planType }),
        ...(filters?.status && { status: filters.status }),
      });

      const response = await apiClient.get<PaginatedResponse<QualityControlPlan>>(`/quality/quality-control-plans?${params}`);
      setQualityPlans(response.data.items);
      setQualityPlansPagination(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quality control plans');
      showToast('error', err.message || 'Failed to fetch quality control plans');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createQualityPlan = useCallback(async (data: Partial<QualityControlPlan>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ApiResponse<QualityControlPlan>>('/quality/quality-control-plans', data);
      showToast('success', 'Quality control plan created successfully');
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create quality control plan');
      showToast('error', err.message || 'Failed to create quality control plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getQualityPlan = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<ApiResponse<QualityControlPlan>>(`/quality/quality-control-plans/${id}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quality control plan');
      showToast('error', err.message || 'Failed to fetch quality control plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Inspections
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [inspectionsPagination, setInspectionsPagination] = useState<PaginatedResponse<Inspection> | null>(null);

  const fetchInspections = useCallback(async (filters?: QualityFilters, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters?.inspectionType && { inspectionType: filters.inspectionType }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.result && { result: filters.result }),
        ...(filters?.inspectorId && { inspectorId: filters.inspectorId }),
        ...(filters?.supplierId && { supplierId: filters.supplierId }),
        ...(filters?.itemId && { itemId: filters.itemId }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      });

      const response = await apiClient.get<PaginatedResponse<Inspection>>(`/quality/inspections?${params}`);
      setInspections(response.data.items);
      setInspectionsPagination(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inspections');
      showToast('error', err.message || 'Failed to fetch inspections');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createInspection = useCallback(async (data: Partial<Inspection>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ApiResponse<Inspection>>('/quality/inspections', data);
      showToast('success', 'Inspection created successfully');
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create inspection');
      showToast('error', err.message || 'Failed to create inspection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateInspectionStatus = useCallback(async (id: string, status: string, data?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.patch<ApiResponse<Inspection>>(`/quality/inspections/${id}/status`, {
        status,
        ...data,
      });
      showToast('success', 'Inspection status updated successfully');
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update inspection status');
      showToast('error', err.message || 'Failed to update inspection status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getInspection = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<ApiResponse<Inspection>>(`/quality/inspections/${id}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inspection');
      showToast('error', err.message || 'Failed to fetch inspection');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Non-Conformances
  const [nonConformances, setNonConformances] = useState<NonConformance[]>([]);
  const [nonConformancesPagination, setNonConformancesPagination] = useState<PaginatedResponse<NonConformance> | null>(null);

  const fetchNonConformances = useCallback(async (filters?: QualityFilters, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.severity && { severity: filters.severity }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
        ...(filters?.supplierId && { supplierId: filters.supplierId }),
        ...(filters?.itemId && { itemId: filters.itemId }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      });

      const response = await apiClient.get<PaginatedResponse<NonConformance>>(`/quality/non-conformances?${params}`);
      setNonConformances(response.data.items);
      setNonConformancesPagination(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch non-conformances');
      showToast('error', err.message || 'Failed to fetch non-conformances');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createNonConformance = useCallback(async (data: Partial<NonConformance>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post<ApiResponse<NonConformance>>('/quality/non-conformances', data);
      showToast('success', 'Non-conformance created successfully');
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create non-conformance');
      showToast('error', err.message || 'Failed to create non-conformance');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Quality Metrics
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);

  const fetchQualityMetrics = useCallback(async (filters?: QualityFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        ...(filters?.metricType && { metricType: filters.metricType }),
        ...(filters?.period && { period: filters.period }),
        ...(filters?.itemId && { itemId: filters.itemId }),
        ...(filters?.supplierId && { supplierId: filters.supplierId }),
        ...(filters?.location && { location: filters.location }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      });

      const response = await apiClient.get<{ metrics: QualityMetric[] }>(`/quality/quality-metrics?${params}`);
      setQualityMetrics(response.data.metrics);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quality metrics');
      showToast('error', err.message || 'Failed to fetch quality metrics');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Quality Standards
  const [qualityStandards, setQualityStandards] = useState<QualityStandard[]>([]);

  const fetchQualityStandards = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<QualityStandard[]>('/quality/quality-standards');
      setQualityStandards(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quality standards');
      showToast('error', err.message || 'Failed to fetch quality standards');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Quality Audits
  const [qualityAudits, setQualityAudits] = useState<QualityAudit[]>([]);

  const fetchQualityAudits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get<QualityAudit[]>('/quality/quality-audits');
      setQualityAudits(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quality audits');
      showToast('error', err.message || 'Failed to fetch quality audits');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    // State
    loading,
    error,
    qualityPlans,
    qualityPlansPagination,
    inspections,
    inspectionsPagination,
    nonConformances,
    nonConformancesPagination,
    qualityMetrics,
    qualityStandards,
    qualityAudits,

    // Quality Control Plans
    fetchQualityPlans,
    createQualityPlan,
    getQualityPlan,

    // Inspections
    fetchInspections,
    createInspection,
    updateInspectionStatus,
    getInspection,

    // Non-Conformances
    fetchNonConformances,
    createNonConformance,

    // Quality Metrics
    fetchQualityMetrics,

    // Quality Standards
    fetchQualityStandards,

    // Quality Audits
    fetchQualityAudits,
  };
}; 