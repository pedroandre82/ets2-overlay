'use client';

import React, { useState, useEffect } from 'react';
import { GadgetProps } from '@/types/gadget';
import { NormalizedTelemetryData, WheelData } from '@/adapters/telemetryAdapter';

interface TruckDiagnosticsData {
  truckBrand: string;
  truckName: string;
  truckLicensePlate: string;
  truckLicensePlateCountry: string;
  truckLicensePlateCountryId: string;
  odometerKm: number;
  speedKmh: number;
  wearEnginePct: number;
  wearTransmissionPct: number;
  wearCabinPct: number;
  wearChassisPct: number;
  wearWheelsPct: number;
  liftAxle: boolean;
  differentialLock: boolean;
  truckWheels: WheelData[];
}

export const TruckDiagnostics: React.FC<GadgetProps> = ({ isDemoMode = false, data }) => {
  // Estado para simulação no Modo DEMO (Chassi 6x2 com 6 rodas)
  const [demoState, setDemoState] = useState<TruckDiagnosticsData>({
    truckBrand: 'Volvo',
    truckName: 'FH16 750',
    truckLicensePlate: 'MX62 SGK',
    truckLicensePlateCountry: 'United Kingdom',
    truckLicensePlateCountryId: 'uk',
    odometerKm: 142850,
    speedKmh: 65,
    wearEnginePct: 2,
    wearTransmissionPct: 1,
    wearCabinPct: 0,
    wearChassisPct: 4,
    wearWheelsPct: 18, // Pneu > 15% dispara SERVICE
    liftAxle: false,
    differentialLock: false,
    truckWheels: [
      { radius: 0.5, positionX: -1, positionY: 0, positionZ: 1, suspDeflection: 0, velocity: 0, steering: 0.1, rotation: 0, lift: 0, liftOffset: 0, steerable: true, simulated: true, powered: false, liftable: false, onGround: true, substance: 1 },
      { radius: 0.5, positionX: 1, positionY: 0, positionZ: 1, suspDeflection: 0, velocity: 0, steering: 0.1, rotation: 0, lift: 0, liftOffset: 0, steerable: true, simulated: true, powered: false, liftable: false, onGround: true, substance: 1 },
      { radius: 0.5, positionX: -1, positionY: 0, positionZ: -1, suspDeflection: 0, velocity: 0, steering: 0, rotation: 0, lift: 0, liftOffset: 0, steerable: false, simulated: true, powered: true, liftable: false, onGround: true, substance: 1 },
      { radius: 0.5, positionX: 1, positionY: 0, positionZ: -1, suspDeflection: 0, velocity: 0, steering: 0, rotation: 0, lift: 0, liftOffset: 0, steerable: false, simulated: true, powered: true, liftable: false, onGround: true, substance: 1 },
      { radius: 0.5, positionX: -1, positionY: 0, positionZ: -2, suspDeflection: 0, velocity: 0, steering: 0, rotation: 0, lift: 0, liftOffset: 0, steerable: false, simulated: true, powered: false, liftable: true, onGround: false, substance: 1 }, // Roda descolando no demo
      { radius: 0.5, positionX: 1, positionY: 0, positionZ: -2, suspDeflection: 0, velocity: 0, steering: 0, rotation: 0, lift: 0, liftOffset: 0, steerable: false, simulated: true, powered: false, liftable: true, onGround: true, substance: 1 },
    ],
  });

  useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setDemoState((prev) => ({
        ...prev,
        liftAxle: !prev.liftAxle,
        truckWheels: prev.truckWheels.map((w, idx) =>
          idx === 4 ? { ...w, onGround: prev.liftAxle } : w
        ),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  const telemetryData = data as NormalizedTelemetryData | undefined;

  const currentData: TruckDiagnosticsData = isDemoMode
    ? demoState
    : {
        truckBrand: telemetryData?.truckBrand ?? 'Truck',
        truckName: telemetryData?.truckName ?? '',
        truckLicensePlate: telemetryData?.truckLicensePlate ?? '',
        truckLicensePlateCountry: telemetryData?.truckLicensePlateCountry ?? '',
        truckLicensePlateCountryId: telemetryData?.truckLicensePlateCountryId ?? 'uk',
        odometerKm: Math.round(telemetryData?.odometerKm ?? 0),
        speedKmh: Math.round(telemetryData?.speedKmh ?? 0),
        wearEnginePct: telemetryData?.wearEnginePct ?? 0,
        wearTransmissionPct: telemetryData?.wearTransmissionPct ?? 0,
        wearCabinPct: telemetryData?.wearCabinPct ?? 0,
        wearChassisPct: telemetryData?.wearChassisPct ?? 0,
        wearWheelsPct: telemetryData?.wearWheelsPct ?? 0,
        liftAxle: telemetryData?.liftAxle ?? false,
        differentialLock: telemetryData?.differentialLock ?? false,
        truckWheels: telemetryData?.truckWheels ?? [],
      };

  // Avaliação de alerta de manutenção (> 15% em qualquer componente)
  const maxWear = Math.max(
    currentData.wearEnginePct,
    currentData.wearTransmissionPct,
    currentData.wearCabinPct,
    currentData.wearChassisPct,
    currentData.wearWheelsPct
  );
  const needsService = maxWear >= 15;

  // Análise de rodas descoladas do chão em movimento (excluindo eixos propositalmente elevados)
  const isMoving = currentData.speedKmh > 5;
  const wheelsWithLiftRisk = currentData.truckWheels.filter((w) => {
    const isPneumaticLifted = (w.lift ?? 0) > 0.1 || (w.liftable && currentData.liftAxle);
    return !w.onGround && !isPneumaticLifted && isMoving;
  });
  const hasWheelLiftAlert = wheelsWithLiftRisk.length > 0;

  // Formatação dos eixos (4x2, 6x2, 6x4, 8x4)
  const wheelCount = currentData.truckWheels.length || 4;
  const poweredCount = currentData.truckWheels.filter((w) => w.powered).length || 2;
  const chassisConfigLabel = `${wheelCount}x${poweredCount}`;

  // Agrupamento das rodas em pares de eixos (esquerda / direita)
  const axles: { left?: WheelData; right?: WheelData }[] = [];
  for (let i = 0; i < currentData.truckWheels.length; i += 2) {
    axles.push({
      left: currentData.truckWheels[i],
      right: currentData.truckWheels[i + 1],
    });
  }

  return (
    <div className="w-full h-full bg-slate-900/80 border border-slate-700/60 rounded p-1.5 flex items-center justify-between select-none relative overflow-hidden backdrop-blur-sm font-mono">
      {/* Badge DEMO */}
      {isDemoMode && (
        <span className="absolute top-1 right-1 text-[7px] font-bold bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30 z-10">
          DEMO
        </span>
      )}

      {/* Coluna 1: Identificação do Veículo & Odômetro (Largura ~30%) */}
      <div className="w-[30%] h-full flex flex-col justify-between border-r border-slate-800 pr-1.5">
        <div>
          {/* <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider block">VEHICLE</span> */}
          <div className="text-xs font-black text-slate-100 truncate leading-tight">
            {currentData.truckBrand}
          </div>
          <div className="text-[9px] font-bold text-cyan-400 truncate">
            {currentData.truckName || '--'}
          </div>
        </div>

        {/* Placa com estilo de crachá europeu */}
        {currentData.truckLicensePlate && (
          <div className="inline-flex items-center gap-1 bg-slate-950 border border-slate-700/80 rounded px-1 py-0.5 w-fit">
            <span className="text-[7px] font-bold bg-blue-600 text-white px-0.5 rounded-sm uppercase">
              {currentData.truckLicensePlateCountryId || 'EU'}
            </span>
            <span className="text-[8px] font-extrabold text-slate-200 tracking-wider">
              {currentData.truckLicensePlate}
            </span>
          </div>
        )}

        {/* Odômetro */}
        <div className="text-[8px] text-slate-400 font-bold flex items-center gap-1">
          <span className="text-slate-500">ODO:</span>
          <span className="text-slate-300">{currentData.odometerKm.toLocaleString()} km</span>
        </div>
      </div>

      {/* Coluna 2: Esquema do Chassi SVG (Top-Down) & Status (Largura ~42%) */}
      <div className="w-[42%] h-full flex flex-col justify-between items-center px-1 border-r border-slate-800">
        {/* Badges de Status do Chassi */}
        <div className="w-full flex items-center justify-between text-[7px] font-bold">
          <span className="text-slate-400 font-extrabold">{chassisConfigLabel}</span>

          <div className="flex items-center gap-1">
            {hasWheelLiftAlert && (
              <span className="bg-red-500/20 text-red-400 px-1 rounded border border-red-500/40 animate-pulse">
                WHEEL LIFT
              </span>
            )}
            {currentData.liftAxle && !hasWheelLiftAlert && (
              <span className="bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/40">
                LIFTED
              </span>
            )}
            {currentData.differentialLock && (
              <span className="bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/40">
                DIFF LOCK
              </span>
            )}
          </div>
        </div>

        {/* Desenho do Chassi Top-Down em SVG */}
        <div className="w-full flex-1 flex items-center justify-center my-0.5">
          <svg viewBox="0 0 120 45" className="w-full h-full max-h-[42px]">
            {/* Longarinas Principais do Chassi */}
            <rect x="35" y="10" width="50" height="25" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
            <line x1="35" y1="22.5" x2="85" y2="22.5" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />

            {/* Cabine (Frente na Esquerda) */}
            <path d="M 22 10 L 35 10 L 35 35 L 22 35 C 18 35 18 10 22 10 Z" fill="#1e293b" stroke="#475569" strokeWidth="1" />

            {/* Renderização Dinâmica dos Eixos e Rodas */}
            {axles.map((axle, idx) => {
              const totalAxles = axles.length || 2;
              const startX = 30;
              const spacing = totalAxles > 1 ? 50 / (totalAxles - 1) : 0;
              const posX = startX + idx * spacing;

              const renderWheel = (w?: WheelData, isLeft: boolean = true) => {
                if (!w) return null;
                const posY = isLeft ? 33 : 4;
                const isLifted = (w.lift ?? 0) > 0.1 || (w.liftable && currentData.liftAxle);
                const isOffGroundRisk = !w.onGround && !isLifted && isMoving;

                let fillClass = 'fill-slate-700 stroke-slate-500';
                if (isOffGroundRisk) {
                  fillClass = 'fill-red-500 stroke-red-400 animate-pulse';
                } else if (isLifted) {
                  fillClass = 'fill-slate-900 stroke-slate-800';
                } else if (w.powered) {
                  fillClass = 'fill-cyan-500/40 stroke-cyan-400';
                }

                return (
                  <rect
                    x={posX - 4}
                    y={posY}
                    width="8"
                    height="8"
                    rx="1.5"
                    className={fillClass}
                    strokeWidth="1.2"
                  />
                );
              };

              return (
                <g key={idx}>
                  {/* Linha do Eixo Físico */}
                  <line x1={posX} y1="10" x2={posX} y2="35" stroke="#475569" strokeWidth="1.5" />
                  {renderWheel(axle.left, true)}
                  {renderWheel(axle.right, false)}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Coluna 3: Diagnóstico de Danos e Manutenção (Largura ~28%) */}
      <div className="w-[28%] h-full flex flex-col justify-between pl-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wider">WEAR</span>
          {needsService && (
            <span className="text-[6px] font-extrabold bg-red-500/20 text-red-400 px-1 rounded border border-red-500/40 animate-pulse">
              SERVICE
            </span>
          )}
        </div>

        {/* Lista de Componentes */}
        <div className="space-y-0.5 text-[7px] font-bold">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">ENG</span>
            <span className={currentData.wearEnginePct >= 15 ? 'text-red-400' : 'text-slate-200'}>
              {currentData.wearEnginePct}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">TRN</span>
            <span className={currentData.wearTransmissionPct >= 15 ? 'text-red-400' : 'text-slate-200'}>
              {currentData.wearTransmissionPct}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CAB</span>
            <span className={currentData.wearCabinPct >= 15 ? 'text-red-400' : 'text-slate-200'}>
              {currentData.wearCabinPct}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CHS</span>
            <span className={currentData.wearChassisPct >= 15 ? 'text-red-400' : 'text-slate-200'}>
              {currentData.wearChassisPct}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">WHL</span>
            <span className={currentData.wearWheelsPct >= 15 ? 'text-red-400' : 'text-slate-200'}>
              {currentData.wearWheelsPct}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};