'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface SpeedAndGearData {
  speedKmh: number;
  speedLimitKmh: number;
  gear: number;
  shifterType: string;
  totalGearsForward: number;
  totalGearsReverse: number;
}

export const SpeedAndGear: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para simulação no Modo DEMO
  const [demoState, setDemoState] = useState<SpeedAndGearData>({
    speedKmh: 78,
    speedLimitKmh: 80,
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
        const nextSpeed = prev.speedKmh >= 92 ? 40 : prev.speedKmh + 6;
        return {
          ...prev,
          gear: nextGear,
          speedKmh: nextSpeed,
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: SpeedAndGearData = isDemoMode
    ? demoState
    : {
        speedKmh: Math.abs(Math.round(telemetryData?.speedKmh ?? 0)),
        speedLimitKmh: Math.round(telemetryData?.speedLimitKmh ?? 0),
        gear: telemetryData?.gear ?? 0,
        shifterType: telemetryData?.shifterType ?? 'automatic',
        totalGearsForward: telemetryData?.totalGearsForward ?? 12,
        totalGearsReverse: telemetryData?.totalGearsReverse ?? 2,
      };

  // Avalia se o caminhão está acima do limite de velocidade da via
  const isSpeeding =
    currentData.speedLimitKmh > 0 && currentData.speedKmh > currentData.speedLimitKmh;

  // Lógica de formatação da marcha
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
        colorClass: 'text-white border-white/60 bg-white/10 font-black animate-pulse',
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
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex flex-col justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Seção Superior: Velocidade Atual (Destaque ampliado + Alerta de Excesso) */}
      <div className="flex-1 flex flex-col items-center justify-center pt-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[7px] font-bold tracking-wider text-slate-400 uppercase">SPEED</span>
          {isSpeeding && (
            <span className="text-[7px] font-bold bg-red-500/20 text-red-400 px-1 rounded border border-red-500/40 animate-pulse">
              EXCEEDED
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-0.5 leading-none mt-1">
          <span
            className={`text-5xl font-black tracking-tight transition-colors duration-200 ${
              isSpeeding ? 'text-red-500 animate-pulse' : 'text-slate-100'
            }`}
          >
            {Math.abs(currentData.speedKmh)}
          </span>
          <span className={`text-[9px] font-bold uppercase ${isSpeeding ? 'text-red-400' : 'text-slate-400'}`}>
            km/h
          </span>
        </div>
      </div>

      {/* Divisor Visual Suave */}
      <div className="w-full h-px bg-slate-800/80 my-0.5" />

      {/* Seção Inferior: Marcha Atual (Card mais compacto) */}
      <div className="flex flex-col items-center justify-center pb-0.5 shrink-0">
        <span className="text-[7px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">GEAR</span>
        <div
          className={`w-14 h-7 rounded flex items-center justify-center border transition-all duration-200 ${gearInfo.colorClass}`}
        >
          <span className="text-base tracking-wider font-extrabold">{gearInfo.label}</span>
        </div>
      </div>
    </div>
  );
};