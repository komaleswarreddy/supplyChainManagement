import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { eq, and, or, like, desc, asc, gte, lte } from 'drizzle-orm';
import { AppError } from '../utils/app-error';
import { authenticate, hasPermissions } from '../middleware/auth';

// Define route schemas
const createForecastSchema = z.object({
  forecastNumber: z.string().min(1, 'Forecast number is required'),
  name: z.string().min(1, 'Forecast name is required'),
  description: z.string().optional(),
  type: z.enum(['DEMAND', 'SUPPLY', 'FINANCIAL', 'CAPACITY']),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('DRAFT'),
  forecastPeriod: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
    periods: z.number().int().positive(),
  }),
  forecastModel: z.object({
    algorithm: z.enum(['LINEAR_REGRESSION', 'EXPONENTIAL_SMOOTHING', 'ARIMA', 'NEURAL_NETWORK', 'ENSEMBLE']),
    parameters: z.record(z.any()),
    accuracy: z.number().min(0).max(100).optional(),
    confidence: z.number().min(0).max(100).optional(),
  }),
  scope: z.object({
    items: z.array(z.string().uuid()).optional(),
    categories: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    suppliers: z.array(z.string().uuid()).optional(),
    customers: z.array(z.string().uuid()).optional(),
  }),
  historicalData: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    dataPoints: z.number().int().min(1),
    dataQuality: z.number().min(0).max(100),
  }),
  forecastData: z.array(z.object({
    period: z.string(),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    forecast: z.number().min(0),
    upperBound: z.number().min(0).optional(),
    lowerBound: z.number().min(0).optional(),
    confidence: z.number().min(0).max(100).optional(),
    factors: z.array(z.object({
      name: z.string(),
      impact: z.number(),
      weight: z.number().min(0).max(1),
    })).optional(),
  })).optional(),
  externalFactors: z.array(z.object({
    name: z.string(),
    type: z.enum(['SEASONAL', 'ECONOMIC', 'PROMOTIONAL', 'COMPETITIVE', 'REGULATORY']),
    impact: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
    weight: z.number().min(0).max(1),
    description: z.string().optional(),
  })).optional(),
  assumptions: z.array(z.string()).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

const createDemandPlanSchema = z.object({
  planNumber: z.string().min(1, 'Plan number is required'),
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED']).default('DRAFT'),
  planningHorizon: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
    buckets: z.number().int().positive(),
  }),
  demandSources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['FORECAST', 'SALES_ORDER', 'CUSTOMER_COMMITMENT', 'PROMOTION', 'SAFETY_STOCK']),
    weight: z.number().min(0).max(1),
    priority: z.number().int().min(1),
    data: z.array(z.object({
      period: z.string(),
      quantity: z.number().min(0),
      confidence: z.number().min(0).max(100).optional(),
    })),
  })),
  consolidatedDemand: z.array(z.object({
    period: z.string(),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    totalDemand: z.number().min(0),
    confirmedDemand: z.number().min(0),
    forecastDemand: z.number().min(0),
    safetyBuffer: z.number().min(0).optional(),
    adjustments: z.array(z.object({
      type: z.string(),
      amount: z.number(),
      reason: z.string(),
    })).optional(),
  })).optional(),
  constraints: z.array(z.object({
    type: z.enum(['CAPACITY', 'RESOURCE', 'MATERIAL', 'REGULATORY', 'BUDGET']),
    description: z.string(),
    impact: z.enum(['HARD', 'SOFT']),
    value: z.number().optional(),
    unit: z.string().optional(),
  })).optional(),
  scenarios: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    probability: z.number().min(0).max(100),
    adjustments: z.record(z.number()),
  })).optional(),
  kpis: z.object({
    demandAccuracy: z.number().min(0).max(100).optional(),
    planningAccuracy: z.number().min(0).max(100).optional(),
    serviceLevel: z.number().min(0).max(100).optional(),
    inventoryTurnover: z.number().min(0).optional(),
    fillRate: z.number().min(0).max(100).optional(),
  }).optional(),
  notes: z.string().optional(),
});

const createSupplyPlanSchema = z.object({
  planNumber: z.string().min(1, 'Plan number is required'),
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  demandPlanId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED']).default('DRAFT'),
  planningHorizon: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
    buckets: z.number().int().positive(),
  }),
  supplySources: z.array(z.object({
    id: z.string(),
    type: z.enum(['PRODUCTION', 'PROCUREMENT', 'TRANSFER', 'SUBCONTRACTING']),
    sourceId: z.string().uuid(),
    sourceName: z.string(),
    capacity: z.number().min(0),
    leadTime: z.number().int().min(0),
    cost: z.number().min(0),
    reliability: z.number().min(0).max(100),
    constraints: z.array(z.object({
      type: z.string(),
      value: z.number(),
      unit: z.string(),
    })).optional(),
  })),
  supplyPlan: z.array(z.object({
    period: z.string(),
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    plannedSupply: z.number().min(0),
    availableCapacity: z.number().min(0),
    utilization: z.number().min(0).max(100),
    allocations: z.array(z.object({
      sourceId: z.string(),
      quantity: z.number().min(0),
      cost: z.number().min(0),
    })),
  })).optional(),
  optimization: z.object({
    objective: z.enum(['MINIMIZE_COST', 'MAXIMIZE_SERVICE', 'BALANCE_BOTH']),
    constraints: z.array(z.string()),
    results: z.object({
      totalCost: z.number().min(0),
      serviceLevel: z.number().min(0).max(100),
      utilizationRate: z.number().min(0).max(100),
    }).optional(),
  }).optional(),
  riskAssessment: z.array(z.object({
    sourceId: z.string(),
    riskType: z.enum(['SUPPLIER', 'CAPACITY', 'QUALITY', 'LOGISTICS', 'REGULATORY']),
    probability: z.number().min(0).max(100),
    impact: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    mitigation: z.string(),
  })).optional(),
  notes: z.string().optional(),
});

// Supply Chain routes
export default async function supplyChainRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all routes
  fastify.addHook('preHandler', authenticate);
  
  // Get all forecasts
  fastify.get('/forecasts', {
    preHandler: hasPermissions(['view_supply_chain']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          type: { type: 'string', enum: ['DEMAND', 'SUPPLY', 'FINANCIAL', 'CAPACITY'] },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'] },
          algorithm: { type: 'string', enum: ['LINEAR_REGRESSION', 'EXPONENTIAL_SMOOTHING', 'ARIMA', 'NEURAL_NETWORK', 'ENSEMBLE'] },
          startDateFrom: { type: 'string', format: 'date-time' },
          startDateTo: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  forecastNumber: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  status: { type: 'string' },
                  algorithm: { type: 'string' },
                  accuracy: { type: 'number' },
                  confidence: { type: 'number' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                  periods: { type: 'number' },
                  createdAt: { type: 'string', format: 'date-time' },
                  createdBy: { type: 'object' },
                },
              },
            },
            total: { type: 'number' },
            page: { type: 'number' },
            pageSize: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      type, 
      status, 
      algorithm,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockForecasts = Array.from({ length: 50 }, (_, i) => ({
      id: `forecast-${i + 1}`,
      forecastNumber: `FC-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      name: `Forecast ${i + 1}`,
      description: `Demand forecast for product category ${i % 5 + 1}`,
      type: ['DEMAND', 'SUPPLY', 'FINANCIAL', 'CAPACITY'][i % 4] as any,
      status: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'][i % 4] as any,
      algorithm: ['LINEAR_REGRESSION', 'EXPONENTIAL_SMOOTHING', 'ARIMA', 'NEURAL_NETWORK', 'ENSEMBLE'][i % 5] as any,
      accuracy: Math.floor(Math.random() * 30) + 70,
      confidence: Math.floor(Math.random() * 20) + 80,
      startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + (Math.random() * 180 + 30) * 24 * 60 * 60 * 1000).toISOString(),
      periods: Math.floor(Math.random() * 12) + 6,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    }));
    
    // Apply filters
    let filteredData = mockForecasts;
    
    if (type) {
      filteredData = filteredData.filter(item => item.type === type);
    }
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (algorithm) {
      filteredData = filteredData.filter(item => item.algorithm === algorithm);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.forecastNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Get forecast by ID
  fastify.get('/forecasts/:id', {
    preHandler: hasPermissions(['view_supply_chain']),
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    
    // Mock detailed forecast data
    const mockForecast = {
      id,
      forecastNumber: 'FC-2024-0001',
      name: 'Q2 2024 Demand Forecast',
      description: 'Quarterly demand forecast for electronics category',
      type: 'DEMAND',
      status: 'ACTIVE',
      forecastPeriod: {
        startDate: '2024-04-01T00:00:00Z',
        endDate: '2024-06-30T23:59:59Z',
        frequency: 'MONTHLY',
        periods: 3,
      },
      forecastModel: {
        algorithm: 'EXPONENTIAL_SMOOTHING',
        parameters: {
          alpha: 0.3,
          beta: 0.1,
          gamma: 0.2,
          seasonalPeriods: 12,
        },
        accuracy: 85.2,
        confidence: 92.5,
      },
      scope: {
        items: ['item-1', 'item-2', 'item-3'],
        categories: ['Electronics', 'Accessories'],
        locations: ['US-WEST', 'US-EAST'],
        suppliers: ['supplier-1', 'supplier-2'],
        customers: ['customer-1', 'customer-2', 'customer-3'],
      },
      historicalData: {
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        dataPoints: 15,
        dataQuality: 94.8,
      },
      forecastData: [
        {
          period: '2024-04',
          periodStart: '2024-04-01T00:00:00Z',
          periodEnd: '2024-04-30T23:59:59Z',
          forecast: 12500,
          upperBound: 14000,
          lowerBound: 11000,
          confidence: 92.5,
          factors: [
            { name: 'Seasonal Trend', impact: 1.15, weight: 0.4 },
            { name: 'Economic Indicator', impact: 1.05, weight: 0.3 },
            { name: 'Marketing Campaign', impact: 1.08, weight: 0.3 },
          ],
        },
        {
          period: '2024-05',
          periodStart: '2024-05-01T00:00:00Z',
          periodEnd: '2024-05-31T23:59:59Z',
          forecast: 13200,
          upperBound: 14800,
          lowerBound: 11600,
          confidence: 90.2,
          factors: [
            { name: 'Seasonal Trend', impact: 1.20, weight: 0.4 },
            { name: 'Economic Indicator', impact: 1.03, weight: 0.3 },
            { name: 'Marketing Campaign', impact: 1.12, weight: 0.3 },
          ],
        },
        {
          period: '2024-06',
          periodStart: '2024-06-01T00:00:00Z',
          periodEnd: '2024-06-30T23:59:59Z',
          forecast: 11800,
          upperBound: 13200,
          lowerBound: 10400,
          confidence: 88.7,
          factors: [
            { name: 'Seasonal Trend', impact: 1.10, weight: 0.4 },
            { name: 'Economic Indicator', impact: 1.02, weight: 0.3 },
            { name: 'Marketing Campaign', impact: 1.05, weight: 0.3 },
          ],
        },
      ],
      externalFactors: [
        {
          name: 'Summer Season',
          type: 'SEASONAL',
          impact: 'POSITIVE',
          weight: 0.4,
          description: 'Increased demand during summer months',
        },
        {
          name: 'Economic Growth',
          type: 'ECONOMIC',
          impact: 'POSITIVE',
          weight: 0.3,
          description: 'Positive GDP growth forecast',
        },
        {
          name: 'Product Launch',
          type: 'PROMOTIONAL',
          impact: 'POSITIVE',
          weight: 0.3,
          description: 'New product line launch in Q2',
        },
      ],
      assumptions: [
        'No major supply chain disruptions',
        'Economic conditions remain stable',
        'Marketing budget maintained at current levels',
        'No significant competitive threats',
      ],
      notes: 'Updated model with latest market intelligence data',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: 'user-1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
    };
    
    return mockForecast;
  });
  
  // Create forecast
  fastify.post('/forecasts', {
    preHandler: hasPermissions(['create_supply_chain']),
    schema: {
      body: {
        type: 'object',
        required: ['forecastNumber', 'name', 'type', 'forecastPeriod', 'forecastModel', 'scope', 'historicalData'],
        properties: {
          forecastNumber: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['DEMAND', 'SUPPLY', 'FINANCIAL', 'CAPACITY'] },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'] },
          forecastPeriod: { type: 'object' },
          forecastModel: { type: 'object' },
          scope: { type: 'object' },
          historicalData: { type: 'object' },
          forecastData: { type: 'array' },
          externalFactors: { type: 'array' },
          assumptions: { type: 'array' },
          notes: { type: 'string' },
          attachments: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createForecastSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newForecast = {
      id: `forecast-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newForecast,
      message: 'Forecast created successfully',
    };
  });
  
  // Get all demand plans
  fastify.get('/demand-plans', {
    preHandler: hasPermissions(['view_supply_chain']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED'] },
          startDateFrom: { type: 'string', format: 'date-time' },
          startDateTo: { type: 'string', format: 'date-time' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      status,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockDemandPlans = Array.from({ length: 30 }, (_, i) => ({
      id: `demand-plan-${i + 1}`,
      planNumber: `DP-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      name: `Demand Plan ${i + 1}`,
      description: `Monthly demand plan for region ${i % 3 + 1}`,
      status: ['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED'][i % 5] as any,
      startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000).toISOString(),
      buckets: Math.floor(Math.random() * 8) + 4,
      demandAccuracy: Math.floor(Math.random() * 20) + 80,
      serviceLevel: Math.floor(Math.random() * 15) + 85,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockDemandPlans;
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.planNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Create demand plan
  fastify.post('/demand-plans', {
    preHandler: hasPermissions(['create_supply_chain']),
    schema: {
      body: {
        type: 'object',
        required: ['planNumber', 'name', 'planningHorizon', 'demandSources'],
        properties: {
          planNumber: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED'] },
          planningHorizon: { type: 'object' },
          demandSources: { type: 'array' },
          consolidatedDemand: { type: 'array' },
          constraints: { type: 'array' },
          scenarios: { type: 'array' },
          kpis: { type: 'object' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createDemandPlanSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newDemandPlan = {
      id: `demand-plan-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newDemandPlan,
      message: 'Demand plan created successfully',
    };
  });
  
  // Get all supply plans
  fastify.get('/supply-plans', {
    preHandler: hasPermissions(['view_supply_chain']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          pageSize: { type: 'number', default: 10 },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED'] },
          demandPlanId: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { 
      page = 1, 
      pageSize = 10, 
      status,
      demandPlanId,
      search 
    } = request.query as any;
    
    // Mock data for demonstration
    const mockSupplyPlans = Array.from({ length: 25 }, (_, i) => ({
      id: `supply-plan-${i + 1}`,
      planNumber: `SP-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`,
      name: `Supply Plan ${i + 1}`,
      description: `Monthly supply plan for facility ${i % 3 + 1}`,
      demandPlanId: `demand-plan-${(i % 10) + 1}`,
      status: ['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED'][i % 5] as any,
      startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + (Math.random() * 90 + 30) * 24 * 60 * 60 * 1000).toISOString(),
      totalCost: Math.floor(Math.random() * 500000) + 100000,
      serviceLevel: Math.floor(Math.random() * 15) + 85,
      utilizationRate: Math.floor(Math.random() * 20) + 75,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    
    // Apply filters
    let filteredData = mockSupplyPlans;
    
    if (status) {
      filteredData = filteredData.filter(item => item.status === status);
    }
    
    if (demandPlanId) {
      filteredData = filteredData.filter(item => item.demandPlanId === demandPlanId);
    }
    
    if (search) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.planNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const items = filteredData.slice(offset, offset + pageSize);
    
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  });
  
  // Create supply plan
  fastify.post('/supply-plans', {
    preHandler: hasPermissions(['create_supply_chain']),
    schema: {
      body: {
        type: 'object',
        required: ['planNumber', 'name', 'planningHorizon', 'supplySources'],
        properties: {
          planNumber: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          demandPlanId: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'APPROVED', 'EXECUTED', 'CANCELLED'] },
          planningHorizon: { type: 'object' },
          supplySources: { type: 'array' },
          supplyPlan: { type: 'array' },
          optimization: { type: 'object' },
          riskAssessment: { type: 'array' },
          notes: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = createSupplyPlanSchema.parse(request.body);
    const user = request.user as any;
    
    // Mock creation
    const newSupplyPlan = {
      id: `supply-plan-${Date.now()}`,
      ...data,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.id,
    };
    
    reply.status(201);
    return {
      ...newSupplyPlan,
      message: 'Supply plan created successfully',
    };
  });
  
  // Get supply chain analytics
  fastify.get('/analytics', {
    preHandler: hasPermissions(['view_reports']),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          category: { type: 'string' },
          location: { type: 'string' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // Mock analytics data
    const analytics = {
      summary: {
        activeForecasts: 45,
        activeDemandPlans: 23,
        activeSupplyPlans: 18,
        averageForecastAccuracy: 87.5,
        averageServiceLevel: 94.2,
        totalPlanningValue: 12500000,
      },
      forecastPerformance: {
        accuracy: {
          current: 87.5,
          target: 90.0,
          trend: 'improving',
        },
        bias: {
          current: 2.3,
          target: 5.0,
          trend: 'stable',
        },
        mad: {
          current: 156.8,
          target: 150.0,
          trend: 'declining',
        },
      },
      demandPlanningKpis: {
        planningAccuracy: 91.2,
        demandVariability: 15.8,
        forecastValueAdded: 23.5,
        consensusPlanningCycle: 5.2,
      },
      supplyPlanningKpis: {
        supplyPlanAdherence: 88.7,
        capacityUtilization: 82.3,
        supplierPerformance: 94.1,
        planningCycleTime: 3.8,
      },
      riskAnalysis: [
        {
          category: 'Supplier Risk',
          level: 'MEDIUM',
          score: 65,
          factors: ['Single source dependency', 'Geographic concentration'],
        },
        {
          category: 'Demand Risk',
          level: 'LOW',
          score: 25,
          factors: ['Stable customer base', 'Diversified portfolio'],
        },
        {
          category: 'Capacity Risk',
          level: 'HIGH',
          score: 85,
          factors: ['Limited spare capacity', 'Aging equipment'],
        },
      ],
      scenarioAnalysis: [
        {
          scenario: 'Optimistic',
          probability: 25,
          demandImpact: 15,
          costImpact: -5,
          serviceImpact: 8,
        },
        {
          scenario: 'Most Likely',
          probability: 50,
          demandImpact: 0,
          costImpact: 0,
          serviceImpact: 0,
        },
        {
          scenario: 'Pessimistic',
          probability: 25,
          demandImpact: -20,
          costImpact: 12,
          serviceImpact: -15,
        },
      ],
      timeline: Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        return {
          month: date.toISOString().slice(0, 7),
          forecastAccuracy: Math.floor(Math.random() * 15) + 80,
          serviceLevel: Math.floor(Math.random() * 10) + 90,
          inventoryTurnover: Math.floor(Math.random() * 2) + 6,
          planningCosts: Math.floor(Math.random() * 50000) + 200000,
        };
      }),
      topProducts: [
        { id: 'product-1', name: 'Product A', demandVolume: 15000, accuracy: 92.5 },
        { id: 'product-2', name: 'Product B', demandVolume: 12500, accuracy: 88.2 },
        { id: 'product-3', name: 'Product C', demandVolume: 11200, accuracy: 85.7 },
        { id: 'product-4', name: 'Product D', demandVolume: 9800, accuracy: 91.3 },
        { id: 'product-5', name: 'Product E', demandVolume: 8500, accuracy: 89.1 },
      ],
    };
    
    return analytics;
  });
} 