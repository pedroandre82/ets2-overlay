'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface SpeedAndGearData {
  speedKmh: number;
  gear: number;
  shifterType: string;
  totalGearsForward: number;
  totalGearsReverse: number;
}

export const SpeedAndGear: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para simulação no Modo DEMO
  const [demoState, setDemoState] = useState<SpeedAndGearData>({
    speedKmh: 78,
    gear: 10,
    shifterType: 'automatic',
    totalGearsForward: 14,
    totalGearsReverse: 2,
  });

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => {
        const nextGear = prev.gear >= 4 ? -1 : prev.gear + 1;
        const nextSpeed = Math.min(90, prev.speedKmh + 3);
        return {
          ...prev,
          gear: nextGear,
          speedKmh: nextSpeed >= 90 ? 30 : nextSpeed,
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: SpeedAndGearData = isDemoMode
    ? demoState
    : {
        speedKmh: Math.round(telemetryData?.speedKmh ?? 0),
        gear: telemetryData?.gear ?? 0,
        shifterType: telemetryData?.shifterType ?? 'automatic',
        totalGearsForward: telemetryData?.totalGearsForward ?? 12,
        totalGearsReverse: telemetryData?.totalGearsReverse ?? 2,
      };

  // Lógica de formatação precisa da marcha
  const formatGearDisplay = (
    gear: number,
    shifterType: string,
    totalForward: number,
    totalReverse: number
  ) => {
    if (gear === 0) {
      return {
        label: 'N',
        colorClass: 'text-slate-400 border-slate-700/60 bg-slate-950/40',
      };
    }

    if (gear < 0) {
      const revNum = Math.abs(gear);
      const label = totalReverse >= 2 ? `R${revNum}` : 'R';
      return {
        label,
        colorClass: 'text-red-400 border-red-500/40 bg-red-500/10 font-black animate-pulse',
      };
    }

    const isAuto = shifterType === 'automatic';
    const prefix = isAuto ? 'A' : 'M';

    // Caixa 12+2 (14 marchas à frente): C1 e C2 nas marchas físicas 1 e 2
    if (totalForward === 14) {
      if (gear === 1) return { label: 'C1', colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10 font-black' };
      if (gear === 2) return { label: 'C2', colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10 font-black' };
      const displayGear = gear - 2;
      return {
        label: `${prefix}${displayGear}`,
        colorClass: isAuto
          ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 font-black'
          : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 font-black',
      };
    }

    // Caixa 12+1 (13 marchas à frente): C na marcha física 1
    if (totalForward === 13) {
      if (gear === 1) return { label: 'C', colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10 font-black' };
      const displayGear = gear - 1;
      return {
        label: `${prefix}${displayGear}`,
        colorClass: isAuto
          ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 font-black'
          : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 font-black',
      };
    }

    // Caixa padrão (12, 16, 18 marchas)
    return {
      label: `${prefix}${gear}`,
      colorClass: isAuto
        ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 font-black'
        : 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 font-black',
    };
  };

  const gearInfo = formatGearDisplay(
    currentData.gear,
    currentData.shifterType,
    currentData.totalGearsForward,
    currentData.totalGearsReverse
  );

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-2 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Seção 1: Velocidade Atual (Destaque Superior) */}
      <div className="flex flex-col items-center justify-center pt-1">
        <span className="text-[8px] font-bold tracking-wider text-slate-400 uppercase">SPEED</span>
        <div className="flex items-baseline gap-0.5 leading-none mt-0.5">
          <span className="text-3xl font-black text-slate-100 tracking-tight">
            {Math.abs(currentData.speedKmh)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">km/h</span>
        </div>
      </div>

      {/* Divisor Visual Suave */}
      <div className="w-full h-[1px] bg-slate-800/80 my-1" />

      {/* Seção 2: Marcha Atual (Destaque Inferior em Card) */}
      <div className="flex flex-col items-center justify-center pb-0.5">
        <span className="text-[8px] font-bold tracking-wider text-slate-400 uppercase mb-1">GEAR</span>
        <div
          className={`w-16 h-9 rounded flex items-center justify-center border transition-all duration-200 ${gearInfo.colorClass}`}
        >
          <span className="text-xl tracking-wider font-extrabold">{gearInfo.label}</span>
        </div>
      </div>
    </div>
  );
};
