'use client';

import React from 'react';
import { GadgetProps } from '@/types/gadget';

interface CruiseControlData {
  enabled: boolean;
  targetSpeed: number; // km/h
}

export const CruiseControl: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Dados do modo Demo (desativado com "--")
  const demoData: CruiseControlData = {
    enabled: false,
    targetSpeed: 0,
  };

  const telemetryData = data as CruiseControlData | undefined;
  const currentData: CruiseControlData = isDemoMode || !telemetryData
    ? demoData
    : {
        enabled: telemetryData.enabled ?? false,
        targetSpeed: telemetryData.targetSpeed ?? 0,
      };

  const isActive = currentData.enabled && currentData.targetSpeed > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none p-2">
      {/* Badge Demo */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">
          DEMO
        </span>
      )}

      {/* Rótulo em Inglês */}
      <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1">
        CRUISE CONTROL
      </span>

      {/* Círculo com tom verde (menor que o SpeedAlert) */}
      <div
        className={`w-20 h-20 rounded-full border-[5px] flex flex-col items-center justify-center transition-colors ${
          isActive
            ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : 'bg-slate-900/60 border-slate-700 text-slate-500'
        }`}
      >
        <span className="text-2xl font-black tracking-tighter leading-none font-sans">
          {isActive ? currentData.targetSpeed : '--'}
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5 font-sans opacity-80">
          km/h
        </span>
      </div>

      {/* Indicador de Estado ON / OFF */}
      <span
        className={`mt-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-widest font-mono ${
          isActive
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            : 'bg-slate-800 text-slate-500 border-slate-700'
        }`}
      >
        {isActive ? 'ON' : 'OFF'}
      </span>
    </div>
  );
};