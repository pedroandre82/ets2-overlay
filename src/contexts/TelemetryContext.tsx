'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { adaptTelemetryData, NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface TelemetryContextType {
  data: NormalizedTelemetryData | null;
  rawData: any | null;
  isConnected: boolean;
  isDemoMode: boolean;
}

const TelemetryContext = createContext<TelemetryContextType>({
  data: null,
  rawData: null,
  isConnected: false,
  isDemoMode: true,
});

export const TelemetryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<NormalizedTelemetryData | null>(null);
  const [rawData, setRawData] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Ler a variável de ambiente NEXT_PUBLIC_DEMO_MODE para habilitar o modo demo
  const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  useEffect(() => {
    // Se o Modo Demo forçado por env estiver ativo, nem abre conexão WebSocket
    if (envDemoMode) return;

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
            const raw = JSON.parse(event.data);
            setRawData(raw);

            // TRADUÇÃO ÚNICA AQUI:
            const normalizedData = adaptTelemetryData(raw);
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
      if (ws) {
        console.log('[TelemetryClient] Desconectado do servidor de telemetria!');
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      }
    };
  }, [envDemoMode]);

  const isDemoMode = envDemoMode;

  return (
    <TelemetryContext.Provider value={{ data, rawData, isConnected, isDemoMode }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useTelemetry = () => useContext(TelemetryContext);
