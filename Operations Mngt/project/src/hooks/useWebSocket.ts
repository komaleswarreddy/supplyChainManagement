import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTenant } from './useTenant';

export interface WebSocketMessage {
  type: string;
  data: any;
  tenantId?: string;
  userId?: string;
}

export interface WebSocketHook {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
  lastMessage: WebSocketMessage | null;
  error: string | null;
}

// WebSocket configuration – pull from env first, then fall back
const WS_CONFIG = {
  host: (import.meta.env.VITE_WS_HOST as string) || window.location.hostname,
  port: (import.meta.env.VITE_WS_PORT as string) || '3000',
  protocol:
    (import.meta.env.VITE_WS_PROTOCOL as string) ||
    (window.location.protocol === 'https:' ? 'wss' : 'ws'),
};

export function useWebSocket(): WebSocketHook {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!user?.id || !currentTenant?.id) return;

    try {
      const wsUrl = `${WS_CONFIG.protocol}://${WS_CONFIG.host}:${WS_CONFIG.port}?tenantId=${currentTenant.id}&userId=${user.id}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'connection_established':
              console.log('WebSocket connection established:', message.data);
              break;
            case 'subscribed':
              console.log('Subscribed to channels:', message.data.channels);
              break;
            case 'unsubscribed':
              console.log('Unsubscribed from channels:', message.data.channels);
              break;
            case 'error':
              console.error('WebSocket error:', message.data.message);
              setError(message.data.message);
              break;
            default:
              // Handle custom messages
              console.log('Received message:', message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to WebSocket');
    }
  }, [user?.id, currentTenant?.id]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const subscribe = useCallback((channels: string[]) => {
    sendMessage({
      type: 'subscribe',
      data: { channels },
      tenantId: currentTenant?.id,
      userId: user?.id,
    });
  }, [sendMessage, currentTenant?.id, user?.id]);

  const unsubscribe = useCallback((channels: string[]) => {
    sendMessage({
      type: 'unsubscribe',
      data: { channels },
      tenantId: currentTenant?.id,
      userId: user?.id,
    });
  }, [sendMessage, currentTenant?.id, user?.id]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    subscribe,
    unsubscribe,
    lastMessage,
    error,
  };
}

// Hook for subscribing to specific channels
export function useWebSocketChannel(channels: string[]) {
  const { subscribe, unsubscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected && channels.length > 0) {
      subscribe(channels);
      return () => unsubscribe(channels);
    }
  }, [isConnected, channels, subscribe, unsubscribe]);

  return { isConnected };
}

// Hook for real-time updates
export function useRealtimeUpdates<T>(channel: string, initialData: T): T {
  const [data, setData] = useState<T>(initialData);
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    if (isConnected && lastMessage && lastMessage.type === 'update' && lastMessage.data.channel === channel) {
      setData(lastMessage.data.payload);
    }
  }, [lastMessage, channel, isConnected]);

  return data;
} 