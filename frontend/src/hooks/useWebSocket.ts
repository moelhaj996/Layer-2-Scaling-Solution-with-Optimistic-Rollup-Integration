import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket<T = unknown>(topic: string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

    const socket = new SockJS(WS_URL);
    const stompClient = new Client({
      webSocketFactory: () => socket as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);

        stompClient.subscribe(`/topic/${topic}`, (message) => {
          try {
            const parsedData = JSON.parse(message.body);
            setData(parsedData);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            setError('Failed to parse message');
          }
        });
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },

      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
        setError(frame.headers['message'] || 'WebSocket error');
        setIsConnected(false);
      },
    });

    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
      }
    };
  }, [topic]);

  return { data, isConnected, error };
}
