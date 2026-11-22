'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface NavigationData {
  routeDistanceKm: number;
  routeTimeSeconds: number;
}

export const NavigationInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para controlar o alerta de desvio / aumento de rota
  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);

  // Referências para armazenar a quilometragem anterior e o timer do alerta
  const prevDistanceRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dados simulados para o Modo DEMO
  const [demoState, setDemoState] = useState<NavigationData>({
    routeDistanceKm: 842,
    routeTimeSeconds: 35100, // 9h 45m
  });

  // Simulação no Modo DEMO (Simula uma saída de rota a cada 8 segundos)
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => {
        // Simula um salto repentino na distância (+15 km) indicando erro de percurso
        const newDistance = prev.routeDistanceKm + 15;

        setIsOffRoute(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setIsOffRoute(false);
        }, 2000); // Exibe por 2 segundos

        return {
          ...prev,
          routeDistanceKm: newDistance,
        };
      });
    }, 8000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: NavigationData = isDemoMode
    ? demoState
    : {
        routeDistanceKm: telemetryData?.routeDistanceKm ?? 0,
        routeTimeSeconds: telemetryData?.routeTimeSeconds ?? 0,
      };

  const currentKm = Math.round(currentData.routeDistanceKm);

  // Monitora aumentos na distância em tempo real
  useEffect(() => {
    if (isDemoMode) return;

    const prevKm = prevDistanceRef.current;

    // Se a distância atual for maior que a anterior (e tínhamos uma rota válida > 0)
    if (prevKm > 0 && currentKm > prevKm) {
      setIsOffRoute(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsOffRoute(false);
      }, 2000); // 2 segundos de alerta
    }

    if (currentKm > 0) {
      prevDistanceRef.current = currentKm;
    }
  }, [currentKm, isDemoMode]);

  const hasRoute = isDemoMode || currentData.routeDistanceKm > 0;

  // Formatação de distância e tempo
  const distanceKm = currentKm;
  const totalMinutes = Math.round(currentData.routeTimeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          ROUTE ADVISOR
        </span>

        {isOffRoute && (
          <span className="text-[7px] font-bold bg-red-500/20 text-red-400 px-1 rounded border border-red-500/40 animate-pulse">
            REROUTED
          </span>
        )}
      </div>

      {/* Conteúdo Principal: Distância e Tempo */}
      <div className="grid grid-cols-2 gap-2 my-auto">
        {/* Coluna 1: Distância da Rota (Com Alerta Vermelho Pulsante) */}
        <div
          className={`flex items-center gap-2 rounded px-2.5 py-1 transition-all duration-300 ${
            isOffRoute
              ? 'bg-red-950/90 border-2 border-red-500 animate-pulse'
              : 'bg-slate-950/60 border border-slate-800/80'
          }`}
        >
          <div
            className={`p-1.5 rounded transition-colors ${
              isOffRoute
                ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span
              className={`text-[9px] font-semibold uppercase ${
                isOffRoute ? 'text-red-300' : 'text-slate-400'
              }`}
            >
              DISTANCE
            </span>
            <span
              className={`text-sm font-bold leading-tight ${
                isOffRoute ? 'text-red-200' : 'text-cyan-300'
              }`}
            >
              {hasRoute ? `${distanceKm.toLocaleString()} km` : '--'}
            </span>
          </div>
        </div>

        {/* Coluna 2: Tempo Estimado da Rota (NAV TIME) */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-1">
          <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 uppercase font-semibold">NAV TIME</span>
            <span className="text-sm font-bold text-emerald-400 leading-tight">
              {hasRoute ? `${hours}h ${minutes}m` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
