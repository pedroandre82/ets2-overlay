'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface NavigationData {
  routeDistanceKm: number;
  routeTimeSeconds: number;
  timeAbs: number; // Minutos absolutos in-game
}

// Dias da semana no padrão do jogo (começando na Segunda-feira - Dia 0)
const DAYS_OF_WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const NavigationInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para alertas de desvio de rota e alteração expressiva do ETA
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);
  const [etaStatus, setEtaStatus] = useState<'gained' | 'lost' | null>(null);

  // Referências para rastrear mudanças sem re-renderizações desnecessárias
  const prevDistanceRef = useRef<number>(0);
  const prevEtaMinutesRef = useRef<number>(0);
  const rerouteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const etaTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Estado simulado para o Modo DEMO
  const [demoState, setDemoState] = useState<NavigationData>({
    routeDistanceKm: 842,
    routeTimeSeconds: 35100, // 9h 45m
    timeAbs: 288155, // Ex: Quarta-feira, 08:35
  });

  // Simulação no Modo DEMO (Ciclo de testes a cada 8 segundos)
  useEffect(() => {
    if (!isDemoMode) return;

    let cycle = 0;
    const interval = setInterval(() => {
      cycle++;
      setDemoState((prev) => {
        if (cycle % 3 === 1) {
          // Teste 1: Aumento de Distância (Reroute)
          setIsOffRoute(true);
          if (rerouteTimerRef.current) clearTimeout(rerouteTimerRef.current);
          rerouteTimerRef.current = setTimeout(() => setIsOffRoute(false), 2000);
          return { ...prev, routeDistanceKm: prev.routeDistanceKm + 15 };
        } else if (cycle % 3 === 2) {
          // Teste 2: Ganhou tempo no ETA (-10 min)
          setEtaStatus('gained');
          if (etaTimerRef.current) clearTimeout(etaTimerRef.current);
          etaTimerRef.current = setTimeout(() => setEtaStatus(null), 2000);
          return { ...prev, routeTimeSeconds: Math.max(0, prev.routeTimeSeconds - 600) };
        } else {
          // Teste 3: Perdeu tempo no ETA (+15 min)
          setEtaStatus('lost');
          if (etaTimerRef.current) clearTimeout(etaTimerRef.current);
          etaTimerRef.current = setTimeout(() => setEtaStatus(null), 2000);
          return { ...prev, routeTimeSeconds: prev.routeTimeSeconds + 900 };
        }
      });
    }, 8000);

    return () => {
      clearInterval(interval);
      if (rerouteTimerRef.current) clearTimeout(rerouteTimerRef.current);
      if (etaTimerRef.current) clearTimeout(etaTimerRef.current);
    };
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // Normalização e extração dos dados
  const currentData: NavigationData = isDemoMode
    ? demoState
    : {
        routeDistanceKm: telemetryData?.routeDistanceKm ?? 0,
        routeTimeSeconds: telemetryData?.routeTimeSeconds ?? 0,
        timeAbs: (telemetryData as any)?.timeAbs ?? (telemetryData as any)?.simulationTime ?? 0,
      };

  const currentKm = Math.round(currentData.routeDistanceKm);
  const routeTimeMin = Math.round(currentData.routeTimeSeconds / 60);
  const currentEtaMinutes = currentData.timeAbs + routeTimeMin;

  // 1. Monitoramento de Aumento de Distância (Aviso de Reroute)
  useEffect(() => {
    if (isDemoMode) return;

    const prevKm = prevDistanceRef.current;
    if (prevKm > 0 && currentKm > prevKm) {
      setIsOffRoute(true);
      if (rerouteTimerRef.current) clearTimeout(rerouteTimerRef.current);
      rerouteTimerRef.current = setTimeout(() => setIsOffRoute(false), 2000);
    }

    if (currentKm > 0) {
      prevDistanceRef.current = currentKm;
    }
  }, [currentKm, isDemoMode]);

  // 2. Monitoramento da Tendência do ETA (Ganho ou Perda de Tempo >= 2 minutos)
  useEffect(() => {
    if (isDemoMode) return;

    const prevEta = prevEtaMinutesRef.current;

    if (prevEta > 0 && currentEtaMinutes > 0) {
      const diff = currentEtaMinutes - prevEta;

      // Dispara sinal visual estático apenas se a alteração for >= 2 minutos
      if (diff >= 2) {
        // Atrasou a chegada (perdeu tempo)
        setEtaStatus('lost');
        if (etaTimerRef.current) clearTimeout(etaTimerRef.current);
        etaTimerRef.current = setTimeout(() => setEtaStatus(null), 2000);
      } else if (diff <= -2) {
        // Adiantou a chegada (ganhou tempo)
        setEtaStatus('gained');
        if (etaTimerRef.current) clearTimeout(etaTimerRef.current);
        etaTimerRef.current = setTimeout(() => setEtaStatus(null), 2000);
      }
    }

    if (currentEtaMinutes > 0) {
      prevEtaMinutesRef.current = currentEtaMinutes;
    }
  }, [currentEtaMinutes, isDemoMode]);

  const hasRoute = isDemoMode || currentData.routeDistanceKm > 0;

  // Formatação de Tempo Restante (Horas e Minutos)
  const hoursRemaining = Math.floor(routeTimeMin / 60);
  const minsRemaining = routeTimeMin % 60;

  // Formatação do ETA (Dia da Semana + Horário in-game)
  let formattedEtaDay = '--';
  let formattedEtaTime = '--';
  if (hasRoute && currentEtaMinutes > 0) {
    const totalDays = Math.floor(currentEtaMinutes / 1440);
    const dayName = DAYS_OF_WEEK[totalDays % 7];
    const minsInDay = Math.floor(currentEtaMinutes % 1440);
    const etaHours = Math.floor(minsInDay / 60);
    const etaMins = minsInDay % 60;

    formattedEtaDay = dayName;
    formattedEtaTime = `${String(etaHours).padStart(2, '0')}:${String(etaMins).padStart(2, '0')}`;
  }

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Header com Título Restaurado */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-0.5 h-4 shrink-0">
        <div className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span className="text-[8px] font-extrabold tracking-wider text-slate-300 uppercase">
            ROUTE ADVISOR
          </span>
        </div>

        {isDemoMode && (
          <span className="text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">
            DEMO
          </span>
        )}
      </div>

      {/* Área Principal: 2 Colunas Espaçosas (REMAINING e ETA) */}
      <div className="flex-1 my-0.5 grid grid-cols-2 gap-1.5 items-center">

        {/* Card 1: REMAINING (Distância + Tempo Restante agrupados) */}
        <div
          className={`flex items-center justify-between rounded px-2.5 py-1 h-full transition-all duration-300 ${
            isOffRoute
              ? 'bg-red-950/90 border border-red-500/80 text-red-200'
              : 'bg-slate-950/60 border border-slate-800/80'
          }`}
        >
          <div className="flex flex-col min-w-0 justify-center w-full">
            <span
              className={`text-[7px] font-bold tracking-wider uppercase truncate ${
                isOffRoute ? 'text-red-300' : 'text-slate-400'
              }`}
            >
              REMAINING
            </span>
            <div className="flex items-baseline justify-between gap-1 mt-0.5 w-full">
              <span className={`text-xs font-black truncate leading-none ${isOffRoute ? 'text-red-200' : 'text-cyan-300'}`}>
                {hasRoute ? `${currentKm.toLocaleString()} km` : '--'}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 truncate leading-none">
                {hasRoute ? `${hoursRemaining}h ${minsRemaining}m` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: ETA (Dia da Semana + Horário) */}
        <div
          className={`flex items-center justify-between rounded px-2.5 py-1 h-full transition-all duration-300 ${
            etaStatus === 'lost'
              ? 'bg-red-950/90 border border-red-500/80'
              : etaStatus === 'gained'
              ? 'bg-emerald-950/90 border border-emerald-500/80'
              : 'bg-slate-950/60 border border-slate-800/80'
          }`}
        >
          <div className="flex flex-col min-w-0 justify-center w-full">
            <span
              className={`text-[7px] font-bold tracking-wider uppercase truncate ${
                etaStatus === 'lost'
                  ? 'text-red-300'
                  : etaStatus === 'gained'
                  ? 'text-emerald-300'
                  : 'text-slate-400'
              }`}
            >
              ETA
            </span>
            <div className="flex items-baseline justify-between mt-0.5 w-full">
              <span
                className={`text-xs font-extrabold uppercase ${
                  etaStatus === 'lost'
                    ? 'text-red-300'
                    : etaStatus === 'gained'
                    ? 'text-emerald-300'
                    : 'text-amber-400'
                }`}
              >
                {hasRoute ? formattedEtaDay : '--'}
              </span>
              <span
                className={`text-sm font-black leading-none ${
                  etaStatus === 'lost'
                    ? 'text-red-200'
                    : etaStatus === 'gained'
                    ? 'text-emerald-200'
                    : 'text-amber-300'
                }`}
              >
                {hasRoute ? formattedEtaTime : '--'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
