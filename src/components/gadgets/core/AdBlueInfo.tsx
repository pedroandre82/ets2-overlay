'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface AdBlueData {
  adblueLiters: number;
  adblueCapacityLiters: number;
  adblueWarning: boolean;
}

export const AdBlueInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para simulação no Modo DEMO
  const [demoState, setDemoState] = useState<AdBlueData>({
    adblueLiters: 64,
    adblueCapacityLiters: 80,
    adblueWarning: false,
  });

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => {
        const nextLiters = prev.adblueLiters <= 8 ? 72 : prev.adblueLiters - 14;
        return {
          ...prev,
          adblueLiters: nextLiters,
          adblueWarning: nextLiters <= 12,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: AdBlueData = isDemoMode
    ? demoState
    : {
        adblueLiters: telemetryData?.adblueLiters ?? 0,
        adblueCapacityLiters: telemetryData?.adblueCapacityLiters ?? 0,
        adblueWarning: telemetryData?.adblueWarning ?? false,
      };

  const capacity = currentData.adblueCapacityLiters || 1;
  const pct = Math.min(100, Math.max(0, Math.round((currentData.adblueLiters / capacity) * 100)));
  const isLow = currentData.adblueWarning || pct <= 15;

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Linha Superior: Ícone ISO AdBlue + Título + Status Alerta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Ícone ISO do AdBlue (Bomba/Escapamento + Gotas de Fluido) */}
          <svg
            className={`w-4 h-4 transition-colors ${
              isLow ? 'text-red-400 animate-pulse' : 'text-cyan-400'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Contorno do recipiente / fluido */}
            <path d="M12 2.5L7.5 9A6 6 0 1 0 16.5 9L12 2.5z" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 2.5L7.5 9A6 6 0 1 0 16.5 9L12 2.5z" />
            <path d="M12 11v4" strokeWidth="1.5" />
            <path d="M10 13h4" strokeWidth="1.5" />
          </svg>
          <span className="text-[10px] font-extrabold tracking-wider text-slate-300 uppercase">
            ADBLUE
          </span>
        </div>

        {isLow && (
          <span className="text-[7px] bg-red-500/20 text-red-400 px-1 rounded border border-red-500/30 font-bold animate-pulse">
            LOW
          </span>
        )}
      </div>

      {/* Meio: Leitura Principal do Nível (Litros e Porcentagem) */}
      <div className="flex items-baseline justify-between my-auto px-0.5">
        <div className="flex items-baseline gap-1">
          <span className={`text-base font-black leading-none ${isLow ? 'text-red-400' : 'text-slate-100'}`}>
            {currentData.adblueLiters}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">/ {capacity} L</span>
        </div>

        <span className={`text-xs font-bold ${isLow ? 'text-red-400' : 'text-cyan-400'}`}>
          {pct}%
        </span>
      </div>

      {/* Linha Inferior: Barra de Progresso Fininha (Azul / Ciano) */}
      <div className="w-full space-y-0.5">
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isLow
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
