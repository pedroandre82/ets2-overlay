'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';

interface NavigationData {
  routeDistanceKm: number; // metros
  routeTimeSeconds: number;     // segundos
}

export const NavigationInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const demoData: NavigationData = {
    routeDistanceKm: 842,
    routeTimeSeconds: 35100, // 9h45min
  };

  const telemetryData = data as NavigationData | undefined;
  const currentData: NavigationData = isDemoMode
    ? demoData
    : {
        routeDistanceKm: telemetryData?.routeDistanceKm ?? 0,
        routeTimeSeconds: telemetryData?.routeTimeSeconds ?? 0,
      };

  // Conversões formatadas
  const totalMinutes = Math.round(currentData.routeTimeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm">
      {/* Badge Demo */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-800 pb-1">
        <span className="font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          ROUTE ADVISOR
        </span>
      </div>

      {/* Conteúdo (2 colunas) */}
      <div className="grid grid-cols-2 gap-2 my-auto">
        {/* Distância Restante */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded px-2.5 py-1">
          <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">DISTANCE</span>
            <span className="text-sm font-bold font-mono text-cyan-300 leading-tight">
              {currentData.routeDistanceKm > 0 ? `${currentData.routeDistanceKm.toLocaleString()} km` : '--'}
            </span>
          </div>
        </div>

        {/* Tempo Estimado de Rota/Navegação (GPS) */}
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
              {currentData.routeTimeSeconds > 0 ? `${hours}h ${minutes}m` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
