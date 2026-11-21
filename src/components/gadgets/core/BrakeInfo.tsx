'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData } from '@/adapters/telemetryAdapter';

interface BrakeData {
  parkBrake: boolean;
  motorBrake: boolean;
  retarderLevel: number;
  retarderSteps: number;
  airPressure: number;
  airPressureWarning: boolean;
  brakeTemperature: number;
  cruiseControl: boolean;
  userBrake: number;
}

// Componente SVG do Símbolo de Freio limpo (sem blur, sem pulse)
const BrakeSymbolIcon = ({
  type,
  isActive,
  activeColor = 'text-red-500',
}: {
  type: 'P' | 'M' | 'RETARDER';
  isActive: boolean;
  activeColor?: string;
}) => {
  const colorClass = isActive ? activeColor : 'text-slate-700';

  return (
    <svg
      className={`w-7 h-7 transition-colors duration-200 ${colorClass}`}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sapatas / Arcos Laterais do Freio (( )) */}
      <path d="M 5 9 A 11 11 0 0 0 5 23" strokeWidth="2.5" />
      <path d="M 27 9 A 11 11 0 0 1 27 23" strokeWidth="2.5" />

      {/* Círculo Central */}
      <circle cx="16" cy="16" r="8" strokeWidth="2" />

      {/* Letra ou Ícone Interno */}
      {type === 'P' && (
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          className="font-black text-[12px] font-sans"
        >
          P
        </text>
      )}

      {type === 'M' && (
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          className="font-black text-[11px] font-sans"
        >
          M
        </text>
      )}

      {type === 'RETARDER' && (
        <text
          x="16"
          y="20.5"
          textAnchor="middle"
          fill="currentColor"
          stroke="none"
          className="font-black text-[13px] font-sans"
        >
          ∞
        </text>
      )}
    </svg>
  );
};

export const BrakeInfo: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado de teste no Modo DEMO
  const [demoState, setDemoState] = useState<BrakeData>({
    parkBrake: false,
    motorBrake: true,
    retarderLevel: 2,
    retarderSteps: 4,
    airPressure: 115,
    airPressureWarning: false,
    brakeTemperature: 185,
    cruiseControl: true,
    userBrake: 0,
  });

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => {
        const nextRetarder = (prev.retarderLevel + 1) % 5;
        const nextTemp = nextRetarder > 0 ? Math.min(310, prev.brakeTemperature + 35) : 85;
        return {
          ...prev,
          retarderLevel: nextRetarder,
          motorBrake: nextRetarder > 0,
          brakeTemperature: nextTemp,
          airPressureWarning: nextTemp > 280,
          parkBrake: nextRetarder === 0,
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: BrakeData = isDemoMode
    ? demoState
    : {
        parkBrake: telemetryData?.parkBrake ?? false,
        motorBrake: telemetryData?.motorBrake ?? false,
        retarderLevel: telemetryData?.retarderLevel ?? 0,
        retarderSteps: telemetryData?.retarderSteps ?? 4,
        airPressure: Math.round(telemetryData?.airPressure ?? 0),
        airPressureWarning: telemetryData?.airPressureWarning ?? false,
        brakeTemperature: Math.round(telemetryData?.brakeTemperature ?? 0),
        cruiseControl: telemetryData?.cruiseControl ?? false,
        userBrake: telemetryData?.userBrake ?? 0,
      };

  const steps = Math.max(1, currentData.retarderSteps);
  const isRetarderActive = currentData.retarderLevel > 0;
  const isAutoBrake =
    (isRetarderActive || currentData.motorBrake) &&
    currentData.cruiseControl &&
    currentData.userBrake === 0;

  // Cor da temperatura
  const temp = currentData.brakeTemperature;
  const tempColorClass =
    temp >= 250
      ? 'text-red-400'
      : temp >= 150
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex items-center gap-1.5 select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* 1. SEÇÃO ESQUERDA (~60%): Freios e Retarder */}
      <div className="w-[60%] h-full flex flex-col justify-between pr-1.5 border-r border-slate-800/80">
        {/* PARTE SUPERIOR: Símbolos P e M + Badge Compartilhada */}
        <div className="flex items-center justify-between h-[36px]">
          <div className="flex items-center gap-2">
            <div title="Parking Brake">
              <BrakeSymbolIcon
                type="P"
                isActive={currentData.parkBrake}
                activeColor="text-red-500"
              />
            </div>
            <div title="Motor Brake">
              <BrakeSymbolIcon
                type="M"
                isActive={currentData.motorBrake}
                activeColor="text-red-500"
              />
            </div>
          </div>

          {/* Badge Única (DEMO no modo demo, AUTO no jogo quando ativado) */}
          <div className="flex items-center justify-end">
            {isDemoMode ? (
              <span className="text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                DEMO
              </span>
            ) : isAutoBrake ? (
              <span className="text-[8px] font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
                AUTO
              </span>
            ) : null}
          </div>
        </div>

        {/* PARTE INFERIOR: Retarder com Barras Flexíveis */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800/80 rounded px-2 py-1 h-[32px] w-full">
          <BrakeSymbolIcon
            type="RETARDER"
            isActive={isRetarderActive}
            activeColor={isAutoBrake ? 'text-cyan-400' : 'text-emerald-400'}
          />
          {/* As barras usam flex-1 para ocupar exatamente o espaço livre sem estourar o layout */}
          <div className="flex gap-1 h-3 flex-1 items-center">
            {Array.from({ length: steps }).map((_, idx) => {
              const stepNum = idx + 1;
              const isFilled = stepNum <= currentData.retarderLevel;
              return (
                <div
                  key={idx}
                  className={`h-full flex-1 rounded-sm transition-all duration-200 ${
                    isFilled
                      ? isAutoBrake
                        ? 'bg-cyan-400'
                        : 'bg-emerald-400'
                      : 'bg-slate-800/80'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. SEÇÃO MEIO (~20%): Pressão do Ar (AIR) */}
      <div className="w-[20%] h-full flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800/80 rounded p-1 border-r border-slate-800/80 shrink-0">
        <span
          className={`text-[8px] font-extrabold uppercase tracking-wider ${
            currentData.airPressureWarning ? 'text-red-400 animate-pulse' : 'text-slate-400'
          }`}
        >
          AIR
        </span>
        <span
          className={`text-xs font-bold leading-tight mt-0.5 whitespace-nowrap ${
            currentData.airPressureWarning
              ? 'text-red-400 font-extrabold animate-pulse'
              : 'text-slate-200'
          }`}
        >
          {currentData.airPressure > 0 ? `${currentData.airPressure} PSI` : '--'}
        </span>
      </div>

      {/* 3. SEÇÃO DIREITA (~20%): Temperatura dos Freios (Termômetro + °C) */}
      <div className="w-[20%] h-full flex flex-col items-center justify-center bg-slate-950/60 border border-slate-800/80 rounded p-1 shrink-0">
        <svg
          className={`w-4 h-4 ${tempColorClass}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
        </svg>
        <span className={`text-xs font-bold leading-tight mt-0.5 whitespace-nowrap ${tempColorClass}`}>
          {temp > 0 ? `${temp}°C` : '--'}
        </span>
      </div>
    </div>
  );
};
