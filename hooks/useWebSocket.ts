'use client';

import { useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface WebSocketMessage {
  type: string;
  data: unknown;
}

interface UseWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

/**
 * Hook useWebSocket - VERSÃO POLLING
 *
 * Substituído WebSocket real por polling HTTP (compatível com Vercel)
 * Mantém a mesma interface para não quebrar componentes existentes
 */
export function useWebSocket(_options: UseWebSocketOptions = {}) {
  // Sempre conectado (polling não desconecta)
  const isConnected = true;

  const send = useCallback((message: WebSocketMessage) => {
    // Polling não envia mensagens (apenas busca)
    console.log('[Polling] Send não implementado:', message);
  }, []);

  const disconnect = useCallback(() => {
    // Polling não desconecta
  }, []);

  const reconnect = useCallback(() => {
    // Polling sempre conectado
  }, []);

  return {
    isConnected,
    send,
    disconnect,
    reconnect,
  };
}
