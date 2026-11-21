'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface NavigationData {
  routeDistanceKm: number;
  routeTimeSeconds: number;
}

export const NavigationInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Dados simulados para o Modo DEMO (842 km e 9h 45m)
  const demoData: NavigationData = {
    routeDistanceKm: 842,
    routeTimeSeconds: 35100, // 35100s = 585min = 9h 45m
  };

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // demoData entra EXCLUSIVAMENTE se isDemoMode === true
  const currentData: NavigationData = isDemoMode
    ? demoData
    : {
        routeDistanceKm: telemetryData?.routeDistanceKm ?? 0,
        routeTimeSeconds: telemetryData?.routeTimeSeconds ?? 0,
      };

  const hasRoute = isDemoMode || currentData.routeDistanceKm > 0;

  // Formatação de distância e tempo
  const distanceKm = Math.round(currentData.routeDistanceKm);
  const totalMinutes = Math.round(currentData.routeTimeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          ROUTE ADVISOR
        </span>
      </div>

      {/* Conteúdo Principal: Distância e Tempo */}
      <div className="grid grid-cols-2 gap-2 my-auto">
        {/* Coluna 1: Distância da Rota */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-1">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">DISTANCE</span>
            <span className="text-sm font-bold font-mono text-cyan-300 leading-tight">
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
            <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">NAV TIME</span>
            <span className="text-sm font-bold font-mono text-emerald-400 leading-tight">
              {hasRoute ? `${hours}h ${minutes}m` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};