'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface CruiseControlData {
  cruiseControl: boolean;
  cruiseControlSpeedKmh: number; // km/h
}

export const CruiseControl: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado dinâmico para alternância no Modo DEMO
  const [demoState, setDemoState] = useState<CruiseControlData>({
    cruiseControl: true,
    cruiseControlSpeedKmh: 80,
  });

  // Alterna automaticamente entre ON (80 km/h) e OFF (0 km/h) a cada 4 segundos no Modo DEMO
  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => ({
        cruiseControl: !prev.cruiseControl,
        cruiseControlSpeedKmh: !prev.cruiseControl ? 80 : 0,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  // Seleção entre os dados dinâmicos do DEMO e os dados reais adaptados
  const currentData: CruiseControlData = isDemoMode
    ? demoState
    : {
        cruiseControl: telemetryData?.cruiseControl ?? false,
        cruiseControlSpeedKmh: telemetryData?.cruiseControlSpeedKmh ?? 0,
      };

  const isActive = currentData.cruiseControl && currentData.cruiseControlSpeedKmh > 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none p-2 bg-slate-900/80 border border-slate-700/60 rounded backdrop-blur-sm">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[8px] font-mono bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Rótulo */}
      <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 uppercase mb-1">
        CRUISE CONTROL
      </span>

      {/* Indicador Círculo */}
      <div
        className={`w-20 h-20 rounded-full border-[5px] flex flex-col items-center justify-center transition-colors duration-300 ${
          isActive
            ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : 'bg-slate-900/60 border-slate-700 text-slate-500'
        }`}
      >
        <span className="text-2xl font-black tracking-tighter leading-none font-sans">
          {isActive ? currentData.cruiseControlSpeedKmh : '--'}
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5 font-sans opacity-80">
          km/h
        </span>
      </div>

      {/* Indicador de Estado ON / OFF */}
      <span
        className={`mt-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase tracking-widest font-mono transition-colors duration-300 ${
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
