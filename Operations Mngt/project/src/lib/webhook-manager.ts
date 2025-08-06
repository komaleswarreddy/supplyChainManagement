import { apiGateway } from './api-gateway';

export interface Webhook {
  id: string;
  event: string;
  url: string;
  createdAt: string;
  lastTriggered?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FAILED';
  failureCount: number;
  headers?: Record<string, string>;
}

export interface WebhookEvent {
  id: string;
  event: string;
  payload: any;
  timestamp: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED';
  attempts: number;
  response?: {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  };
}

export interface WebhookRegistrationOptions {
  event: string;
  url: string;
  secret?: string;
  description?: string;
  headers?: Record<string, string>;
  retryConfig?: {
    maxRetries: number;
    retryInterval: number; // in milliseconds
  };
}

class WebhookManager {
  private static instance: WebhookManager;
  private webhooks: Map<string, Webhook> = new Map();
  private eventListeners: Map<string, Set<(payload: any) => void>> = new Map();

  private constructor() {
    // Private constructor to enforce singleton pattern
    this.loadWebhooks();
  }

  public static getInstance(): WebhookManager {
    if (!WebhookManager.instance) {
      WebhookManager.instance = new WebhookManager();
    }
    return WebhookManager.instance;
  }

  /**
   * Load webhooks from the API
   */
  private async loadWebhooks(): Promise<void> {
    try {
      const response = await apiGateway.get<Webhook[]>('/webhooks');
      response.data.forEach(webhook => {
        this.webhooks.set(webhook.id, webhook);
      });
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    }
  }

  /**
   * Register a new webhook
   */
  public async registerWebhook(options: WebhookRegistrationOptions): Promise<Webhook> {
    try {
      const response = await apiGateway.post<Webhook>('/webhooks', options);
      const webhook = response.data;
      this.webhooks.set(webhook.id, webhook);
      return webhook;
    } catch (error) {
      console.error('Failed to register webhook:', error);
      throw error;
    }
  }

  /**
   * Unregister a webhook
   */
  public async unregisterWebhook(id: string): Promise<boolean> {
    try {
      await apiGateway.delete(`/webhooks/${id}`);
      this.webhooks.delete(id);
      return true;
    } catch (error) {
      console.error(`Failed to unregister webhook ${id}:`, error);
      return false;
    }
  }

  /**
   * Get all registered webhooks
   */
  public getWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get webhooks for a specific event
   */
  public getWebhooksForEvent(event: string): Webhook[] {
    return Array.from(this.webhooks.values()).filter(
      webhook => webhook.event === event || webhook.event === '*'
    );
  }

  /**
   * Trigger a webhook event
   */
  public async triggerEvent(event: string, payload: any): Promise<WebhookEvent[]> {
    const webhooks = this.getWebhooksForEvent(event);
    const results: WebhookEvent[] = [];

    // Also trigger local event listeners
    this.triggerLocalListeners(event, payload);

    // No webhooks to trigger
    if (webhooks.length === 0) {
      return results;
    }

    // Create webhook event records
    const webhookEvents = webhooks.map(webhook => ({
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      event,
      webhook: webhook.id,
      payload,
      timestamp: new Date().toISOString(),
      status: 'PENDING' as const,
      attempts: 0,
    }));

    // Trigger webhooks
    const triggerPromises = webhookEvents.map(async webhookEvent => {
      try {
        const webhook = this.webhooks.get(webhookEvent.webhook);
        if (!webhook) {
          throw new Error(`Webhook ${webhookEvent.webhook} not found`);
        }

        const response = await apiGateway.post<WebhookEvent>('/webhooks/trigger', {
          webhookId: webhook.id,
          event,
          payload,
        });

        results.push(response.data);
        return response.data;
      } catch (error) {
        console.error(`Failed to trigger webhook ${webhookEvent.webhook}:`, error);
        
        // Update webhook event status
        webhookEvent.status = 'FAILED';
        webhookEvent.attempts += 1;
        
        results.push(webhookEvent as WebhookEvent);
        return webhookEvent;
      }
    });

    await Promise.all(triggerPromises);
    return results;
  }

  /**
   * Add a local event listener
   */
  public addEventListener(event: string, listener: (payload: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * Remove a local event listener
   */
  public removeEventListener(event: string, listener: (payload: any) => void): void {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.delete(listener);
    }
  }

  /**
   * Trigger local event listeners
   */
  private triggerLocalListeners(event: string, payload: any): void {
    // Trigger specific event listeners
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event)!.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // Trigger wildcard listeners
    if (this.eventListeners.has('*')) {
      this.eventListeners.get('*')!.forEach(listener => {
        try {
          listener({ event, payload });
        } catch (error) {
          console.error(`Error in wildcard event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get webhook event history
   */
  public async getWebhookEventHistory(
    filters?: {
      webhookId?: string;
      event?: string;
      status?: 'PENDING' | 'DELIVERED' | 'FAILED';
      startDate?: string;
      endDate?: string;
    }
  ): Promise<WebhookEvent[]> {
    try {
      const response = await apiGateway.get<WebhookEvent[]>('/webhooks/events', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get webhook event history:', error);
      throw error;
    }
  }

  /**
   * Retry a failed webhook event
   */
  public async retryWebhookEvent(eventId: string): Promise<WebhookEvent> {
    try {
      const response = await apiGateway.post<WebhookEvent>(`/webhooks/events/${eventId}/retry`);
      return response.data;
    } catch (error) {
      console.error(`Failed to retry webhook event ${eventId}:`, error);
      throw error;
    }
  }
}

// Export the singleton instance
export const webhookManager = WebhookManager.getInstance();