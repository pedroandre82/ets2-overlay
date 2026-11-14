'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { adaptTelemetryData, NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface TelemetryContextType {
  data: NormalizedTelemetryData | null;
  isConnected: boolean;
  isDemoMode: boolean;
}

const TelemetryContext = createContext<TelemetryContextType>({
  data: null,
  isConnected: false,
  isDemoMode: true,
});

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<NormalizedTelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
          console.log('[TelemetryClient] Conectado ao servidor de telemetria!');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);
            console.log('[TelemetryClient] Payload recebido:', rawData); // <--- LOG DE DEBUG
            // TRADUÇÃO ÚNICA AQUI:
            const normalizedData = adaptTelemetryData(rawData);
            setData(normalizedData);
          } catch (err) {
            console.error('[TelemetryClient] Erro ao decodificar JSON:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const isDemoMode = !isConnected || !data;

  return (
    <TelemetryContext.Provider value={{ data, isConnected, isDemoMode }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);
