'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

  // Referência em memória para guardar o último snapshot JSON bruto recebido
  const lastRawPayloadRef = useRef<any>(null);

  // Lê a variável de ambiente para decidir se roda em Modo DEMO
  const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // Registra os comandos globais de debug no objeto `window` do navegador
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Retorna o objeto JavaScript no próprio console do F12
      (window as any).getRawTelemetry = () => {
        return lastRawPayloadRef.current;
      };

      // Copia a string JSON formatada direto para a área de transferência (Ctrl + V)
      (window as any).copyRawTelemetry = () => {
        if (!lastRawPayloadRef.current) {
          console.warn('[Telemetry Debug] Nenhum dado bruto recebido ainda.');
          return null;
        }
        const jsonStr = JSON.stringify(lastRawPayloadRef.current, null, 2);
        navigator.clipboard.writeText(jsonStr);
        console.log('📋 Snapshot de telemetria copiado para a área de transferência com sucesso!');
        return lastRawPayloadRef.current;
      };
    }
  }, []);

  useEffect(() => {
    // Se o Modo Demo estiver ativo via env, não conecta o WebSocket real
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

            // 1. Atualiza a referência estática para os comandos de console
            lastRawPayloadRef.current = raw;
            setRawData(raw);

            // 2. Normalização dos dados via adaptador do projeto
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
