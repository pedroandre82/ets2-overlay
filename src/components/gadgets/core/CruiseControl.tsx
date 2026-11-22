'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface CruiseControlData {
  cruiseControl: boolean;
  cruiseControlSpeedKmh: number;
  speedKmh: number;
}

export const CruiseControl: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado de memória da última velocidade gravada no Cruise Control
  const [lastSetSpeed, setLastSetSpeed] = useState<number>(80);

  // Estado de simulação para o Modo DEMO
  const [demoState, setDemoState] = useState<CruiseControlData>({
    cruiseControl: true,
    cruiseControlSpeedKmh: 80,
    speedKmh: 78,
  });

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => ({
        ...prev,
        cruiseControl: !prev.cruiseControl,
        cruiseControlSpeedKmh: prev.cruiseControl ? 0 : 80,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: CruiseControlData = isDemoMode
    ? demoState
    : {
        cruiseControl: telemetryData?.cruiseControl ?? false,
        cruiseControlSpeedKmh: Math.round(telemetryData?.cruiseControlSpeedKmh ?? 0),
        speedKmh: Math.round(telemetryData?.speedKmh ?? 0),
      };

  // Mantém em memória a última velocidade válida (> 0)
  useEffect(() => {
    if (currentData.cruiseControlSpeedKmh > 0) {
      setLastSetSpeed(currentData.cruiseControlSpeedKmh);
    }
  }, [currentData.cruiseControlSpeedKmh]);

  const isActive = currentData.cruiseControl;
  const displaySpeed = isActive ? currentData.cruiseControlSpeedKmh : lastSetSpeed;
  const hasMemory = displaySpeed > 0;

  // Alerta de que a velocidade guardada na memória é inferior à velocidade atual do caminhão
  const isSlowerThanCurrent = !isActive && hasMemory && displaySpeed < currentData.speedKmh;

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex flex-col justify-between items-center select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Ícone Arc Circular SVG inspirado no cc sketch.png + Velocidade no Centro */}
      <div className="flex-1 w-full flex items-center justify-center relative my-auto">
        <svg viewBox="0 0 100 100" className="w-24 h-24 max-h-full">
          {/* Arco de Fundo do Mostrador (270°) */}
          <path
            d="M 24.5 75.5 A 36 36 0 1 1 75.5 75.5"
            fill="none"
            stroke={isActive ? '#10b981' : hasMemory ? '#334155' : '#1e293b'}
            strokeWidth="7"
            strokeLinecap="round"
            className="transition-colors duration-300"
          />

          {/* Seta do Piloto Automático Apontando para o Arco */}
          <path
            d="M 76 16 L 64 29 M 64 29 L 72 24 M 64 29 L 68 20"
            fill="none"
            stroke={isActive ? '#10b981' : hasMemory ? '#64748b' : '#334155'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />
        </svg>

        {/* Número da Velocidade no Centro do Arco */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span
            className={`text-2xl font-black tracking-tight leading-none transition-colors duration-300 ${
              isActive
                ? 'text-emerald-400'
                : hasMemory
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            {hasMemory ? displaySpeed : '--'}
          </span>
          <span
            className={`text-[8px] font-bold uppercase mt-0.5 ${
              isActive ? 'text-emerald-500' : 'text-slate-500'
            }`}
          >
            km/h
          </span>
        </div>
      </div>

      {/* Área Inferior: Badge de Status (ACTIVE, SLOWER ou OFF) */}
      <div className="shrink-0 pb-0.5">
        {isActive ? (
          <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse tracking-wider">
            ACTIVE
          </span>
        ) : isSlowerThanCurrent ? (
          <span className="text-[8px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/40 animate-pulse tracking-wider">
            SLOWER
          </span>
        ) : (
          <span className="text-[8px] font-bold bg-slate-950 text-slate-500 px-2 py-0.5 rounded border border-slate-800 tracking-wider">
            OFF
          </span>
        )}
      </div>
    </div>
  );
};