'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface FineData {
  amount: number;
  offence: string;
}

export const TrafficFineAlert: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const [activeFine, setActiveFine] = useState<FineData | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const prevFinedRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Formata o código/nome bruto da infração retornado pela telemetria
  const formatOffence = (rawOffence: string) => {
    if (!rawOffence) return 'TRAFFIC VIOLATION';
    const lower = rawOffence.toLowerCase();
    if (lower.includes('speed')) return 'SPEEDING';
    if (lower.includes('red') || lower.includes('light')) return 'RED LIGHT';
    if (lower.includes('crash') || lower.includes('collision')) return 'ACCIDENT / CRASH';
    if (lower.includes('wrong') || lower.includes('way')) return 'WRONG WAY';
    if (lower.includes('rest')) return 'REST REQUIRED';
    return rawOffence.toUpperCase().replace(/_/g, ' ');
  };

  // Simulação no Modo DEMO (Dispara um alerta a cada 14s e esconde após 10s)
  useEffect(() => {
    if (!isDemoMode) return;

    const offences = [
      { amount: 500, offence: 'SPEEDING' },
      { amount: 350, offence: 'RED LIGHT' },
      { amount: 1500, offence: 'ACCIDENT / CRASH' },
    ];
    let idx = 0;

    const interval = setInterval(() => {
      const mockFine = offences[idx % offences.length];
      idx++;

      setActiveFine(mockFine);
      setIsVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // 10 segundos
    }, 14000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // Monitora o evento de multa na telemetria em tempo real
  useEffect(() => {
    if (isDemoMode) return;

    const isFined = Boolean(telemetryData?.fined);
    const amount = telemetryData?.fineAmount ?? 0;
    const offence = telemetryData?.fineOffence ?? '';

    // Dispara apenas na transição (quando fined vira true)
    if (isFined && !prevFinedRef.current && amount > 0) {
      setActiveFine({ amount, offence });
      setIsVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 10000); // Permanência de 10 segundos
    }

    prevFinedRef.current = isFined;
  }, [telemetryData?.fined, telemetryData?.fineAmount, telemetryData?.fineOffence, isDemoMode]);

  // Se não houver multa ativa ou se o tempo de 10s expirou, mostra estado neutro/invisível
  if (!isVisible || !activeFine) {
    return (
      <div className="w-full h-full bg-slate-900/20 border border-slate-800/40 rounded p-1.5 flex items-center justify-center opacity-30 select-none font-mono">
        <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">
          NO INFRACTIONS
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-red-950/90 border-2 border-red-500 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-md font-mono animate-pulse">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Cabeçalho de Alerta */}
      <div className="flex items-center gap-1.5 text-red-400">
        <svg className="w-4 h-4 shrink-0 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-[9px] font-black tracking-wider uppercase text-red-200">
          FINE ISSUED!
        </span>
      </div>

      {/* Descrição da Infração e Valor da Penalidade */}
      <div className="my-auto text-center">
        <span className="text-xs font-black text-white tracking-wide block uppercase">
          {formatOffence(activeFine.offence)}
        </span>
        <span className="text-xl font-black text-red-400 leading-none mt-1 block">
          - € {activeFine.amount.toLocaleString()}
        </span>
      </div>

      {/* Indicador de Status Base */}
      {/* <div className="w-full bg-red-900/50 rounded text-center py-0.5 border border-red-700/50">
        <span className="text-[7px] font-bold text-red-200 uppercase tracking-widest">
          PENALTY DEBITED
        </span>
      </div> */}
    </div>
  );
};
