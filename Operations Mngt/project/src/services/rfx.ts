import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type { 
  Rfx, 
  RfxFormData, 
  RfxFilters,
  SupplierResponse,
  RfxDocument 
} from '@/types/rfx';

// Configuration
const API_ENDPOINTS = {
  RFX: '/api/procurement/rfx',
  RFX_RESPONSES: (id: string) => `/api/procurement/rfx/${id}/responses`,
  RFX_ANALYTICS: '/api/procurement/rfx/analytics',
} as const;

// Mock data for development/fallback
const MOCK_RFX: Rfx[] = Array.from({ length: 25 }, (_, i) => ({
  id: `rfx-${i + 1}`,
  number: `RFX-2024-${String(i + 1).padStart(4, '0')}`,
  title: `${['IT Equipment RFQ', 'Professional Services RFP', 'Office Supplies RFI', 'Maintenance Services RFQ', 'Software License RFP'][i % 5]} ${i + 1}`,
  description: `${['Request for quotation for IT equipment and accessories', 'Request for proposal for professional consulting services', 'Request for information about office supplies', 'Request for quotation for maintenance services', 'Request for proposal for software licensing'][i % 5]}`,
  type: ['RFI', 'RFP', 'RFQ'][i % 3] as 'RFI' | 'RFP' | 'RFQ',
  status: ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'CLOSED', 'AWARDED'][i % 5] as any,
  publishDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
  closeDate: new Date(Date.now() + (Math.random() * 60 + 7) * 24 * 60 * 60 * 1000).toISOString(),
  currency: 'USD',
  estimatedValue: Math.floor(Math.random() * 500000) + 10000,
  responsesCount: Math.floor(Math.random() * 8) + 1,
  department: ['IT', 'HR', 'Finance', 'Operations', 'Marketing'][i % 5],
  category: ['EQUIPMENT', 'SERVICES', 'SOFTWARE', 'SUPPLIES', 'MAINTENANCE'][i % 5],
  sections: [
    {
      id: `section-${i}-1`,
      title: 'Company Information',
      description: 'General information about your company',
      order: 1,
      questions: [
        {
          id: `question-${i}-1`,
          text: 'Company Name',
          required: true,
          format: 'TEXT',
        },
        {
          id: `question-${i}-2`,
          text: 'Years in Business',
          required: true,
          format: 'NUMBER',
        },
      ],
    },
    {
      id: `section-${i}-2`,
      title: 'Technical Requirements',
      description: 'Detailed technical specifications and requirements',
      order: 2,
      questions: [
        {
          id: `question-${i}-3`,
          text: 'Technical Specifications',
          required: true,
          format: 'TEXTAREA',
        },
      ],
    },
  ],
  documents: [
    {
      id: `doc-${i}-1`,
      name: 'Technical_Requirements.pdf',
      url: `/documents/tech-req-${i}.pdf`,
      type: 'REQUIREMENT',
      size: Math.floor(Math.random() * 5000000) + 100000,
      uploadedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
}));

const MOCK_RESPONSES: SupplierResponse[] = Array.from({ length: 15 }, (_, i) => ({
  id: `response-${i + 1}`,
  rfxId: `rfx-${Math.floor(i / 3) + 1}`,
  supplierId: `supplier-${i + 1}`,
  supplierName: `Supplier ${i + 1} Inc.`,
  submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
  status: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'][i % 5] as any,
  totalValue: Math.floor(Math.random() * 200000) + 50000,
  currency: 'USD',
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  responses: [
    {
      questionId: `question-${Math.floor(i / 3) + 1}-1`,
      answer: `Supplier ${i + 1} Corporation`,
    },
    {
      questionId: `question-${Math.floor(i / 3) + 1}-2`,
      answer: `${Math.floor(Math.random() * 20) + 5}`,
    },
  ],
  documents: [
    {
      id: `response-doc-${i}-1`,
      name: `Proposal_${i + 1}.pdf`,
      url: `/documents/proposal-${i}.pdf`,
      type: 'PROPOSAL',
      size: Math.floor(Math.random() * 3000000) + 500000,
      uploadedAt: new Date().toISOString(),
    },
  ],
  createdAt: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Service class for RFX operations
export class RfxService {
  /**
   * Get all RFX documents with pagination and filters
   */
  static async getRfxList(params: PaginationParams & RfxFilters): Promise<PaginatedResponse<Rfx>> {
    try {
      const response = await api.get<PaginatedResponse<Rfx>>(API_ENDPOINTS.RFX, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Apply filters to mock data
      let filteredData = [...MOCK_RFX];
      
      if (params.type) {
        filteredData = filteredData.filter(rfx => rfx.type === params.type);
      }
      
      if (params.status) {
        filteredData = filteredData.filter(rfx => rfx.status === params.status);
      }
      
      if (params.department) {
        filteredData = filteredData.filter(rfx => rfx.department === params.department);
      }
      
      if (params.category) {
        filteredData = filteredData.filter(rfx => rfx.category === params.category);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(rfx => 
          rfx.title.toLowerCase().includes(searchLower) ||
          rfx.number.toLowerCase().includes(searchLower) ||
          rfx.description.toLowerCase().includes(searchLower)
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
   * Get RFX by ID
   */
  static async getRfxById(id: string): Promise<Rfx> {
    try {
      const response = await api.get<ApiResponse<Rfx>>(`${API_ENDPOINTS.RFX}/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      const rfx = MOCK_RFX.find(r => r.id === id);
      if (!rfx) {
        throw new Error(`RFX with ID ${id} not found`);
      }
      return rfx;
    }
  }

  /**
   * Create new RFX
   */
  static async createRfx(data: RfxFormData): Promise<Rfx> {
    try {
      const response = await api.post<ApiResponse<Rfx>>(API_ENDPOINTS.RFX, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock creation:', error);
      
      // Mock creation
      const newRfx: Rfx = {
        id: `rfx-${Date.now()}`,
        number: `RFX-${new Date().getFullYear()}-${String(MOCK_RFX.length + 1).padStart(4, '0')}`,
        title: data.title,
        description: data.description || '',
        type: data.type,
        status: 'DRAFT',
        publishDate: data.publishDate,
        closeDate: data.closeDate,
        currency: data.currency || 'USD',
        estimatedValue: data.estimatedValue,
        responsesCount: 0,
        department: data.department || 'General',
        category: data.category || 'OTHER',
        sections: data.sections || [],
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      
      MOCK_RFX.unshift(newRfx);
      return newRfx;
    }
  }

  /**
   * Update RFX
   */
  static async updateRfx(id: string, data: Partial<RfxFormData>): Promise<Rfx> {
    try {
      const response = await api.put<ApiResponse<Rfx>>(`${API_ENDPOINTS.RFX}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock update:', error);
      
      const index = MOCK_RFX.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`RFX with ID ${id} not found`);
      }
      
      MOCK_RFX[index] = {
        ...MOCK_RFX[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return MOCK_RFX[index];
    }
  }

  /**
   * Delete RFX
   */
  static async deleteRfx(id: string): Promise<void> {
    try {
      await api.delete(`${API_ENDPOINTS.RFX}/${id}`);
    } catch (error) {
      console.warn('API call failed, using mock deletion:', error);
      
      const index = MOCK_RFX.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`RFX with ID ${id} not found`);
      }
      
      MOCK_RFX.splice(index, 1);
    }
  }

  /**
   * Get supplier responses for an RFX
   */
  static async getRfxResponses(rfxId: string, params?: PaginationParams): Promise<PaginatedResponse<SupplierResponse>> {
    try {
      const response = await api.get<PaginatedResponse<SupplierResponse>>(
        API_ENDPOINTS.RFX_RESPONSES(rfxId), 
        { params }
      );
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
      
      // Filter responses for this RFX
      const rfxResponses = MOCK_RESPONSES.filter(r => r.rfxId === rfxId);
      
      // Apply pagination
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const offset = (page - 1) * pageSize;
      const items = rfxResponses.slice(offset, offset + pageSize);
      
      return {
        items,
        total: rfxResponses.length,
        page,
        pageSize,
        totalPages: Math.ceil(rfxResponses.length / pageSize),
      };
    }
  }

  /**
   * Submit supplier response
   */
  static async submitResponse(rfxId: string, responseData: any): Promise<SupplierResponse> {
    try {
      const response = await api.post<ApiResponse<SupplierResponse>>(
        API_ENDPOINTS.RFX_RESPONSES(rfxId), 
        responseData
      );
      return response.data.data;
    } catch (error) {
      console.warn('API call failed, using mock submission:', error);
      
      // Mock response submission
      const newResponse: SupplierResponse = {
        id: `response-${Date.now()}`,
        rfxId,
        supplierId: responseData.supplierId || 'current-supplier',
        supplierName: responseData.supplierName || 'Current Supplier',
        submittedAt: new Date().toISOString(),
        status: 'SUBMITTED',
        totalValue: responseData.totalValue || 0,
        currency: responseData.currency || 'USD',
        validUntil: responseData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        responses: responseData.responses || [],
        documents: responseData.documents || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      MOCK_RESPONSES.unshift(newResponse);
      return newResponse;
    }
  }

  /**
   * Get RFX analytics
   */
  static async getRfxAnalytics(params?: { 
    startDate?: string; 
    endDate?: string; 
    type?: string; 
    department?: string; 
  }): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.RFX_ANALYTICS, { params });
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock analytics:', error);
      
      // Mock analytics data
      return {
        summary: {
          totalRfx: MOCK_RFX.length,
          activeRfx: MOCK_RFX.filter(r => r.status === 'PUBLISHED' || r.status === 'IN_PROGRESS').length,
          completedRfx: MOCK_RFX.filter(r => r.status === 'CLOSED' || r.status === 'AWARDED').length,
          totalValue: MOCK_RFX.reduce((sum, r) => sum + (r.estimatedValue || 0), 0),
          averageResponseTime: 5.2,
          averageResponsesPerRfx: 3.8,
        },
        byType: [
          { type: 'RFQ', count: MOCK_RFX.filter(r => r.type === 'RFQ').length },
          { type: 'RFP', count: MOCK_RFX.filter(r => r.type === 'RFP').length },
          { type: 'RFI', count: MOCK_RFX.filter(r => r.type === 'RFI').length },
        ],
        byStatus: [
          { status: 'DRAFT', count: MOCK_RFX.filter(r => r.status === 'DRAFT').length },
          { status: 'PUBLISHED', count: MOCK_RFX.filter(r => r.status === 'PUBLISHED').length },
          { status: 'IN_PROGRESS', count: MOCK_RFX.filter(r => r.status === 'IN_PROGRESS').length },
          { status: 'CLOSED', count: MOCK_RFX.filter(r => r.status === 'CLOSED').length },
          { status: 'AWARDED', count: MOCK_RFX.filter(r => r.status === 'AWARDED').length },
        ],
        timeline: Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - 11 + i);
          return {
            month: date.toISOString().slice(0, 7),
            count: Math.floor(Math.random() * 8) + 2,
            value: Math.floor(Math.random() * 200000) + 50000,
          };
        }),
      };
    }
  }

  /**
   * Publish RFX (change status to PUBLISHED)
   */
  static async publishRfx(id: string): Promise<Rfx> {
    return this.updateRfx(id, { status: 'PUBLISHED' });
  }

  /**
   * Close RFX (change status to CLOSED)
   */
  static async closeRfx(id: string): Promise<Rfx> {
    return this.updateRfx(id, { status: 'CLOSED' });
  }

  /**
   * Award RFX to a supplier
   */
  static async awardRfx(id: string, winningSupplierId: string): Promise<Rfx> {
    return this.updateRfx(id, { 
      status: 'AWARDED',
      winningSupplierId,
    });
  }
}

// Export individual functions for backward compatibility
export const getRfxList = RfxService.getRfxList;
export const getRfxById = RfxService.getRfxById;
export const createRfx = RfxService.createRfx;
export const updateRfx = RfxService.updateRfx;
export const deleteRfx = RfxService.deleteRfx;
export const getRfxResponses = RfxService.getRfxResponses;
export const submitResponse = RfxService.submitResponse;
export const getRfxAnalytics = RfxService.getRfxAnalytics;
export const publishRfx = RfxService.publishRfx;
export const closeRfx = RfxService.closeRfx;
export const awardRfx = RfxService.awardRfx;

export default RfxService;