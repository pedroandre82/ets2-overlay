'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

export const NextRestStop: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  const demoData = {
    nextRestStop: 510, // 8h 30m no modo demo
  };

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // 1. Define o valor bruto a ser utilizado
  const currentMinutes = isDemoMode
    ? demoData.nextRestStop
    : telemetryData?.nextRestStopMin;

  // 2. Valida se o dado existe
  const hasData = currentMinutes !== undefined && currentMinutes !== null;

  // 3. Formatação
  const totalMins = hasData ? Math.max(0, currentMinutes) : 0;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  // Estados de alerta
  const isWarning = hasData && totalMins > 0 && totalMins <= 120;
  const isUrgent = hasData && totalMins === 0;

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm">
      {/* Badge Demo */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
        <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
          </svg>
          REST STOP
        </span>
      </div>

      {/* Display */}
      <div className="flex items-center justify-between my-auto px-1 font-mono">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-400 font-semibold uppercase">REST IN:</span>
          <span
            className={`text-base font-bold font-mono leading-tight ${
              !hasData
                ? 'text-slate-500'
                : isUrgent
                ? 'text-red-500 animate-pulse'
                : isWarning
                ? 'text-amber-400 animate-pulse'
                : 'text-emerald-400'
            }`}
          >
            {hasData ? `${hours}h ${mins}m` : '--'}
          </span>
        </div>

        <div
          className={`p-1.5 rounded border ${
            !hasData
              ? 'bg-slate-800/50 border-slate-700/50 text-slate-500'
              : isUrgent
              ? 'bg-red-500/20 border-red-500/40 text-red-400'
              : isWarning
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
          </svg>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex items-center justify-between text-[9px] font-mono border-t border-slate-800/80 pt-1">
        <span className="text-slate-400 uppercase">STATUS:</span>
        <span
          className={`font-bold ${
            !hasData
              ? 'text-slate-500'
              : isUrgent
              ? 'text-red-400'
              : isWarning
              ? 'text-amber-400'
              : 'text-slate-300'
          }`}
        >
          {hasData ? (isUrgent ? 'REST NOW' : isWarning ? 'REST SOON' : 'OK') : '--'}
        </span>
      </div>
    </div>
  );
};