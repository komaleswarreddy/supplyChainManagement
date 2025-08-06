import { WebSocketServer, WebSocket } from 'ws';
import { logger } from './logger.js';
import crypto from 'crypto';

export interface WebSocketMessage {
  type: string;
  data: any;
  tenantId?: string;
  userId?: string;
}

export interface WebSocketClient {
  id: string;
  ws: WebSocket;
  tenantId: string;
  userId: string;
  subscriptions: Set<string>;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket, request: any) => {
      const clientId = crypto.randomUUID();
      const url = new URL(request.url, 'http://localhost');
      const tenantId = url.searchParams.get('tenantId') || '';
      const userId = url.searchParams.get('userId') || '';

      const client: WebSocketClient = {
        id: clientId,
        ws,
        tenantId,
        userId,
        subscriptions: new Set()
      };

      this.clients.set(clientId, client);

      logger.info(`WebSocket client connected: ${clientId} (tenant: ${tenantId}, user: ${userId})`);

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection_established',
        data: { clientId, message: 'Connected to PLS-SCM WebSocket service' }
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error);
          this.sendToClient(clientId, {
            type: 'error',
            data: { message: 'Invalid message format' }
          });
        }
      });

      ws.on('close', () => {
        this.removeClient(clientId);
        logger.info(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket client error: ${clientId}`, error);
        this.removeClient(clientId);
      });
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message.data);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.data);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', data: {} });
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
        this.sendToClient(clientId, {
          type: 'error',
          data: { message: `Unknown message type: ${message.type}` }
        });
    }
  }

  private handleSubscribe(clientId: string, data: { channels: string[] }): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channels } = data;
    
    for (const channel of channels) {
      // Add to client subscriptions
      client.subscriptions.add(channel);
      
      // Add to global subscriptions
      if (!this.subscriptions.has(channel)) {
        this.subscriptions.set(channel, new Set());
      }
      this.subscriptions.get(channel)!.add(clientId);
    }

    this.sendToClient(clientId, {
      type: 'subscribed',
      data: { channels }
    });

    logger.info(`Client ${clientId} subscribed to channels: ${channels.join(', ')}`);
  }

  private handleUnsubscribe(clientId: string, data: { channels: string[] }): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channels } = data;
    
    for (const channel of channels) {
      // Remove from client subscriptions
      client.subscriptions.delete(channel);
      
      // Remove from global subscriptions
      const channelSubscribers = this.subscriptions.get(channel);
      if (channelSubscribers) {
        channelSubscribers.delete(clientId);
        if (channelSubscribers.size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    }

    this.sendToClient(clientId, {
      type: 'unsubscribed',
      data: { channels }
    });

    logger.info(`Client ${clientId} unsubscribed from channels: ${channels.join(', ')}`);
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all subscriptions
    for (const channel of client.subscriptions) {
      const channelSubscribers = this.subscriptions.get(channel);
      if (channelSubscribers) {
        channelSubscribers.delete(clientId);
        if (channelSubscribers.size === 0) {
          this.subscriptions.delete(channel);
        }
      }
    }

    this.clients.delete(clientId);
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}:`, error);
      this.removeClient(clientId);
    }
  }

  // Public methods for broadcasting messages
  public broadcastToChannel(channel: string, message: WebSocketMessage): void {
    const subscribers = this.subscriptions.get(channel);
    if (!subscribers) return;

    for (const clientId of subscribers) {
      this.sendToClient(clientId, message);
    }

    logger.info(`Broadcasted to channel ${channel}: ${subscribers.size} clients`);
  }

  public broadcastToTenant(tenantId: string, message: WebSocketMessage): void {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.tenantId === tenantId) {
        this.sendToClient(client.id, message);
        count++;
      }
    }

    logger.info(`Broadcasted to tenant ${tenantId}: ${count} clients`);
  }

  public broadcastToUser(userId: string, message: WebSocketMessage): void {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        this.sendToClient(client.id, message);
        count++;
      }
    }

    logger.info(`Broadcasted to user ${userId}: ${count} clients`);
  }

  public broadcastToAll(message: WebSocketMessage): void {
    let count = 0;
    for (const client of this.clients.values()) {
      this.sendToClient(client.id, message);
      count++;
    }

    logger.info(`Broadcasted to all: ${count} clients`);
  }

  // Utility methods
  public getClientCount(): number {
    return this.clients.size;
  }

  public getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  public getChannelSubscriberCount(channel: string): number {
    return this.subscriptions.get(channel)?.size || 0;
  }
}

// Global instance
let wsService: WebSocketService | null = null;

export function initializeWebSocketService(server: any): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
} 