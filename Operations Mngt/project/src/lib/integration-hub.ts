import { apiGateway } from './api-gateway';

export interface IntegrationConfig {
  id: string;
  name: string;
  provider: string;
  type: 'ERP' | 'CRM' | 'ACCOUNTING' | 'WAREHOUSE' | 'SHIPPING' | 'PAYMENT' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ERROR';
  connectionDetails: {
    url: string;
    authType: 'API_KEY' | 'OAUTH2' | 'BASIC' | 'CUSTOM';
    credentials?: Record<string, string>;
    oauthConfig?: {
      clientId: string;
      authorizationUrl: string;
      tokenUrl: string;
      scope: string;
      redirectUri: string;
    };
  };
  syncConfig: {
    frequency: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MANUAL';
    lastSync?: string;
    nextSync?: string;
    direction: 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
    entities: string[];
  };
  mappings: Array<{
    sourceEntity: string;
    targetEntity: string;
    fieldMappings: Array<{
      sourceField: string;
      targetField: string;
      transformation?: string;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSyncResult {
  id: string;
  integrationId: string;
  startTime: string;
  endTime?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  entityType: string;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors?: Array<{
    code: string;
    message: string;
    records?: string[];
  }>;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  eventType: string;
  timestamp: string;
  status: 'SUCCESS' | 'ERROR';
  message: string;
  details?: any;
}

class IntegrationHub {
  private static instance: IntegrationHub;
  private integrations: Map<string, IntegrationConfig> = new Map();
  private syncResults: Map<string, IntegrationSyncResult[]> = new Map();
  private events: IntegrationEvent[] = [];

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.loadIntegrations();
  }

  public static getInstance(): IntegrationHub {
    if (!IntegrationHub.instance) {
      IntegrationHub.instance = new IntegrationHub();
    }
    return IntegrationHub.instance;
  }

  /**
   * Load integrations from the API
   */
  private async loadIntegrations(): Promise<void> {
    try {
      const response = await apiGateway.get<IntegrationConfig[]>('/integrations');
      response.data.forEach(integration => {
        this.integrations.set(integration.id, integration);
      });
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  }

  /**
   * Get all integrations
   */
  public async getIntegrations(): Promise<IntegrationConfig[]> {
    try {
      const response = await apiGateway.get<IntegrationConfig[]>('/integrations');
      return response.data;
    } catch (error) {
      console.error('Failed to get integrations:', error);
      throw error;
    }
  }

  /**
   * Get integration by ID
   */
  public async getIntegration(id: string): Promise<IntegrationConfig> {
    try {
      const response = await apiGateway.get<IntegrationConfig>(`/integrations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get integration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new integration
   */
  public async createIntegration(integration: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<IntegrationConfig> {
    try {
      const response = await apiGateway.post<IntegrationConfig>('/integrations', integration);
      const newIntegration = response.data;
      this.integrations.set(newIntegration.id, newIntegration);
      return newIntegration;
    } catch (error) {
      console.error('Failed to create integration:', error);
      throw error;
    }
  }

  /**
   * Update an integration
   */
  public async updateIntegration(id: string, integration: Partial<IntegrationConfig>): Promise<IntegrationConfig> {
    try {
      const response = await apiGateway.put<IntegrationConfig>(`/integrations/${id}`, integration);
      const updatedIntegration = response.data;
      this.integrations.set(updatedIntegration.id, updatedIntegration);
      return updatedIntegration;
    } catch (error) {
      console.error(`Failed to update integration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an integration
   */
  public async deleteIntegration(id: string): Promise<boolean> {
    try {
      await apiGateway.delete(`/integrations/${id}`);
      this.integrations.delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to delete integration ${id}:`, error);
      return false;
    }
  }

  /**
   * Test an integration connection
   */
  public async testIntegrationConnection(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiGateway.post<{ success: boolean; message: string }>(`/integrations/${id}/test`);
      return response.data;
    } catch (error) {
      console.error(`Failed to test integration ${id}:`, error);
      return { success: false, message: 'Connection test failed' };
    }
  }

  /**
   * Trigger a manual sync for an integration
   */
  public async triggerSync(id: string, entities?: string[]): Promise<IntegrationSyncResult> {
    try {
      const response = await apiGateway.post<IntegrationSyncResult>(`/integrations/${id}/sync`, { entities });
      
      // Add to sync results
      if (!this.syncResults.has(id)) {
        this.syncResults.set(id, []);
      }
      this.syncResults.get(id)!.push(response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Failed to trigger sync for integration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get sync history for an integration
   */
  public async getSyncHistory(id: string): Promise<IntegrationSyncResult[]> {
    try {
      const response = await apiGateway.get<IntegrationSyncResult[]>(`/integrations/${id}/sync-history`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get sync history for integration ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get integration events
   */
  public async getEvents(filters?: {
    integrationId?: string;
    eventType?: string;
    status?: 'SUCCESS' | 'ERROR';
    startDate?: string;
    endDate?: string;
  }): Promise<IntegrationEvent[]> {
    try {
      const response = await apiGateway.get<IntegrationEvent[]>('/integration-events', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get integration events:', error);
      throw error;
    }
  }

  /**
   * Get available integration providers
   */
  public async getProviders(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    logoUrl: string;
    capabilities: string[];
    authTypes: string[];
  }>> {
    try {
      const response = await apiGateway.get<Array<{
        id: string;
        name: string;
        type: string;
        description: string;
        logoUrl: string;
        capabilities: string[];
        authTypes: string[];
      }>>('/integration-providers');
      return response.data;
    } catch (error) {
      console.error('Failed to get integration providers:', error);
      throw error;
    }
  }

  /**
   * Get entity mapping templates for a provider
   */
  public async getMappingTemplates(providerId: string): Promise<Array<{
    sourceEntity: string;
    targetEntity: string;
    description: string;
    fieldMappings: Array<{
      sourceField: string;
      targetField: string;
      description: string;
      required: boolean;
      defaultTransformation?: string;
    }>;
  }>> {
    try {
      const response = await apiGateway.get<Array<{
        sourceEntity: string;
        targetEntity: string;
        description: string;
        fieldMappings: Array<{
          sourceField: string;
          targetField: string;
          description: string;
          required: boolean;
          defaultTransformation?: string;
        }>;
      }>>(`/integration-providers/${providerId}/mapping-templates`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get mapping templates for provider ${providerId}:`, error);
      throw error;
    }
  }

  /**
   * Get OAuth2 authorization URL
   */
  public async getOAuth2AuthorizationUrl(integrationId: string): Promise<string> {
    try {
      const response = await apiGateway.get<{ url: string }>(`/integrations/${integrationId}/oauth2-url`);
      return response.data.url;
    } catch (error) {
      console.error(`Failed to get OAuth2 authorization URL for integration ${integrationId}:`, error);
      throw error;
    }
  }

  /**
   * Complete OAuth2 authorization
   */
  public async completeOAuth2Authorization(integrationId: string, code: string, state: string): Promise<boolean> {
    try {
      await apiGateway.post(`/integrations/${integrationId}/oauth2-callback`, { code, state });
      return true;
    } catch (error) {
      console.error(`Failed to complete OAuth2 authorization for integration ${integrationId}:`, error);
      return false;
    }
  }
}

// Export the singleton instance
export const integrationHub = IntegrationHub.getInstance();